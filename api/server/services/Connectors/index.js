const { logger } = require('@librechat/data-schemas');

/**
 * In-memory token store (session-scoped).
 * In production, this should be replaced with encrypted database storage or Redis.
 * Structure: { userId: { provider: { tokens, metadata } } }
 */
const connectorStore = new Map();

/**
 * Gets all connected services for a user.
 * @param {string} userId - The user ID.
 * @returns {Promise<Array>} Array of connected services with their status.
 */
async function getConnectedServices(userId) {
  try {
    const userConnectors = connectorStore.get(userId) || {};
    const connectors = [];
    
    for (const [provider, data] of Object.entries(userConnectors)) {
      connectors.push({
        provider,
        connected: true,
        connectedAt: data.connectedAt,
        metadata: data.metadata || {},
      });
    }
    
    return connectors;
  } catch (error) {
    logger.error('[Connectors] Failed to get connected services:', error);
    throw error;
  }
}

/**
 * Stores connector data for a user.
 * @param {string} userId - The user ID.
 * @param {string} provider - The provider name (e.g., 'google', 'rube').
 * @param {Object} data - The connector data (tokens, metadata, etc.).
 */
function storeConnectorData(userId, provider, data) {
  if (!connectorStore.has(userId)) {
    connectorStore.set(userId, {});
  }
  
  const userConnectors = connectorStore.get(userId);
  userConnectors[provider] = {
    ...data,
    connectedAt: new Date().toISOString(),
  };
  
  logger.debug(`[Connectors] Stored ${provider} data for user ${userId}`);
}

/**
 * Gets connector data for a user.
 * @param {string} userId - The user ID.
 * @param {string} provider - The provider name.
 * @returns {Object|null} The connector data or null if not found.
 */
function getConnectorData(userId, provider) {
  const userConnectors = connectorStore.get(userId);
  return userConnectors?.[provider] || null;
}

/**
 * Removes connector data for a user.
 * @param {string} userId - The user ID.
 * @param {string} provider - The provider name.
 */
function removeConnectorData(userId, provider) {
  const userConnectors = connectorStore.get(userId);
  if (userConnectors) {
    delete userConnectors[provider];
    logger.debug(`[Connectors] Removed ${provider} data for user ${userId}`);
  }
}

/**
 * Checks if a connector is connected for a user.
 * @param {string} userId - The user ID.
 * @param {string} provider - The provider name.
 * @returns {boolean} True if connected, false otherwise.
 */
function isConnectorConnected(userId, provider) {
  const data = getConnectorData(userId, provider);
  return data !== null;
}

module.exports = {
  getConnectedServices,
  storeConnectorData,
  getConnectorData,
  removeConnectorData,
  isConnectorConnected,
};
