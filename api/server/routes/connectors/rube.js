const express = require('express');
const router = express.Router();
const { requireJwtAuth } = require('../../middleware');
const { logger } = require('@librechat/data-schemas');

// In-memory connection store
const connectionStore = new Map();

/**
 * Check if Rube.app is configured
 */
function isConfigured() {
  return !!(process.env.RUBE_CLIENT_ID && process.env.RUBE_CLIENT_SECRET);
}

/**
 * Initiate Rube.app OAuth flow
 * GET /api/connectors/rube/login
 */
router.get('/login', requireJwtAuth, (req, res) => {
  try {
    if (!isConfigured()) {
      return res.status(501).json({
        error: 'Rube.app OAuth is not configured',
        message: 'Please set RUBE_CLIENT_ID and RUBE_CLIENT_SECRET environment variables.',
      });
    }

    // Generate state for CSRF protection
    const state = Buffer.from(JSON.stringify({
      userId: req.user.id,
      timestamp: Date.now(),
    })).toString('base64');

    // Rube.app OAuth URL (placeholder - adjust based on actual Rube.app OAuth implementation)
    const rubeAuthUrl = process.env.RUBE_OAUTH_URL || 'https://rube.app/oauth/authorize';
    const redirectUri = process.env.RUBE_REDIRECT_URI || `${process.env.DOMAIN_SERVER}/api/connectors/rube/callback`;
    
    const authUrl = `${rubeAuthUrl}?client_id=${process.env.RUBE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&response_type=code`;

    res.json({ authUrl, state });
  } catch (error) {
    logger.error('[RubeOAuth] Error initiating OAuth flow:', error);
    res.status(500).json({ error: 'Failed to initiate OAuth flow', message: error.message });
  }
});

/**
 * Handle OAuth callback
 * GET /api/connectors/rube/callback
 */
router.get('/callback', async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).send('Authorization code not provided');
    }

    // Decode state to get user ID
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    const userId = stateData.userId;

    // Exchange code for token (placeholder - implement actual token exchange)
    // In real implementation, make request to Rube.app token endpoint
    const tokens = {
      access_token: code, // Placeholder
      timestamp: Date.now(),
    };

    // Store connection
    connectionStore.set(userId, {
      tokens,
      timestamp: Date.now(),
    });

    logger.info(`[RubeOAuth] Successfully connected Rube.app for user ${userId}`);

    // Send postMessage to opener window and close popup
    res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ type: 'rube-oauth-success', connected: true }, '*');
            window.close();
          </script>
          <p>Rube.app authentication successful! You can close this window.</p>
        </body>
      </html>
    `);
  } catch (error) {
    logger.error('[RubeOAuth] Error in OAuth callback:', error);
    res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ type: 'rube-oauth-error', error: '${error.message}' }, '*');
            window.close();
          </script>
          <p>Authentication failed. Please try again.</p>
        </body>
      </html>
    `);
  }
});

/**
 * Connect via API key (alternative to OAuth)
 * POST /api/connectors/rube/connect
 */
router.post('/connect', requireJwtAuth, async (req, res) => {
  try {
    const { apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    const userId = req.user.id;

    // Store API key connection
    connectionStore.set(userId, {
      type: 'apikey',
      apiKey: apiKey,
      timestamp: Date.now(),
    });

    logger.info(`[RubeAPI] Successfully connected Rube.app via API key for user ${userId}`);

    res.json({ success: true, connected: true });
  } catch (error) {
    logger.error('[RubeAPI] Error connecting with API key:', error);
    res.status(500).json({ error: 'Failed to connect' });
  }
});

/**
 * Get connector status
 * GET /api/connectors/rube/status
 */
router.get('/status', requireJwtAuth, (req, res) => {
  try {
    const userId = req.user.id;
    const connection = connectionStore.get(userId);
    
    res.json({
      connected: !!connection,
      connectionType: connection?.type || 'oauth',
      timestamp: connection?.timestamp,
      configured: isConfigured(),
    });
  } catch (error) {
    logger.error('[RubeOAuth] Error checking status:', error);
    res.status(500).json({ error: 'Failed to check status' });
  }
});

/**
 * Disconnect Rube.app
 * POST /api/connectors/rube/disconnect
 */
router.post('/disconnect', requireJwtAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    connectionStore.delete(userId);

    res.json({ success: true, connected: false });
  } catch (error) {
    logger.error('[RubeOAuth] Error disconnecting:', error);
    res.status(500).json({ error: 'Failed to disconnect' });
  }
});

module.exports = router;
