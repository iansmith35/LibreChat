const express = require('express');
const router = express.Router();
const multer = require('multer');
const { requireJwtAuth } = require('../middleware');
const { logger } = require('@librechat/data-schemas');
const googleCloud = require('../connectors/google_cloud');

// Configure multer for audio uploads (max 10MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

/**
 * Speech-to-Text endpoint
 * POST /api/speech/stt
 * Accepts audio file and returns transcript
 */
router.post('/stt', requireJwtAuth, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Check if Google Cloud is configured
    if (!googleCloud.isConfigured()) {
      return res.status(501).json({
        error: 'Speech-to-Text service is not configured. Please set GOOGLE_CLOUD_KEY or GOOGLE_APPLICATION_CREDENTIALS environment variable.',
        fallbackMessage: 'Configure Google Cloud credentials to enable speech recognition.',
      });
    }

    // Get optional parameters from request
    const options = {
      encoding: req.body.encoding || 'WEBM_OPUS',
      sampleRateHertz: parseInt(req.body.sampleRateHertz) || 48000,
      languageCode: req.body.languageCode || 'en-US',
    };

    const transcript = await googleCloud.transcribeAudio(req.file.buffer, options);

    res.json({
      transcript,
      success: true,
    });
  } catch (error) {
    logger.error('[Speech API] Error in speech-to-text:', error);
    res.status(500).json({
      error: 'Failed to transcribe audio',
      message: error.message,
    });
  }
});

/**
 * Text-to-Speech endpoint
 * POST /api/speech/tts
 * Accepts text and returns audio
 */
router.post('/tts', requireJwtAuth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }

    // Check if Google Cloud is configured
    if (!googleCloud.isConfigured()) {
      return res.status(501).json({
        error: 'Text-to-Speech service is not configured. Please set GOOGLE_CLOUD_KEY or GOOGLE_APPLICATION_CREDENTIALS environment variable.',
        fallbackMessage: 'Configure Google Cloud credentials to enable speech synthesis.',
      });
    }

    // Get optional parameters from request
    const options = {
      languageCode: req.body.languageCode || 'en-US',
      voiceName: req.body.voiceName || 'en-US-Neural2-C',
      ssmlGender: req.body.ssmlGender || 'NEUTRAL',
      audioEncoding: req.body.audioEncoding || 'MP3',
      speakingRate: parseFloat(req.body.speakingRate) || 1.0,
      pitch: parseFloat(req.body.pitch) || 0.0,
    };

    const audioContent = await googleCloud.synthesizeSpeech(text, options);

    // Set appropriate headers for audio
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioContent.length,
    });

    res.send(audioContent);
  } catch (error) {
    logger.error('[Speech API] Error in text-to-speech:', error);
    res.status(500).json({
      error: 'Failed to synthesize speech',
      message: error.message,
    });
  }
});

/**
 * Check speech service status
 * GET /api/speech/status
 */
router.get('/status', requireJwtAuth, async (req, res) => {
  try {
    const configured = googleCloud.isConfigured();
    res.json({
      configured,
      stt: configured,
      tts: configured,
      provider: configured ? 'Google Cloud' : 'None',
    });
  } catch (error) {
    logger.error('[Speech API] Error checking status:', error);
    res.status(500).json({ error: 'Failed to check service status' });
  }
});

module.exports = router;
