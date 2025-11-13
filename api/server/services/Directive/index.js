const fs = require('fs').promises;
const path = require('path');
const { logger } = require('@librechat/data-schemas');

const DIRECTIVE_STORE_PATH = process.env.DIRECTIVE_STORE_PATH || path.join(process.cwd(), 'data', 'directives');

/**
 * Ensures the directive storage directory exists.
 * @private
 */
async function ensureDirectoryExists() {
  try {
    await fs.mkdir(DIRECTIVE_STORE_PATH, { recursive: true });
  } catch (error) {
    logger.error('[Directive] Failed to create directory:', error);
    throw error;
  }
}

/**
 * Gets the file path for a directive.
 * @param {string} userId - The user ID.
 * @param {string} conversationId - The conversation ID.
 * @returns {string} The file path.
 * @private
 */
function getDirectiveFilePath(userId, conversationId) {
  return path.join(DIRECTIVE_STORE_PATH, `${userId}_${conversationId}.json`);
}

/**
 * Retrieves a directive for a conversation.
 * @param {string} userId - The user ID.
 * @param {string} conversationId - The conversation ID.
 * @returns {Promise<Object|null>} The directive object or null if not found.
 */
async function getDirective(userId, conversationId) {
  try {
    await ensureDirectoryExists();
    const filePath = getDirectiveFilePath(userId, conversationId);
    
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  } catch (error) {
    logger.error('[Directive] Failed to get directive:', error);
    throw error;
  }
}

/**
 * Saves a directive for a conversation.
 * @param {string} userId - The user ID.
 * @param {string} conversationId - The conversation ID.
 * @param {Object} directiveData - The directive data.
 * @param {string} [directiveData.systemPrompt] - System prompt.
 * @param {string} [directiveData.personality] - Personality description.
 * @param {string} [directiveData.directives] - Specific directives.
 * @param {string} [directiveData.memoryPolicy] - Memory policy.
 * @returns {Promise<Object>} The saved directive.
 */
async function saveDirective(userId, conversationId, directiveData) {
  try {
    await ensureDirectoryExists();
    const filePath = getDirectiveFilePath(userId, conversationId);
    
    const directive = {
      userId,
      conversationId,
      systemPrompt: directiveData.systemPrompt || '',
      personality: directiveData.personality || '',
      directives: directiveData.directives || '',
      memoryPolicy: directiveData.memoryPolicy || 'auto',
      updatedAt: new Date().toISOString(),
    };
    
    // Write atomically using a temp file
    const tempPath = `${filePath}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(directive, null, 2), 'utf8');
    await fs.rename(tempPath, filePath);
    
    logger.debug(`[Directive] Saved directive for user ${userId}, conversation ${conversationId}`);
    return directive;
  } catch (error) {
    logger.error('[Directive] Failed to save directive:', error);
    throw error;
  }
}

/**
 * Deletes a directive for a conversation.
 * @param {string} userId - The user ID.
 * @param {string} conversationId - The conversation ID.
 * @returns {Promise<boolean>} True if deleted, false if not found.
 */
async function deleteDirective(userId, conversationId) {
  try {
    const filePath = getDirectiveFilePath(userId, conversationId);
    await fs.unlink(filePath);
    logger.debug(`[Directive] Deleted directive for user ${userId}, conversation ${conversationId}`);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false;
    }
    logger.error('[Directive] Failed to delete directive:', error);
    throw error;
  }
}

module.exports = {
  getDirective,
  saveDirective,
  deleteDirective,
};
