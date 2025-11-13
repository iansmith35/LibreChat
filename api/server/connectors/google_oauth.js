const express = require('express');
const { requireJwtAuth } = require('~/server/middleware');

const router = express.Router();

// In-memory token store (session-scoped)
// In production, this should be stored in Redis or a database
const tokenStore = new Map();

/**
 * GET /api/connectors/google/login
 * Initiate Google OAuth login
 */
router.get('/google/login', requireJwtAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const state = `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store state for verification
    tokenStore.set(state, { userId, timestamp: Date.now() });

    // In a real implementation, construct OAuth URL with proper client ID and scopes
    // For now, return a placeholder
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${
      process.env.GOOGLE_OAUTH_CLIENT_ID || 'YOUR_CLIENT_ID'
    }&redirect_uri=${encodeURIComponent(
      process.env.GOOGLE_OAUTH_REDIRECT_URI ||
        'http://localhost:3080/api/connectors/google/callback',
    )}&response_type=code&scope=${encodeURIComponent('openid email profile')}&state=${state}`;

    res.json({ authUrl, state });
  } catch (error) {
    console.error('[GoogleOAuth] Error initiating login:', error);
    res.status(500).json({ message: 'Failed to initiate Google OAuth login' });
  }
});

/**
 * GET /api/connectors/google/callback
 * Handle Google OAuth callback
 */
router.get('/google/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.status(400).json({ message: 'OAuth error', error });
    }

    if (!code || !state) {
      return res.status(400).json({ message: 'Missing code or state parameter' });
    }

    // Verify state
    const stateData = tokenStore.get(state);
    if (!stateData) {
      return res.status(400).json({ message: 'Invalid state parameter' });
    }

    // Clean up used state
    tokenStore.delete(state);

    // In a real implementation, exchange code for tokens
    // For now, simulate token exchange
    const mockTokens = {
      access_token: `mock_access_token_${Date.now()}`,
      refresh_token: `mock_refresh_token_${Date.now()}`,
      expires_in: 3600,
    };

    // Store tokens for the user
    tokenStore.set(`google_${stateData.userId}`, {
      ...mockTokens,
      timestamp: Date.now(),
    });

    // Return HTML to close popup and notify parent window
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Google OAuth Callback</title>
        </head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'google-oauth-success', 
                provider: 'google'
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
    console.error('[GoogleOAuth] Error handling callback:', error);
    res.status(500).json({ message: 'Failed to complete Google OAuth' });
  }
});

/**
 * GET /api/connectors/google/status
 * Check if user has connected Google account
 */
router.get('/google/status', requireJwtAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const tokens = tokenStore.get(`google_${userId}`);

    res.json({
      connected: !!tokens,
      provider: 'google',
    });
  } catch (error) {
    console.error('[GoogleOAuth] Error checking status:', error);
    res.status(500).json({ message: 'Failed to check Google OAuth status' });
  }
});

/**
 * DELETE /api/connectors/google/disconnect
 * Disconnect Google account
 */
router.delete('/google/disconnect', requireJwtAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    tokenStore.delete(`google_${userId}`);

    res.json({ message: 'Google account disconnected successfully' });
  } catch (error) {
    console.error('[GoogleOAuth] Error disconnecting:', error);
    res.status(500).json({ message: 'Failed to disconnect Google account' });
  }
});

module.exports = router;
