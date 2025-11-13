const crypto = require('crypto');
const axios = require('axios');
const { logger } = require('@librechat/data-schemas');
const { storeConnectorData, removeConnectorData, getConnectorData } = require('./index');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_OAUTH_REDIRECT_URI = process.env.GOOGLE_OAUTH_REDIRECT_URI || 'http://localhost:3080/api/connectors/google/callback';

/**
 * Initiates Google OAuth flow.
 * @param {string} userId - The user ID.
 * @returns {Promise<Object>} Object with state and authUrl.
 */
async function initiateGoogleOAuth(userId) {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('Google OAuth is not configured. Please set GOOGLE_CLIENT_ID environment variable.');
  }
  
  const state = crypto.randomBytes(32).toString('hex');
  
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', GOOGLE_OAUTH_REDIRECT_URI);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');
  
  logger.debug(`[GoogleOAuth] Initiated OAuth for user ${userId}`);
  
  return {
    state,
    authUrl: authUrl.toString(),
  };
}

/**
 * Handles Google OAuth callback and exchanges code for tokens.
 * @param {string} userId - The user ID.
 * @param {string} code - The authorization code.
 * @returns {Promise<Object>} The tokens object.
 */
async function handleGoogleOAuthCallback(userId, code) {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth is not configured properly.');
  }
  
  try {
    // Exchange code for tokens
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_OAUTH_REDIRECT_URI,
      grant_type: 'authorization_code',
    });
    
    const { access_token, refresh_token, expires_in, token_type } = response.data;
    
    // Get user info
    const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    
    const userInfo = userInfoResponse.data;
    
    // Store tokens and user info
    storeConnectorData(userId, 'google', {
      tokens: {
        access_token,
        refresh_token,
        expires_in,
        token_type,
        expires_at: Date.now() + expires_in * 1000,
      },
      metadata: {
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
      },
    });
    
    logger.info(`[GoogleOAuth] Successfully connected Google account for user ${userId}`);
    
    return { success: true };
  } catch (error) {
    logger.error('[GoogleOAuth] Failed to exchange code for tokens:', error);
    throw new Error('Failed to authenticate with Google');
  }
}

/**
 * Disconnects Google OAuth.
 * @param {string} userId - The user ID.
 */
async function disconnectGoogleOAuth(userId) {
  const connectorData = getConnectorData(userId, 'google');
  
  if (connectorData?.tokens?.access_token) {
    try {
      // Revoke the token
      await axios.post('https://oauth2.googleapis.com/revoke', null, {
        params: { token: connectorData.tokens.access_token },
      });
    } catch (error) {
      logger.warn('[GoogleOAuth] Failed to revoke token:', error);
      // Continue with disconnection even if revocation fails
    }
  }
  
  removeConnectorData(userId, 'google');
  logger.info(`[GoogleOAuth] Disconnected Google account for user ${userId}`);
}

/**
 * Gets a valid access token, refreshing if necessary.
 * @param {string} userId - The user ID.
 * @returns {Promise<string|null>} The access token or null if not connected.
 */
async function getAccessToken(userId) {
  const connectorData = getConnectorData(userId, 'google');
  
  if (!connectorData) {
    return null;
  }
  
  // Check if token needs refresh
  if (connectorData.tokens.expires_at <= Date.now()) {
    try {
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: connectorData.tokens.refresh_token,
        grant_type: 'refresh_token',
      });
      
      const { access_token, expires_in } = response.data;
      
      // Update stored tokens
      connectorData.tokens.access_token = access_token;
      connectorData.tokens.expires_in = expires_in;
      connectorData.tokens.expires_at = Date.now() + expires_in * 1000;
      
      storeConnectorData(userId, 'google', connectorData);
      
      return access_token;
    } catch (error) {
      logger.error('[GoogleOAuth] Failed to refresh token:', error);
      return null;
    }
  }
  
  return connectorData.tokens.access_token;
}

module.exports = {
  initiateGoogleOAuth,
  handleGoogleOAuthCallback,
  disconnectGoogleOAuth,
  getAccessToken,
};
