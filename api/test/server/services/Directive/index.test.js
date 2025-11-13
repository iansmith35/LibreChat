const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { 
  getDirective, 
  saveDirective, 
  deleteDirective 
} = require('~/server/services/Directive');

describe('Directive Service', () => {
  let testStorePath;
  let originalPath;

  beforeAll(() => {
    // Use a temporary directory for tests
    testStorePath = path.join(os.tmpdir(), 'librechat-test-directives');
    originalPath = process.env.DIRECTIVE_STORE_PATH;
    process.env.DIRECTIVE_STORE_PATH = testStorePath;
  });

  afterAll(async () => {
    // Clean up test directory
    try {
      await fs.rm(testStorePath, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
    // Restore original path
    if (originalPath) {
      process.env.DIRECTIVE_STORE_PATH = originalPath;
    } else {
      delete process.env.DIRECTIVE_STORE_PATH;
    }
  });

  describe('saveDirective', () => {
    it('should save a directive successfully', async () => {
      const userId = 'test-user-123';
      const conversationId = 'test-conv-456';
      const directiveData = {
        systemPrompt: 'You are a helpful assistant',
        personality: 'friendly',
        directives: 'Always be polite',
        memoryPolicy: 'auto',
      };

      const result = await saveDirective(userId, conversationId, directiveData);

      expect(result).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(result.conversationId).toBe(conversationId);
      expect(result.systemPrompt).toBe(directiveData.systemPrompt);
      expect(result.personality).toBe(directiveData.personality);
      expect(result.directives).toBe(directiveData.directives);
      expect(result.memoryPolicy).toBe(directiveData.memoryPolicy);
      expect(result.updatedAt).toBeDefined();
    });

    it('should overwrite existing directive', async () => {
      const userId = 'test-user-123';
      const conversationId = 'test-conv-456';
      
      const directiveData1 = {
        systemPrompt: 'First prompt',
      };
      
      await saveDirective(userId, conversationId, directiveData1);
      
      const directiveData2 = {
        systemPrompt: 'Second prompt',
        personality: 'serious',
      };
      
      const result = await saveDirective(userId, conversationId, directiveData2);
      
      expect(result.systemPrompt).toBe(directiveData2.systemPrompt);
      expect(result.personality).toBe(directiveData2.personality);
    });
  });

  describe('getDirective', () => {
    it('should retrieve an existing directive', async () => {
      const userId = 'test-user-789';
      const conversationId = 'test-conv-101';
      const directiveData = {
        systemPrompt: 'Test prompt',
        personality: 'test',
      };

      await saveDirective(userId, conversationId, directiveData);
      const result = await getDirective(userId, conversationId);

      expect(result).toBeDefined();
      expect(result.systemPrompt).toBe(directiveData.systemPrompt);
      expect(result.personality).toBe(directiveData.personality);
    });

    it('should return null for non-existent directive', async () => {
      const result = await getDirective('non-existent-user', 'non-existent-conv');
      expect(result).toBeNull();
    });
  });

  describe('deleteDirective', () => {
    it('should delete an existing directive', async () => {
      const userId = 'test-user-delete';
      const conversationId = 'test-conv-delete';
      const directiveData = {
        systemPrompt: 'To be deleted',
      };

      await saveDirective(userId, conversationId, directiveData);
      
      const deleteResult = await deleteDirective(userId, conversationId);
      expect(deleteResult).toBe(true);

      const getResult = await getDirective(userId, conversationId);
      expect(getResult).toBeNull();
    });

    it('should return false when deleting non-existent directive', async () => {
      const result = await deleteDirective('non-existent-user', 'non-existent-conv');
      expect(result).toBe(false);
    });
  });
});
