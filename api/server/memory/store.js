const fs = require('fs').promises;
const path = require('path');
const { logger } = require('@librechat/data-schemas');

/**
 * Simple file-based memory store for agent persistent memory
 * Stores conversation memories as JSON files in data/memory/
 */
class MemoryStore {
  constructor() {
    this.memoryDir = path.join(process.cwd(), 'data', 'memory');
    this.ensureDirectoryExists();
  }

  async ensureDirectoryExists() {
    try {
      await fs.mkdir(this.memoryDir, { recursive: true });
    } catch (error) {
      logger.error('[MemoryStore] Error creating memory directory:', error);
    }
  }

  getFilePath(conversationId) {
    return path.join(this.memoryDir, `${conversationId}.json`);
  }

  /**
   * Read memory for a conversation
   * @param {string} conversationId - The conversation ID
   * @returns {Promise<Object>} Memory object with facts and metadata
   */
  async read(conversationId) {
    try {
      const filePath = this.getFilePath(conversationId);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, return empty memory
        return {
          conversationId,
          facts: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      logger.error('[MemoryStore] Error reading memory:', error);
      throw error;
    }
  }

  /**
   * Write memory for a conversation
   * @param {string} conversationId - The conversation ID
   * @param {Object} memoryData - Memory data to store
   * @returns {Promise<Object>} Saved memory object
   */
  async write(conversationId, memoryData) {
    try {
      const filePath = this.getFilePath(conversationId);
      const memory = {
        conversationId,
        facts: memoryData.facts || [],
        createdAt: memoryData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: memoryData.metadata || {},
      };
      await fs.writeFile(filePath, JSON.stringify(memory, null, 2), 'utf8');
      return memory;
    } catch (error) {
      logger.error('[MemoryStore] Error writing memory:', error);
      throw error;
    }
  }

  /**
   * Delete memory for a conversation
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
        // File doesn't exist, consider it a success
        return true;
      }
      logger.error('[MemoryStore] Error deleting memory:', error);
      throw error;
    }
  }

  /**
   * List all conversation IDs with memories
   * @returns {Promise<Array<string>>} Array of conversation IDs
   */
  async list() {
    try {
      const files = await fs.readdir(this.memoryDir);
      return files
        .filter((file) => file.endsWith('.json'))
        .map((file) => file.replace('.json', ''));
    } catch (error) {
      logger.error('[MemoryStore] Error listing memories:', error);
      return [];
    }
  }
}

// Singleton instance
const memoryStore = new MemoryStore();

module.exports = memoryStore;
