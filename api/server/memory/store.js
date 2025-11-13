const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);
const rename = promisify(fs.rename);
const unlink = promisify(fs.unlink);

/**
 * @typedef {Object} MemoryItem
 * @property {string} id
 * @property {string} conversationId
 * @property {string} content
 * @property {number} timestamp
 * @property {boolean} enabled
 */

/**
 * @typedef {Object.<string, MemoryItem[]>} MemoryStore
 */

class FileBackedMemoryStore {
  constructor(storagePath) {
    const baseDir = storagePath || path.join(process.cwd(), 'data', 'memory');
    this.storePath = path.join(baseDir, 'memory-store.json');
    this.tempPath = path.join(baseDir, 'memory-store.json.tmp');
    this.cache = null;
    this.ensureDirectory(baseDir);
  }

  ensureDirectory(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Load memory store from disk with atomic read
   * @returns {Promise<MemoryStore>}
   */
  async load() {
    if (this.cache) {
      return this.cache;
    }

    try {
      if (!fs.existsSync(this.storePath)) {
        this.cache = {};
        return this.cache;
      }

      const data = await readFile(this.storePath, 'utf-8');
      this.cache = JSON.parse(data);
      return this.cache;
    } catch (error) {
      console.error('[MemoryStore] Error loading memory store:', error);
      this.cache = {};
      return this.cache;
    }
  }

  /**
   * Save memory store to disk with atomic write (write to temp, then rename)
   * @param {MemoryStore} store
   * @returns {Promise<void>}
   */
  async save(store) {
    try {
      // Write to temporary file first
      await writeFile(this.tempPath, JSON.stringify(store, null, 2), 'utf-8');
      
      // Atomic rename
      await rename(this.tempPath, this.storePath);
      
      // Update cache
      this.cache = store;
    } catch (error) {
      console.error('[MemoryStore] Error saving memory store:', error);
      
      // Clean up temp file if it exists
      try {
        if (fs.existsSync(this.tempPath)) {
          await unlink(this.tempPath);
        }
      } catch (cleanupError) {
        console.error('[MemoryStore] Error cleaning up temp file:', cleanupError);
      }
      
      throw error;
    }
  }

  /**
   * Get memory items for a conversation
   * @param {string} conversationId
   * @returns {Promise<MemoryItem[]>}
   */
  async getMemoryItems(conversationId) {
    const store = await this.load();
    return store[conversationId] || [];
  }

  /**
   * Add a memory item to a conversation
   * @param {string} conversationId
   * @param {string} content
   * @returns {Promise<MemoryItem>}
   */
  async addMemoryItem(conversationId, content) {
    const store = await this.load();
    
    if (!store[conversationId]) {
      store[conversationId] = [];
    }

    const memoryItem = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      content,
      timestamp: Date.now(),
      enabled: true,
    };

    store[conversationId].push(memoryItem);
    await this.save(store);
    
    return memoryItem;
  }

  /**
   * Update a memory item
   * @param {string} conversationId
   * @param {string} itemId
   * @param {Partial<MemoryItem>} updates
   * @returns {Promise<MemoryItem|null>}
   */
  async updateMemoryItem(conversationId, itemId, updates) {
    const store = await this.load();
    
    if (!store[conversationId]) {
      return null;
    }

    const itemIndex = store[conversationId].findIndex((item) => item.id === itemId);
    
    if (itemIndex === -1) {
      return null;
    }

    const updatedItem = {
      ...store[conversationId][itemIndex],
      ...updates,
      id: store[conversationId][itemIndex].id, // Prevent ID change
      conversationId: store[conversationId][itemIndex].conversationId, // Prevent conversation ID change
    };

    store[conversationId][itemIndex] = updatedItem;
    await this.save(store);
    
    return updatedItem;
  }

  /**
   * Delete a memory item
   * @param {string} conversationId
   * @param {string} itemId
   * @returns {Promise<boolean>}
   */
  async deleteMemoryItem(conversationId, itemId) {
    const store = await this.load();
    
    if (!store[conversationId]) {
      return false;
    }

    const initialLength = store[conversationId].length;
    store[conversationId] = store[conversationId].filter((item) => item.id !== itemId);
    
    if (store[conversationId].length === initialLength) {
      return false; // Item not found
    }

    await this.save(store);
    return true;
  }

  /**
   * Get enabled memory items for a conversation (for injection into prompts)
   * @param {string} conversationId
   * @returns {Promise<MemoryItem[]>}
   */
  async getEnabledMemoryItems(conversationId) {
    const items = await this.getMemoryItems(conversationId);
    return items.filter((item) => item.enabled);
  }

  /**
   * Clear all memory for a conversation
   * @param {string} conversationId
   * @returns {Promise<void>}
   */
  async clearConversationMemory(conversationId) {
    const store = await this.load();
    delete store[conversationId];
    await this.save(store);
  }

  /**
   * Clear cache (for testing or forced reload)
   */
  clearCache() {
    this.cache = null;
  }
}

// Export singleton instance
const memoryStore = new FileBackedMemoryStore();

module.exports = FileBackedMemoryStore;
module.exports.memoryStore = memoryStore;
module.exports.default = FileBackedMemoryStore;
