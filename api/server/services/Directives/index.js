const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('@librechat/data-schemas');

// File-backed storage for directives
const STORAGE_PATH = process.env.DIRECTIVE_STORE_PATH || path.join(__dirname, '../../../data/directives');

// Ensure storage directory exists
async function ensureStorageDir() {
  try {
    await fs.mkdir(STORAGE_PATH, { recursive: true });
  } catch (error) {
    logger.error('[Directives] Failed to create storage directory:', error);
    throw error;
  }
}

// Get the file path for a user's directives
function getUserDirectivesPath(userId) {
  return path.join(STORAGE_PATH, `${userId}.json`);
}

/**
 * Load directives for a user from file storage.
 * @param {string} userId - The user's ID.
 * @returns {Promise<Array>} Array of directives.
 */
async function loadUserDirectives(userId) {
  try {
    await ensureStorageDir();
    const filePath = getUserDirectivesPath(userId);
    
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist yet, return empty array
        return [];
      }
      throw error;
    }
  } catch (error) {
    logger.error(`[Directives] Failed to load directives for user ${userId}:`, error);
    throw new Error('Failed to load directives');
  }
}

/**
 * Save directives for a user to file storage.
 * @param {string} userId - The user's ID.
 * @param {Array} directives - Array of directives to save.
 * @returns {Promise<void>}
 */
async function saveUserDirectives(userId, directives) {
  try {
    await ensureStorageDir();
    const filePath = getUserDirectivesPath(userId);
    
    // Write atomically by writing to temp file first
    const tempPath = `${filePath}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(directives, null, 2), 'utf8');
    await fs.rename(tempPath, filePath);
  } catch (error) {
    logger.error(`[Directives] Failed to save directives for user ${userId}:`, error);
    throw new Error('Failed to save directives');
  }
}

/**
 * Get all directives for a user.
 * @param {string} userId - The user's ID.
 * @returns {Promise<Array>} Array of directives.
 */
async function getDirectives(userId) {
  return await loadUserDirectives(userId);
}

/**
 * Get a specific directive by ID.
 * @param {string} userId - The user's ID.
 * @param {string} directiveId - The directive ID.
 * @returns {Promise<Object|null>} The directive or null if not found.
 */
async function getDirective(userId, directiveId) {
  const directives = await loadUserDirectives(userId);
  return directives.find(d => d.id === directiveId) || null;
}

/**
 * Create a new directive.
 * @param {string} userId - The user's ID.
 * @param {Object} data - Directive data (name, systemPrompt, personality, directives, memoryPolicy).
 * @returns {Promise<Object>} The created directive.
 */
async function createDirective(userId, data) {
  const directives = await loadUserDirectives(userId);
  
  const newDirective = {
    id: uuidv4(),
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  directives.push(newDirective);
  await saveUserDirectives(userId, directives);
  
  return newDirective;
}

/**
 * Update an existing directive.
 * @param {string} userId - The user's ID.
 * @param {string} directiveId - The directive ID.
 * @param {Object} updates - Fields to update.
 * @returns {Promise<Object|null>} The updated directive or null if not found.
 */
async function updateDirective(userId, directiveId, updates) {
  const directives = await loadUserDirectives(userId);
  const index = directives.findIndex(d => d.id === directiveId);
  
  if (index === -1) {
    return null;
  }
  
  directives[index] = {
    ...directives[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  await saveUserDirectives(userId, directives);
  return directives[index];
}

/**
 * Delete a directive.
 * @param {string} userId - The user's ID.
 * @param {string} directiveId - The directive ID.
 * @returns {Promise<boolean>} True if deleted, false if not found.
 */
async function deleteDirective(userId, directiveId) {
  const directives = await loadUserDirectives(userId);
  const filtered = directives.filter(d => d.id !== directiveId);
  
  if (filtered.length === directives.length) {
    return false;
  }
  
  await saveUserDirectives(userId, filtered);
  return true;
}

/**
 * Get available directive presets.
 * @returns {Array} Array of preset directives.
 */
function getPresets() {
  return [
    {
      name: 'Professional Assistant',
      systemPrompt: 'You are a professional assistant focused on providing accurate, helpful, and efficient responses.',
      personality: 'Professional, courteous, and detail-oriented',
      directives: '- Be clear and concise\n- Provide sources when relevant\n- Ask clarifying questions when needed',
      memoryPolicy: 'Remember user preferences and previous context',
    },
    {
      name: 'Creative Writer',
      systemPrompt: 'You are a creative writing assistant that helps with storytelling, creative content, and imaginative ideas.',
      personality: 'Creative, imaginative, and encouraging',
      directives: '- Embrace creativity and unique ideas\n- Help develop narratives\n- Provide constructive feedback',
      memoryPolicy: 'Remember story elements, characters, and plot points',
    },
    {
      name: 'Technical Expert',
      systemPrompt: 'You are a technical expert specializing in providing detailed technical explanations and solutions.',
      personality: 'Precise, analytical, and knowledgeable',
      directives: '- Provide detailed technical explanations\n- Include code examples when relevant\n- Focus on best practices',
      memoryPolicy: 'Remember technical context, stack preferences, and coding patterns',
    },
    {
      name: 'Educational Tutor',
      systemPrompt: 'You are an educational tutor focused on helping students learn and understand concepts.',
      personality: 'Patient, encouraging, and supportive',
      directives: '- Break down complex topics\n- Use examples and analogies\n- Encourage questions and exploration',
      memoryPolicy: 'Remember learning goals, progress, and areas of difficulty',
    },
  ];
}

module.exports = {
  getDirectives,
  getDirective,
  createDirective,
  updateDirective,
  deleteDirective,
  getPresets,
};
