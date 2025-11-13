const express = require('express');

const { requireJwtAuth } = require('~/server/middleware');
const { getConnectedServices } = require('~/server/services/Connectors');
const googleOAuth = require('./googleOAuth');
const googleCloud = require('./googleCloud');
const rube = require('./rube');

const router = express.Router();

router.use(requireJwtAuth);

/**
 * GET /connectors/list
 * Lists all connected connectors for the authenticated user.
 */
router.get('/list', async (req, res) => {
  try {
    const userId = req.user.id;
    const connectors = await getConnectedServices(userId);
    res.json({ connectors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Google OAuth routes
 * @route /connectors/google/*
 */
router.use('/google', googleOAuth);

/**
 * Google Cloud routes
 * @route /connectors/google-cloud/*
 */
router.use('/google-cloud', googleCloud);

/**
 * Rube.app routes
 * @route /connectors/rube/*
 */
router.use('/rube', rube);
=======
const router = express.Router();
const googleRouter = require('./google');
const rubeRouter = require('./rube');

// Mount connector routes
router.use('/google', googleRouter);
router.use('/rube', rubeRouter);


module.exports = router;
