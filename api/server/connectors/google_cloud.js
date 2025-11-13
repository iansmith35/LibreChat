
const express = require('express');
const multer = require('multer');
const { requireJwtAuth } = require('~/server/middleware');

const router = express.Router();

// Configure multer for audio uploads (10MB limit)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  },
});

// Default voice mapping: 'Vale' -> en-GB-Wavenet-F
const DEFAULT_VOICE_NAME = 'Vale';
const DEFAULT_VOICE_CONFIG = {
  languageCode: 'en-GB',
  name: 'en-GB-Wavenet-F',
  ssmlGender: 'FEMALE',
};

// Get voice configuration from env or use default
function getVoiceConfig() {
  const envVoice = process.env.TTS_DEFAULT_VOICE;
  if (envVoice) {
    // Parse format: languageCode:name:ssmlGender (e.g., "en-US:en-US-Wavenet-A:MALE")
    const parts = envVoice.split(':');
    if (parts.length === 3) {
      return {
        languageCode: parts[0],
        name: parts[1],
        ssmlGender: parts[2],
      };
    }
  }
  return DEFAULT_VOICE_CONFIG;
}

/**
 * Initialize Google Cloud clients
 */
function initializeGoogleCloudClients() {
  const hasCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_CLOUD_KEY;

  if (!hasCredentials) {
    return { enabled: false, message: 'Google Cloud credentials not configured' };
  }

  try {
    // Lazy-load the Google Cloud libraries
    const speech = require('@google-cloud/speech');
    const textToSpeech = require('@google-cloud/text-to-speech');

    let clientConfig = {};

    // If GOOGLE_CLOUD_KEY is provided (JSON string), use it
    if (process.env.GOOGLE_CLOUD_KEY) {
      try {
        const credentials = JSON.parse(process.env.GOOGLE_CLOUD_KEY);
        clientConfig = { credentials };
      } catch (error) {
        console.error('[GoogleCloud] Error parsing GOOGLE_CLOUD_KEY:', error);
        return { enabled: false, message: 'Invalid GOOGLE_CLOUD_KEY format' };
      }
    }
    // Otherwise, rely on GOOGLE_APPLICATION_CREDENTIALS env var

    const speechClient = new speech.SpeechClient(clientConfig);
    const ttsClient = new textToSpeech.TextToSpeechClient(clientConfig);

    return {
      enabled: true,
      speechClient,
      ttsClient,
    };
  } catch (error) {
    console.error('[GoogleCloud] Error initializing clients:', error);
    return { enabled: false, message: 'Failed to initialize Google Cloud clients', error };
  }
}

// Initialize clients once
const googleCloudClients = initializeGoogleCloudClients();

/**
 * POST /api/speech/stt
 * Speech-to-Text endpoint
 */
router.post('/stt', requireJwtAuth, upload.single('audio'), async (req, res) => {
  if (!googleCloudClients.enabled) {
    return res.status(501).json({
      message: 'Speech-to-Text service not available',
      instructions: 'Set GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_CLOUD_KEY environment variable',
      details: googleCloudClients.message,
    });
  }

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Audio file is required' });
    }

    const audioBytes = req.file.buffer.toString('base64');
    const languageCode = req.body.languageCode || 'en-US';

    const request = {
      audio: {
        content: audioBytes,
      },
      config: {
        encoding: 'WEBM_OPUS', // Default, can be overridden
        sampleRateHertz: 48000,
        languageCode: languageCode,
        enableAutomaticPunctuation: true,
      },
    };

    const [response] = await googleCloudClients.speechClient.recognize(request);

    const transcription = response.results
      .map((result) => result.alternatives[0].transcript)
      .join('\n');


    res.json({
      transcript: transcription,
      confidence: response.results[0]?.alternatives[0]?.confidence || 0,
    });
  } catch (error) {
    console.error('[GoogleCloud STT] Error:', error);
    res.status(500).json({ message: 'Speech-to-Text failed', error: error.message });
  }
});

/**
 * POST /api/speech/tts
 * Text-to-Speech endpoint
 */
router.post('/tts', requireJwtAuth, async (req, res) => {
  if (!googleCloudClients.enabled) {
    return res.status(501).json({
      message: 'Text-to-Speech service not available',
      instructions: 'Set GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_CLOUD_KEY environment variable',
      details: googleCloudClients.message,
    });
  }

  try {
    const { text, voiceName } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ message: 'text is required and must be a string' });
    }

    // Use default voice config or custom voice
    let voiceConfig = getVoiceConfig();

    // If voiceName is 'Vale' or not provided, use default
    if (!voiceName || voiceName === DEFAULT_VOICE_NAME) {
      voiceConfig = getVoiceConfig();
    }

    const request = {
      input: { text: text },
      voice: voiceConfig,
      audioConfig: { audioEncoding: 'MP3' },
    };

    const [response] = await googleCloudClients.ttsClient.synthesizeSpeech(request);

    // Return audio as base64
    const audioContent = response.audioContent.toString('base64');

    res.json({
      audio: audioContent,
      format: 'mp3',
      voiceName: voiceConfig.name,
    });
  } catch (error) {
    console.error('[GoogleCloud TTS] Error:', error);
    res.status(500).json({ message: 'Text-to-Speech failed', error: error.message });
  }
});

/**
 * GET /api/speech/status
 * Check if speech services are available
 */
router.get('/status', requireJwtAuth, async (req, res) => {
  res.json({
    enabled: googleCloudClients.enabled,
    message: googleCloudClients.message || 'Speech services are available',
    defaultVoice: {
      name: DEFAULT_VOICE_NAME,
      config: getVoiceConfig(),
    },
  });
});

module.exports = router;
