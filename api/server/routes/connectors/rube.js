const express = require('express');
const { logger } = require('@librechat/data-schemas');
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
  }
});

module.exports = router;
