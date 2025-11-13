const express = require('express');
const router = express.Router();
const directiveStore = require('../agent/directive');
const { requireJwtAuth } = require('../middleware');
const { logger } = require('@librechat/data-schemas');

/**
 * Get directive for a conversation
 * GET /api/agent/directive/:conversationId
 */
router.get('/:conversationId', requireJwtAuth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const directive = await directiveStore.read(conversationId);
    res.json(directive);
  } catch (error) {
    logger.error('[Directive API] Error getting directive:', error);
    res.status(500).json({ error: 'Failed to retrieve directive' });
  }
});

/**
 * Save directive for a conversation
 * POST /api/agent/directive/:conversationId
 * Body: { systemPrompt, personality, directives, memoryPolicy, presets }
 */
router.post('/:conversationId', requireJwtAuth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const directiveData = req.body;
    const savedDirective = await directiveStore.write(conversationId, directiveData);
    res.json(savedDirective);
  } catch (error) {
    logger.error('[Directive API] Error saving directive:', error);
    res.status(500).json({ error: 'Failed to save directive' });
  }
});

/**
 * Delete directive for a conversation
 * DELETE /api/agent/directive/:conversationId
 */
router.delete('/:conversationId', requireJwtAuth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    await directiveStore.delete(conversationId);
    res.json({ success: true });
  } catch (error) {
    logger.error('[Directive API] Error deleting directive:', error);
    res.status(500).json({ error: 'Failed to delete directive' });
  }
});

module.exports = router;
