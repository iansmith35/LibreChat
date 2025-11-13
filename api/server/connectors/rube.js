const express = require('express');
const { requireJwtAuth } = require('~/server/middleware');

const router = express.Router();

// In-memory store for rube.app connections
const rubeConnections = new Map();

/**
 * POST /api/connectors/rube/link
 * Link rube.app API key
 */
router.post('/rube/link', requireJwtAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { apiKey } = req.body;
    
    if (!apiKey || typeof apiKey !== 'string') {
      return res.status(400).json({ message: 'apiKey is required and must be a string' });
    }
    
    // Store API key (in production, this should be encrypted)
    rubeConnections.set(`rube_${userId}`, {
      apiKey,
      timestamp: Date.now(),
    });
    
    res.json({ 
      message: 'rube.app linked successfully',
      connected: true,
    });
  } catch (error) {
    console.error('[Rube] Error linking API key:', error);
    res.status(500).json({ message: 'Failed to link rube.app' });
  }
});

/**
 * GET /api/connectors/rube/status
 * Check if rube.app is connected
 */
router.get('/rube/status', requireJwtAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const connection = rubeConnections.get(`rube_${userId}`);
    
    res.json({
      connected: !!connection,
      provider: 'rube',
    });
  } catch (error) {
    console.error('[Rube] Error checking status:', error);
    res.status(500).json({ message: 'Failed to check rube.app status' });
  }
});

/**
 * DELETE /api/connectors/rube/disconnect
 * Disconnect rube.app
 */
router.delete('/rube/disconnect', requireJwtAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    rubeConnections.delete(`rube_${userId}`);
    
    res.json({ message: 'rube.app disconnected successfully' });
  } catch (error) {
    console.error('[Rube] Error disconnecting:', error);
    res.status(500).json({ message: 'Failed to disconnect rube.app' });
  }
});

/**
 * POST /api/connectors/rube/login
 * Initiate rube.app OAuth login (scaffold)
 */
router.post('/rube/login', requireJwtAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const state = `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Scaffold for OAuth flow
    const authUrl = `https://rube.app/oauth/authorize?client_id=${
      process.env.RUBE_CLIENT_ID || 'YOUR_CLIENT_ID'
    }&redirect_uri=${encodeURIComponent(
      process.env.RUBE_REDIRECT_URI || 'http://localhost:3080/api/connectors/rube/callback',
    )}&response_type=code&state=${state}`;
    
    res.json({ authUrl, state });
  } catch (error) {
    console.error('[Rube] Error initiating login:', error);
    res.status(500).json({ message: 'Failed to initiate rube.app login' });
  }
});

/**
 * GET /api/connectors/rube/callback
 * Handle rube.app OAuth callback (scaffold)
 */
router.get('/rube/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;
    
    if (error) {
      return res.status(400).json({ message: 'OAuth error', error });
    }
    
    if (!code || !state) {
      return res.status(400).json({ message: 'Missing code or state parameter' });
    }
    
    // Scaffold: In production, exchange code for tokens
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>rube.app OAuth Callback</title>
        </head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'rube-oauth-success', 
                provider: 'rube'
              }, '*');
              window.close();
            } else {
              document.body.innerHTML = '<h2>Authentication successful! You can close this window.</h2>';
            }
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('[Rube] Error handling callback:', error);
    res.status(500).json({ message: 'Failed to complete rube.app OAuth' });
  }
});

module.exports = router;
