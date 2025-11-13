const express = require('express');
const { requireJwtAuth } = require('~/server/middleware');
const { getDirective, saveDirective } = require('~/server/services/Directive');

const router = express.Router();

router.use(requireJwtAuth);

/**
 * GET /agents/directive/:conversationId
 * Retrieves the directive for a specific conversation.
 * Returns the directive object or null if not found.
 */
router.get('/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const directive = await getDirective(userId, conversationId);
    res.json(directive || { conversationId, directive: null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /agents/directive/:conversationId
 * Saves or updates the directive for a specific conversation.
 * Body: {
 *   systemPrompt: string,
 *   personality: string,
 *   directives: string,
 *   memoryPolicy: string
 * }
 */
router.post('/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const { systemPrompt, personality, directives, memoryPolicy } = req.body;

    const directive = await saveDirective(userId, conversationId, {
      systemPrompt,
      personality,
      directives,
      memoryPolicy,
    });

    res.json({ success: true, directive });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
