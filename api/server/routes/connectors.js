const express = require('express');
const { requireJwtAuth } = require('~/server/middleware');
const googleOAuth = require('~/server/connectors/google_oauth');
const rube = require('~/server/connectors/rube');
const googleCloud = require('~/server/connectors/google_cloud');

const router = express.Router();

// Mount connector routes
router.use(googleOAuth);
router.use(rube);

/**
 * GET /api/connectors/list
 * List all available connectors and their connection status
 */
router.get('/list', requireJwtAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check status of each connector
    const connectors = [
      {
        id: 'google',
        name: 'Google',
        description: 'Connect your Google account',
        type: 'oauth',
        connected: false, // Will be checked dynamically
      },
      {
        id: 'rube',
        name: 'rube.app',
        description: 'Connect to rube.app',
        type: 'oauth',
        connected: false,
      },
    ];
    
    res.json(connectors);
  } catch (error) {
    console.error('[Connectors] Error listing connectors:', error);
    res.status(500).json({ message: 'Failed to list connectors' });
  }
});

module.exports = router;
