const express = require('express');
const multer = require('multer');
const { logger } = require('@librechat/data-schemas');
const { requireJwtAuth } = require('~/server/middleware');
const { 
  uploadGoogleCloudServiceAccount,
  disconnectGoogleCloud,
  getGoogleCloudStatus
} = require('~/server/services/Connectors/GoogleCloud');

const router = express.Router();
const upload = multer({ 
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  storage: multer.memoryStorage()
});

router.use(requireJwtAuth);

/**
 * POST /connectors/google-cloud/upload
 * Uploads a Google Cloud service account JSON file.
 * Body: multipart/form-data with 'serviceAccount' file field
 */
router.post('/upload', upload.single('serviceAccount'), async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const serviceAccountData = JSON.parse(req.file.buffer.toString('utf8'));
    await uploadGoogleCloudServiceAccount(userId, serviceAccountData);
    
    res.json({ success: true, message: 'Service account uploaded successfully' });
  } catch (error) {
    logger.error('[GoogleCloud] Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /connectors/google-cloud/status
 * Gets the Google Cloud connection status.
 */
router.get('/status', async (req, res) => {
  try {
    const userId = req.user.id;
    const status = await getGoogleCloudStatus(userId);
    res.json(status);
  } catch (error) {
    logger.error('[GoogleCloud] Status error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /connectors/google-cloud/disconnect
 * Disconnects Google Cloud service account.
 */
router.post('/disconnect', async (req, res) => {
  try {
    const userId = req.user.id;
    await disconnectGoogleCloud(userId);
    res.json({ success: true });
  } catch (error) {
    logger.error('[GoogleCloud] Disconnect error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
