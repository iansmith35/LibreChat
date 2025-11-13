const express = require('express');
const { logger } = require('@librechat/data-schemas');
const { requireJwtAuth } = require('~/server/middleware');
const { 
  initiateGoogleOAuth, 
  handleGoogleOAuthCallback,
  disconnectGoogleOAuth 
} = require('~/server/services/Connectors/GoogleOAuth');

const router = express.Router();

router.use(requireJwtAuth);

/**
 * GET /connectors/google/login
 * Initiates Google OAuth flow.
 * Redirects to Google consent screen.
 */
router.get('/login', async (req, res) => {
  try {
    const userId = req.user.id;
    const { state, authUrl } = await initiateGoogleOAuth(userId);
    
    // Store state in session for verification
    req.session.googleOAuthState = state;
    
    res.redirect(authUrl);
  } catch (error) {
    logger.error('[GoogleOAuth] Login error:', error);
    res.status(500).json({ error: 'Failed to initiate OAuth flow' });
  }
});

/**
 * GET /connectors/google/callback
 * Handles Google OAuth callback.
 * Exchanges code for tokens and stores them.
 */
router.get('/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    const userId = req.user.id;
    
    // Verify state to prevent CSRF
    if (!req.session.googleOAuthState || req.session.googleOAuthState !== state) {
      throw new Error('Invalid state parameter');
    }
    
    // Clear the state
    delete req.session.googleOAuthState;
    
    // Exchange code for tokens
    await handleGoogleOAuthCallback(userId, code);
    
    // Send a response that will close the popup and notify the opener
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>OAuth Success</title>
        </head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'oauth-success', provider: 'google' }, '*');
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
    logger.error('[GoogleOAuth] Callback error:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>OAuth Error</title>
        </head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'oauth-error', provider: 'google', error: '${error.message}' }, '*');
              window.close();
            }
          </script>
          <p>Authentication failed: ${error.message}</p>
        </body>
      </html>
    `);
  }
});

/**
 * POST /connectors/google/disconnect
 * Disconnects Google OAuth.
 */
router.post('/disconnect', async (req, res) => {
  try {
    const userId = req.user.id;
    await disconnectGoogleOAuth(userId);
    res.json({ success: true });
  } catch (error) {
    logger.error('[GoogleOAuth] Disconnect error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
