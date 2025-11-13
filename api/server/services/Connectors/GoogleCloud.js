const { logger } = require('@librechat/data-schemas');
const { storeConnectorData, removeConnectorData, getConnectorData } = require('./index');

/**
 * Uploads a Google Cloud service account JSON.
 * @param {string} userId - The user ID.
 * @param {Object} serviceAccountData - The service account JSON data.
 */
async function uploadGoogleCloudServiceAccount(userId, serviceAccountData) {
  // Validate service account structure
  if (!serviceAccountData.project_id || !serviceAccountData.private_key || !serviceAccountData.client_email) {
    throw new Error('Invalid service account JSON. Required fields: project_id, private_key, client_email');
  }
  
  // Store service account credentials (in-memory for now)
  // NOTE: In production, this should be encrypted and stored securely
  storeConnectorData(userId, 'google-cloud', {
    serviceAccount: serviceAccountData,
    metadata: {
      projectId: serviceAccountData.project_id,
      clientEmail: serviceAccountData.client_email,
    },
  });
  
  logger.info(`[GoogleCloud] Uploaded service account for user ${userId}`);
}

/**
 * Gets Google Cloud service account credentials.
 * @param {string} userId - The user ID.
 * @returns {Object|null} The service account data or null if not connected.
 */
function getGoogleCloudCredentials(userId) {
  const connectorData = getConnectorData(userId, 'google-cloud');
  return connectorData?.serviceAccount || null;
}

/**
 * Gets Google Cloud connection status.
 * @param {string} userId - The user ID.
 * @returns {Promise<Object>} Status object.
 */
async function getGoogleCloudStatus(userId) {
  const connectorData = getConnectorData(userId, 'google-cloud');
  
  if (!connectorData) {
    return {
      connected: false,
      projectId: null,
      clientEmail: null,
    };
  }
  
  return {
    connected: true,
    projectId: connectorData.metadata.projectId,
    clientEmail: connectorData.metadata.clientEmail,
    connectedAt: connectorData.connectedAt,
  };
}

/**
 * Disconnects Google Cloud service account.
 * @param {string} userId - The user ID.
 */
async function disconnectGoogleCloud(userId) {
  removeConnectorData(userId, 'google-cloud');
  logger.info(`[GoogleCloud] Disconnected service account for user ${userId}`);
}

module.exports = {
  uploadGoogleCloudServiceAccount,
  getGoogleCloudCredentials,
  getGoogleCloudStatus,
  disconnectGoogleCloud,
};
