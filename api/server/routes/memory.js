const express = require('express');
const { requireJwtAuth } = require('~/server/middleware');
const { memoryStore } = require('~/server/memory/store');

const router = express.Router();

/**
 * GET /api/memory/:conversationId
 * Get all memory items for a conversation
 */
router.get('/:conversationId', requireJwtAuth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const items = await memoryStore.getMemoryItems(conversationId);
    res.json(items);
  } catch (error) {
    console.error('[Memory API] Error getting memory items:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * POST /api/memory/:conversationId
 * Add a memory item to a conversation
 */
router.post('/:conversationId', requireJwtAuth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ message: 'content is required and must be a string' });
    }
    
    const memoryItem = await memoryStore.addMemoryItem(conversationId, content);
    res.json(memoryItem);
  } catch (error) {
    console.error('[Memory API] Error adding memory item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * PATCH /api/memory/:conversationId/:itemId
 * Update a memory item
 */
router.patch('/:conversationId/:itemId', requireJwtAuth, async (req, res) => {
  try {
    const { conversationId, itemId } = req.params;
    const updates = req.body;
    
    const updatedItem = await memoryStore.updateMemoryItem(conversationId, itemId, updates);
    
    if (!updatedItem) {
      return res.status(404).json({ message: 'Memory item not found' });
    }
    
    res.json(updatedItem);
  } catch (error) {
    console.error('[Memory API] Error updating memory item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * DELETE /api/memory/:conversationId/:itemId
 * Delete a memory item
 */
router.delete('/:conversationId/:itemId', requireJwtAuth, async (req, res) => {
  try {
    const { conversationId, itemId } = req.params;
    const deleted = await memoryStore.deleteMemoryItem(conversationId, itemId);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Memory item not found' });
    }
    
    res.json({ message: 'Memory item deleted successfully' });
  } catch (error) {
    console.error('[Memory API] Error deleting memory item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * DELETE /api/memory/:conversationId
 * Clear all memory for a conversation
 */
router.delete('/:conversationId', requireJwtAuth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    await memoryStore.clearConversationMemory(conversationId);
    res.json({ message: 'Memory cleared successfully' });
  } catch (error) {
    console.error('[Memory API] Error clearing memory:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
