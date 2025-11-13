const { logger } = require('@librechat/data-schemas');

let speech = null;
let textToSpeech = null;

/**
 * Initialize Google Cloud Speech clients
 */
function initializeClients() {
  if (speech && textToSpeech) {
    return { speech, textToSpeech };
  }

  try {
    // Try to load Google Cloud libraries
    const SpeechClient = require('@google-cloud/speech').SpeechClient;
    const TextToSpeechClient = require('@google-cloud/text-to-speech').TextToSpeechClient;

    // Initialize with credentials from environment
    const config = {};
    
    if (process.env.GOOGLE_CLOUD_KEY) {
      // If GOOGLE_CLOUD_KEY is provided as a JSON string
      try {
        config.credentials = JSON.parse(process.env.GOOGLE_CLOUD_KEY);
      } catch (error) {
        logger.warn('[GoogleCloud] GOOGLE_CLOUD_KEY is not valid JSON, falling back to GOOGLE_APPLICATION_CREDENTIALS');
      }
    }
    // Otherwise will use GOOGLE_APPLICATION_CREDENTIALS env var automatically

    speech = new SpeechClient(config);
    textToSpeech = new TextToSpeechClient(config);
    
    logger.info('[GoogleCloud] Successfully initialized Google Cloud Speech clients');
    return { speech, textToSpeech };
  } catch (error) {
    logger.error('[GoogleCloud] Error initializing Google Cloud clients:', error);
    return { speech: null, textToSpeech: null };
  }
}

/**
 * Check if Google Cloud is configured
 */
function isConfigured() {
  return !!(process.env.GOOGLE_CLOUD_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS);
}

/**
 * Transcribe audio using Google Cloud Speech-to-Text
 * @param {Buffer} audioBuffer - Audio data buffer
 * @param {Object} options - Transcription options
 * @returns {Promise<string>} Transcript text
 */
async function transcribeAudio(audioBuffer, options = {}) {
  const { speech } = initializeClients();
  
  if (!speech) {
    throw new Error('Google Cloud Speech-to-Text is not configured. Please set GOOGLE_CLOUD_KEY or GOOGLE_APPLICATION_CREDENTIALS environment variable.');
  }

  try {
    const audio = {
      content: audioBuffer.toString('base64'),
    };

    const config = {
      encoding: options.encoding || 'WEBM_OPUS',
      sampleRateHertz: options.sampleRateHertz || 48000,
      languageCode: options.languageCode || 'en-US',
      enableAutomaticPunctuation: true,
    };

    const request = {
      audio: audio,
      config: config,
    };

    const [response] = await speech.recognize(request);
    const transcription = response.results
      .map((result) => result.alternatives[0].transcript)
      .join('\n');

    return transcription;
  } catch (error) {
    logger.error('[GoogleCloud] Error transcribing audio:', error);
    throw error;
  }
}

/**
 * Synthesize speech from text using Google Cloud Text-to-Speech
 * @param {string} text - Text to synthesize
 * @param {Object} options - Synthesis options
 * @returns {Promise<Buffer>} Audio data buffer
 */
async function synthesizeSpeech(text, options = {}) {
  const { textToSpeech } = initializeClients();
  
  if (!textToSpeech) {
    throw new Error('Google Cloud Text-to-Speech is not configured. Please set GOOGLE_CLOUD_KEY or GOOGLE_APPLICATION_CREDENTIALS environment variable.');
  }

  try {
    const request = {
      input: { text: text },
      voice: {
        languageCode: options.languageCode || 'en-US',
        name: options.voiceName || 'en-US-Neural2-C',
        ssmlGender: options.ssmlGender || 'NEUTRAL',
      },
      audioConfig: {
        audioEncoding: options.audioEncoding || 'MP3',
        speakingRate: options.speakingRate || 1.0,
        pitch: options.pitch || 0.0,
      },
    };

    const [response] = await textToSpeech.synthesizeSpeech(request);
    return response.audioContent;
  } catch (error) {
    logger.error('[GoogleCloud] Error synthesizing speech:', error);
    throw error;
  }
}

module.exports = {
  isConfigured,
  transcribeAudio,
  synthesizeSpeech,
};
