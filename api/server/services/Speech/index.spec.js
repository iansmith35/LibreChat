const { isGoogleCloudConfigured, transcribeAudio } = require('./googleCloudSTT');
const { synthesizeSpeech, listVoices } = require('./googleCloudTTS');

describe('Google Cloud Speech Services', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Clear environment variables before each test
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    delete process.env.GOOGLE_CLOUD_KEY;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Google Cloud STT', () => {
    describe('isGoogleCloudConfigured', () => {
      it('should return false when no credentials are set', () => {
        expect(isGoogleCloudConfigured()).toBe(false);
      });

      it('should return true when GOOGLE_APPLICATION_CREDENTIALS is set', () => {
        process.env.GOOGLE_APPLICATION_CREDENTIALS = '/path/to/credentials.json';
        expect(isGoogleCloudConfigured()).toBe(true);
      });

      it('should return true when GOOGLE_CLOUD_KEY is set', () => {
        process.env.GOOGLE_CLOUD_KEY = '{"type":"service_account"}';
        expect(isGoogleCloudConfigured()).toBe(true);
      });
    });

    describe('transcribeAudio', () => {
      it('should throw error when not configured', async () => {
        const audioBuffer = Buffer.from('fake audio data');
        await expect(transcribeAudio(audioBuffer, 'en-US')).rejects.toThrow(
          /Google Cloud Speech-to-Text is not configured/,
        );
      });

      it('should throw scaffold error when configured but not implemented', async () => {
        process.env.GOOGLE_APPLICATION_CREDENTIALS = '/path/to/credentials.json';
        const audioBuffer = Buffer.from('fake audio data');
        
        await expect(transcribeAudio(audioBuffer, 'en-US')).rejects.toThrow(
          /scaffolded but not yet implemented/,
        );
      });
    });
  });

  describe('Google Cloud TTS', () => {
    describe('synthesizeSpeech', () => {
      it('should throw error when not configured', async () => {
        await expect(synthesizeSpeech('Hello world', 'en-US-Standard-A', 'en-US')).rejects.toThrow(
          /Google Cloud Text-to-Speech is not configured/,
        );
      });

      it('should throw scaffold error when configured but not implemented', async () => {
        process.env.GOOGLE_CLOUD_KEY = '{"type":"service_account"}';
        
        await expect(synthesizeSpeech('Hello world', 'en-US-Standard-A', 'en-US')).rejects.toThrow(
          /scaffolded but not yet implemented/,
        );
      });
    });

    describe('listVoices', () => {
      it('should throw error when not configured', async () => {
        await expect(listVoices()).rejects.toThrow(
          /Google Cloud Text-to-Speech is not configured/,
        );
      });

      it('should return empty array when configured but not implemented', async () => {
        process.env.GOOGLE_APPLICATION_CREDENTIALS = '/path/to/credentials.json';
        const voices = await listVoices();
        expect(Array.isArray(voices)).toBe(true);
        expect(voices.length).toBe(0);
      });
    });
  });
});
