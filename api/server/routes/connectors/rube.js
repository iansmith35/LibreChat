const express = require('express');

const { logger } = require('@librechat/data-schemas');

const router = express.Router();

/**
 * GET /api/connectors/rube/login
 * Initiates Rube.app OAuth2 flow.
 * 
 * TODO: Implement Rube.app OAuth2 flow
 * - Generate state parameter for CSRF protection
 * - Store state in session
 * - Redirect to Rube.app OAuth consent screen
 * 
 * Required environment variables:
 * - RUBE_CLIENT_ID
 * - RUBE_CLIENT_SECRET
 * - RUBE_OAUTH_REDIRECT_URI (optional, defaults to /api/connectors/rube/callback)
 * 
 * Documentation: https://rube.app/docs/oauth (placeholder)
 */
router.get('/login', (req, res) => {
  const { RUBE_CLIENT_ID } = process.env;

  if (!RUBE_CLIENT_ID) {
    return res.status(501).json({
      error: 'Rube.app OAuth not configured',
      message: 'Please set RUBE_CLIENT_ID and RUBE_CLIENT_SECRET environment variables.',
      documentation: 'https://rube.app/docs/oauth',
    });
  }

  // TODO: Implement Rube.app OAuth flow
  logger.warn('[Rube.app OAuth] Login endpoint not implemented');
  res.status(501).json({
    error: 'Not implemented',
    message: 'Rube.app OAuth flow is scaffolded but not fully implemented. See TODO comments in code.',
  });
});

/**
 * GET /api/connectors/rube/callback
 * Handles OAuth2 callback from Rube.app.
 * 
 * TODO: Implement callback handler
 * - Verify state parameter
 * - Exchange authorization code for tokens
 * - Store tokens securely
 * - Post message back to opener window
 */
router.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  const { RUBE_CLIENT_ID, RUBE_CLIENT_SECRET } = process.env;

  if (!RUBE_CLIENT_ID || !RUBE_CLIENT_SECRET) {
    return res.status(501).json({
      error: 'Rube.app OAuth not configured',
      message: 'Please set RUBE_CLIENT_ID and RUBE_CLIENT_SECRET environment variables.',
    });
  }

  if (!code) {
    return res.status(400).json({
      error: 'Missing authorization code',
      message: 'No authorization code received from Rube.app.',
    });
  }

  // TODO: Implement Rube.app OAuth callback
  logger.warn('[Rube.app OAuth] Callback endpoint not implemented');
  res.status(501).json({
    error: 'Not implemented',
    message: 'Rube.app OAuth callback is scaffolded but not fully implemented. See TODO comments in code.',
  });
=======

const { requireJwtAuth } = require('~/server/middleware');
const { 
  initiateRubeOAuth,
  handleRubeOAuthCallback,
  connectRubeAPIKey,
  disconnectRube,
  getRubeStatus
} = require('~/server/services/Connectors/Rube');

const router = express.Router();

router.use(requireJwtAuth);

/**
 * GET /connectors/rube/login
 * Initiates rube.app OAuth flow.
 */
router.get('/login', async (req, res) => {
  try {
    const userId = req.user.id;
    const { state, authUrl } = await initiateRubeOAuth(userId);
    
    req.session.rubeOAuthState = state;
    res.redirect(authUrl);
  } catch (error) {
    logger.error('[Rube] Login error:', error);
    res.status(500).json({ error: 'Failed to initiate OAuth flow' });
  }
});

/**
 * GET /connectors/rube/callback
 * Handles rube.app OAuth callback.

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

    const userId = req.user.id;
    
    if (!req.session.rubeOAuthState || req.session.rubeOAuthState !== state) {
      throw new Error('Invalid state parameter');
    }
    
    delete req.session.rubeOAuthState;
    await handleRubeOAuthCallback(userId, code);
    
    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>OAuth Success</title></head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'oauth-success', provider: 'rube' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful! You can close this window.</p>


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

    logger.error('[Rube] Callback error:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head><title>OAuth Error</title></head>
        <body>
          <p>Authentication failed: ${error.message}</p>

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

 * POST /connectors/rube/api-key
 * Connects rube.app using an API key.
 * Body: { apiKey: string }
 */
router.post('/api-key', async (req, res) => {
  try {
    const userId = req.user.id;
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }
    
    await connectRubeAPIKey(userId, apiKey);
    res.json({ success: true });
  } catch (error) {
    logger.error('[Rube] API key error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /connectors/rube/status
 * Gets the rube.app connection status.
 */
router.get('/status', async (req, res) => {
  try {
    const userId = req.user.id;
    const status = await getRubeStatus(userId);
    res.json(status);
  } catch (error) {
    logger.error('[Rube] Status error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /connectors/rube/disconnect
 * Disconnects rube.app.
 */
router.post('/disconnect', async (req, res) => {
  try {
    const userId = req.user.id;
    await disconnectRube(userId);
    res.json({ success: true });
  } catch (error) {
    logger.error('[Rube] Disconnect error:', error);
    res.status(500).json({ error: error.message });

});

module.exports = router;
