const fs = require('fs').promises;
const path = require('path');
const { logger } = require('@librechat/data-schemas');

/**
 * Directive store for agent system prompts, personality, and directives
 * Stores per conversation or user defaults
 */
class DirectiveStore {
  constructor() {
    this.directiveDir = path.join(process.cwd(), 'data', 'directives');
    this.ensureDirectoryExists();
  }

  async ensureDirectoryExists() {
    try {
      await fs.mkdir(this.directiveDir, { recursive: true });
    } catch (error) {
      logger.error('[DirectiveStore] Error creating directive directory:', error);
    }
  }

  getFilePath(conversationId) {
    return path.join(this.directiveDir, `${conversationId}.json`);
  }

  /**
   * Read directive for a conversation
   * @param {string} conversationId - The conversation ID
   * @returns {Promise<Object>} Directive object
   */
  async read(conversationId) {
    try {
      const filePath = this.getFilePath(conversationId);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Return default directive
        return {
          conversationId,
          systemPrompt: '',
          personality: '',
          directives: [],
          memoryPolicy: 'auto',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      logger.error('[DirectiveStore] Error reading directive:', error);
      throw error;
    }
  }

  /**
   * Write directive for a conversation
   * @param {string} conversationId - The conversation ID
   * @param {Object} directiveData - Directive data to store
   * @returns {Promise<Object>} Saved directive object
   */
  async write(conversationId, directiveData) {
    try {
      const filePath = this.getFilePath(conversationId);
      const directive = {
        conversationId,
        systemPrompt: directiveData.systemPrompt || '',
        personality: directiveData.personality || '',
        directives: directiveData.directives || [],
        memoryPolicy: directiveData.memoryPolicy || 'auto',
        presets: directiveData.presets || [],
        createdAt: directiveData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await fs.writeFile(filePath, JSON.stringify(directive, null, 2), 'utf8');
      return directive;
    } catch (error) {
      logger.error('[DirectiveStore] Error writing directive:', error);
      throw error;
    }
  }

  /**
   * Delete directive for a conversation
   * @param {string} conversationId - The conversation ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(conversationId) {
    try {
      const filePath = this.getFilePath(conversationId);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return true;
      }
      logger.error('[DirectiveStore] Error deleting directive:', error);
      throw error;
    }
  }
}

// Singleton instance
const directiveStore = new DirectiveStore();

module.exports = directiveStore;
