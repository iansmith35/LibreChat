const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const { requireJwtAuth } = require('../../middleware');
const { logger } = require('@librechat/data-schemas');

// In-memory token store (in production, use Redis or database)
const tokenStore = new Map();

/**
 * Get OAuth2 client
 */
function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI || `${process.env.DOMAIN_SERVER}/api/connectors/google/callback`;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.');
  }

  return new OAuth2Client(clientId, clientSecret, redirectUri);
}

/**
 * Check if Google OAuth is configured
 */
function isConfigured() {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

/**
 * Initiate Google OAuth flow
 * GET /api/connectors/google/login
 */
router.get('/login', requireJwtAuth, (req, res) => {
  try {
    if (!isConfigured()) {
      return res.status(501).json({
        error: 'Google OAuth is not configured',
        message: 'Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.',
      });
    }

    const oauth2Client = getOAuth2Client();
    
    // Generate state parameter for CSRF protection
    const state = Buffer.from(JSON.stringify({
      userId: req.user.id,
      timestamp: Date.now(),
    })).toString('base64');

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/cloud-platform', // For Google Cloud APIs
      ],
      state: state,
      prompt: 'consent',
    });

    res.json({ authUrl, state });
  } catch (error) {
    logger.error('[GoogleOAuth] Error initiating OAuth flow:', error);
    res.status(500).json({ error: 'Failed to initiate OAuth flow', message: error.message });
  }
});

/**
 * Handle OAuth callback
 * GET /api/connectors/google/callback
 */
router.get('/callback', async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).send('Authorization code not provided');
    }

    const oauth2Client = getOAuth2Client();
    
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Decode state to get user ID
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    const userId = stateData.userId;

    // Store tokens (in production, use secure storage)
    tokenStore.set(userId, {
      tokens,
      timestamp: Date.now(),
    });

    logger.info(`[GoogleOAuth] Successfully connected Google account for user ${userId}`);

    // Send postMessage to opener window and close popup
    res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ type: 'google-oauth-success', connected: true }, '*');
            window.close();
          </script>
          <p>Authentication successful! You can close this window.</p>
        </body>
      </html>
    `);
  } catch (error) {
    logger.error('[GoogleOAuth] Error in OAuth callback:', error);
    res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ type: 'google-oauth-error', error: '${error.message}' }, '*');
            window.close();
          </script>
          <p>Authentication failed. Please try again.</p>
        </body>
      </html>
    `);
  }
});

/**
 * Get connector status
 * GET /api/connectors/google/status
 */
router.get('/status', requireJwtAuth, (req, res) => {
  try {
    const userId = req.user.id;
    const connection = tokenStore.get(userId);
    
    res.json({
      connected: !!connection,
      timestamp: connection?.timestamp,
      configured: isConfigured(),
    });
  } catch (error) {
    logger.error('[GoogleOAuth] Error checking status:', error);
    res.status(500).json({ error: 'Failed to check status' });
  }
});

/**
 * Disconnect Google account
 * POST /api/connectors/google/disconnect
 */
router.post('/disconnect', requireJwtAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const connection = tokenStore.get(userId);

    if (connection) {
      // Revoke tokens
      try {
        const oauth2Client = getOAuth2Client();
        oauth2Client.setCredentials(connection.tokens);
        await oauth2Client.revokeCredentials();
      } catch (error) {
        logger.warn('[GoogleOAuth] Error revoking tokens:', error);
      }

      tokenStore.delete(userId);
    }

    res.json({ success: true, connected: false });
  } catch (error) {
    logger.error('[GoogleOAuth] Error disconnecting:', error);
    res.status(500).json({ error: 'Failed to disconnect' });
  }
});

module.exports = router;
