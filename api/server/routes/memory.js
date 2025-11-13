const express = require('express');
const router = express.Router();
const memoryStore = require('../memory/store');
const { requireJwtAuth } = require('../middleware');
const { logger } = require('@librechat/data-schemas');

/**
 * Get memory for a conversation
 * GET /api/memory/:conversationId
 */
router.get('/:conversationId', requireJwtAuth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const memory = await memoryStore.read(conversationId);
    res.json(memory);
  } catch (error) {
    logger.error('[Memory API] Error getting memory:', error);
    res.status(500).json({ error: 'Failed to retrieve memory' });
  }
});

/**
 * Save memory for a conversation
 * POST /api/memory/:conversationId
 * Body: { facts: [], metadata: {} }
 */
router.post('/:conversationId', requireJwtAuth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const memoryData = req.body;
    const savedMemory = await memoryStore.write(conversationId, memoryData);
    res.json(savedMemory);
  } catch (error) {
    logger.error('[Memory API] Error saving memory:', error);
    res.status(500).json({ error: 'Failed to save memory' });
  }
});

/**
 * Delete memory for a conversation
 * DELETE /api/memory/:conversationId
 */
router.delete('/:conversationId', requireJwtAuth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    await memoryStore.delete(conversationId);
    res.json({ success: true });
  } catch (error) {
    logger.error('[Memory API] Error deleting memory:', error);
    res.status(500).json({ error: 'Failed to delete memory' });
  }
});

/**
 * List all conversations with memories
 * GET /api/memory
 */
router.get('/', requireJwtAuth, async (req, res) => {
  try {
    const conversationIds = await memoryStore.list();
    res.json({ conversationIds });
  } catch (error) {
    logger.error('[Memory API] Error listing memories:', error);
    res.status(500).json({ error: 'Failed to list memories' });
  }
});

module.exports = router;
