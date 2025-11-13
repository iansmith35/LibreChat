const crypto = require('crypto');
const axios = require('axios');
const { logger } = require('@librechat/data-schemas');
const { storeConnectorData, removeConnectorData, getConnectorData } = require('./index');

const RUBE_CLIENT_ID = process.env.RUBE_CLIENT_ID;
const RUBE_CLIENT_SECRET = process.env.RUBE_CLIENT_SECRET;
const RUBE_OAUTH_REDIRECT_URI = process.env.RUBE_OAUTH_REDIRECT_URI || 'http://localhost:3080/api/connectors/rube/callback';
const RUBE_AUTH_URL = process.env.RUBE_AUTH_URL || 'https://rube.app/oauth/authorize';
const RUBE_TOKEN_URL = process.env.RUBE_TOKEN_URL || 'https://rube.app/oauth/token';

/**
 * Initiates rube.app OAuth flow.
 * @param {string} userId - The user ID.
 * @returns {Promise<Object>} Object with state and authUrl.
 */
async function initiateRubeOAuth(userId) {
  if (!RUBE_CLIENT_ID) {
    throw new Error('Rube OAuth is not configured. Please set RUBE_CLIENT_ID environment variable.');
  }
  
  const state = crypto.randomBytes(32).toString('hex');
  
  const authUrl = new URL(RUBE_AUTH_URL);
  authUrl.searchParams.set('client_id', RUBE_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', RUBE_OAUTH_REDIRECT_URI);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('state', state);
  
  logger.debug(`[Rube] Initiated OAuth for user ${userId}`);
  
  return {
    state,
    authUrl: authUrl.toString(),
  };
}

/**
 * Handles rube.app OAuth callback and exchanges code for tokens.
 * @param {string} userId - The user ID.
 * @param {string} code - The authorization code.
 * @returns {Promise<Object>} The tokens object.
 */
async function handleRubeOAuthCallback(userId, code) {
  if (!RUBE_CLIENT_ID || !RUBE_CLIENT_SECRET) {
    throw new Error('Rube OAuth is not configured properly.');
  }
  
  try {
    const response = await axios.post(RUBE_TOKEN_URL, {
      code,
      client_id: RUBE_CLIENT_ID,
      client_secret: RUBE_CLIENT_SECRET,
      redirect_uri: RUBE_OAUTH_REDIRECT_URI,
      grant_type: 'authorization_code',
    });
    
    const { access_token, refresh_token, expires_in } = response.data;
    
    storeConnectorData(userId, 'rube', {
      tokens: {
        access_token,
        refresh_token,
        expires_in,
        expires_at: Date.now() + expires_in * 1000,
      },
      metadata: {
        authType: 'oauth',
      },
    });
    
    logger.info(`[Rube] Successfully connected rube.app account for user ${userId}`);
    
    return { success: true };
  } catch (error) {
    logger.error('[Rube] Failed to exchange code for tokens:', error);
    throw new Error('Failed to authenticate with rube.app');
  }
}

/**
 * Connects rube.app using an API key.
 * @param {string} userId - The user ID.
 * @param {string} apiKey - The API key.
 */
async function connectRubeAPIKey(userId, apiKey) {
  // TODO: Validate API key with rube.app API
  storeConnectorData(userId, 'rube', {
    apiKey,
    metadata: {
      authType: 'api-key',
    },
  });
  
  logger.info(`[Rube] Connected rube.app with API key for user ${userId}`);
}

/**
 * Gets rube.app connection status.
 * @param {string} userId - The user ID.
 * @returns {Promise<Object>} Status object.
 */
async function getRubeStatus(userId) {
  const connectorData = getConnectorData(userId, 'rube');
  
  if (!connectorData) {
    return {
      connected: false,
      authType: null,
    };
  }
  
  return {
    connected: true,
    authType: connectorData.metadata.authType,
    connectedAt: connectorData.connectedAt,
  };
}

/**
 * Disconnects rube.app.
 * @param {string} userId - The user ID.
 */
async function disconnectRube(userId) {
  removeConnectorData(userId, 'rube');
  logger.info(`[Rube] Disconnected rube.app for user ${userId}`);
}

module.exports = {
  initiateRubeOAuth,
  handleRubeOAuthCallback,
  connectRubeAPIKey,
  getRubeStatus,
  disconnectRube,
};
