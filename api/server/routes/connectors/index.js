const express = require('express');
const { requireJwtAuth } = require('~/server/middleware');
const google = require('./google');
const rube = require('./rube');

const router = express.Router();

router.use(requireJwtAuth);

/**
 * GET /api/connectors/list
 * Returns the list of connected connectors for the authenticated user.
 */
router.get('/list', async (req, res) => {
  try {
    // TODO: Implement connector status check
    // For now, return a basic structure
    const connectors = {
      google: {
        connected: false,
        type: 'oauth',
      },
      googleCloud: {
        connected: false,
        type: 'service_account',
      },
      rube: {
        connected: false,
        type: 'oauth',
      },
    };

    res.json({ connectors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Google OAuth routes
 * /api/connectors/google/*
 */
router.use('/google', google);

/**
 * Rube.app OAuth routes
 * /api/connectors/rube/*
 */
router.use('/rube', rube);

module.exports = router;
