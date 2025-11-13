const express = require('express');
const { requireJwtAuth } = require('~/server/middleware');
const { directiveStore } = require('~/server/agent/directive');

const router = express.Router();

/**
 * GET /api/agent/directive/:conversationId
 * Get directive for a conversation
 */
router.get('/directive/:conversationId', requireJwtAuth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const directive = await directiveStore.getDirective(conversationId);

    if (!directive) {
      return res.status(404).json({ message: 'Directive not found' });
    }

    res.json(directive);
  } catch (error) {
    console.error('[Directive API] Error getting directive:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * POST /api/agent/directive/:conversationId
 * Save or update directive for a conversation
 */
router.post('/directive/:conversationId', requireJwtAuth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { systemPrompt, personality, memoryPolicy } = req.body;

    if (!systemPrompt || typeof systemPrompt !== 'string') {
      return res.status(400).json({ message: 'systemPrompt is required and must be a string' });
    }

    const directive = await directiveStore.saveDirective(
      conversationId,
      systemPrompt,
      personality,
      memoryPolicy,
    );

    res.json(directive);
  } catch (error) {
    console.error('[Directive API] Error saving directive:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET /api/agent/directive/:conversationId/history
 * Get directive history for a conversation
 */
router.get('/directive/:conversationId/history', requireJwtAuth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const history = await directiveStore.getDirectiveHistory(conversationId);
    res.json(history);
  } catch (error) {
    console.error('[Directive API] Error getting directive history:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * DELETE /api/agent/directive/:conversationId
 * Delete directive for a conversation
 */
router.delete('/directive/:conversationId', requireJwtAuth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const deleted = await directiveStore.deleteDirective(conversationId);

    if (!deleted) {
      return res.status(404).json({ message: 'Directive not found' });
    }

    res.json({ message: 'Directive deleted successfully' });
  } catch (error) {
    console.error('[Directive API] Error deleting directive:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET /api/agent/directive/presets
 * Get all directive presets
 */
router.get('/presets', requireJwtAuth, async (req, res) => {
  try {
    const presets = await directiveStore.getPresets();
    res.json(presets);
  } catch (error) {
    console.error('[Directive API] Error getting presets:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
