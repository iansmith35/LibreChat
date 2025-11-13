const express = require('express');
const googleCloud = require('~/server/connectors/google_cloud');

const router = express.Router();

// Mount Google Cloud STT/TTS routes
router.use(googleCloud);

module.exports = router;
