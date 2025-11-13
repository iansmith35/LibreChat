const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const rename = promisify(fs.rename);
const unlink = promisify(fs.unlink);

/**
 * @typedef {Object} Directive
 * @property {string} conversationId
 * @property {string} systemPrompt
 * @property {string} [personality]
 * @property {string} [memoryPolicy]
 * @property {number} lastUpdated
 */

/**
 * @typedef {Object.<string, Directive[]>} DirectiveHistory
 */

class DirectiveStore {
  constructor(storagePath) {
    const baseDir = storagePath || path.join(process.cwd(), 'data', 'directives');
    this.storePath = path.join(baseDir, 'directives.json');
    this.tempPath = path.join(baseDir, 'directives.json.tmp');
    this.historyPath = path.join(baseDir, 'directive-history.json');
    this.cache = {};
    this.historyCache = null;
    this.ensureDirectory(baseDir);
  }

  ensureDirectory(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Load directives from disk
   * @returns {Promise<Object.<string, Directive>>}
   */
  async loadDirectives() {
    try {
      if (!fs.existsSync(this.storePath)) {
        return {};
      }

      const data = await readFile(this.storePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('[DirectiveStore] Error loading directives:', error);
      return {};
    }
  }

  /**
   * Load directive history from disk
   * @returns {Promise<DirectiveHistory>}
   */
  async loadHistory() {
    if (this.historyCache) {
      return this.historyCache;
    }

    try {
      if (!fs.existsSync(this.historyPath)) {
        this.historyCache = {};
        return this.historyCache;
      }

      const data = await readFile(this.historyPath, 'utf-8');
      this.historyCache = JSON.parse(data);
      return this.historyCache;
    } catch (error) {
      console.error('[DirectiveStore] Error loading directive history:', error);
      this.historyCache = {};
      return this.historyCache;
    }
  }

  /**
   * Save directives to disk with atomic write
   * @param {Object.<string, Directive>} directives
   * @returns {Promise<void>}
   */
  async saveDirectives(directives) {
    try {
      await writeFile(this.tempPath, JSON.stringify(directives, null, 2), 'utf-8');
      await rename(this.tempPath, this.storePath);
      this.cache = directives;
    } catch (error) {
      console.error('[DirectiveStore] Error saving directives:', error);
      
      try {
        if (fs.existsSync(this.tempPath)) {
          await unlink(this.tempPath);
        }
      } catch (cleanupError) {
        console.error('[DirectiveStore] Error cleaning up temp file:', cleanupError);
      }
      
      throw error;
    }
  }

  /**
   * Save directive history to disk
   * @param {DirectiveHistory} history
   * @returns {Promise<void>}
   */
  async saveHistory(history) {
    try {
      const tempHistoryPath = `${this.historyPath}.tmp`;
      await writeFile(tempHistoryPath, JSON.stringify(history, null, 2), 'utf-8');
      await rename(tempHistoryPath, this.historyPath);
      this.historyCache = history;
    } catch (error) {
      console.error('[DirectiveStore] Error saving directive history:', error);
      throw error;
    }
  }

  /**
   * Get directive for a conversation
   * @param {string} conversationId
   * @returns {Promise<Directive|null>}
   */
  async getDirective(conversationId) {
    const directives = await this.loadDirectives();
    return directives[conversationId] || null;
  }

  /**
   * Save or update directive for a conversation
   * @param {string} conversationId
   * @param {string} systemPrompt
   * @param {string} [personality]
   * @param {string} [memoryPolicy]
   * @returns {Promise<Directive>}
   */
  async saveDirective(conversationId, systemPrompt, personality, memoryPolicy) {
    const directives = await this.loadDirectives();
    const history = await this.loadHistory();

    const directive = {
      conversationId,
      systemPrompt,
      personality,
      memoryPolicy,
      lastUpdated: Date.now(),
    };

    // Save current directive to history
    if (directives[conversationId]) {
      if (!history[conversationId]) {
        history[conversationId] = [];
      }
      history[conversationId].push(directives[conversationId]);
      
      // Keep only last 10 history items per conversation
      if (history[conversationId].length > 10) {
        history[conversationId] = history[conversationId].slice(-10);
      }
      
      await this.saveHistory(history);
    }

    directives[conversationId] = directive;
    await this.saveDirectives(directives);
    
    return directive;
  }

  /**
   * Get directive history for a conversation
   * @param {string} conversationId
   * @returns {Promise<Directive[]>}
   */
  async getDirectiveHistory(conversationId) {
    const history = await this.loadHistory();
    return history[conversationId] || [];
  }

  /**
   * Delete directive for a conversation
   * @param {string} conversationId
   * @returns {Promise<boolean>}
   */
  async deleteDirective(conversationId) {
    const directives = await this.loadDirectives();
    
    if (!directives[conversationId]) {
      return false;
    }

    delete directives[conversationId];
    await this.saveDirectives(directives);
    return true;
  }

  /**
   * Get all presets (directives that can be reused)
   * @returns {Promise<Directive[]>}
   */
  async getPresets() {
    const history = await this.loadHistory();
    const presets = [];
    const seen = new Set();

    Object.values(history).forEach((conversationHistory) => {
      conversationHistory.forEach((directive) => {
        const key = `${directive.systemPrompt}_${directive.personality}_${directive.memoryPolicy}`;
        if (!seen.has(key)) {
          seen.add(key);
          presets.push(directive);
        }
      });
    });

    return presets;
  }

  /**
   * Clear cache (for testing)
   */
  clearCache() {
    this.cache = {};
    this.historyCache = null;
  }
}

// Export singleton instance
const directiveStore = new DirectiveStore();

module.exports = DirectiveStore;
module.exports.directiveStore = directiveStore;
module.exports.default = DirectiveStore;
