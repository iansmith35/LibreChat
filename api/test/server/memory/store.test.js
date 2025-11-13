const fs = require('fs');
const path = require('path');
const FileBackedMemoryStore = require('../../../server/memory/store');

describe('FileBackedMemoryStore', () => {
  let store;
  let testDir;
  const testConversationId = 'test-conv-123';

  beforeEach(() => {
    // Create a temporary directory for tests
    testDir = path.join(__dirname, '..', '..', '..', 'data', 'test-memory');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    store = new FileBackedMemoryStore.default(testDir);
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('addMemoryItem', () => {
    it('should add a memory item to a conversation', async () => {
      const content = 'Test memory content';
      const item = await store.addMemoryItem(testConversationId, content);

      expect(item).toBeDefined();
      expect(item.id).toBeDefined();
      expect(item.conversationId).toBe(testConversationId);
      expect(item.content).toBe(content);
      expect(item.enabled).toBe(true);
      expect(item.timestamp).toBeDefined();
    });

    it('should persist memory items to disk', async () => {
      const content = 'Persistent test memory';
      await store.addMemoryItem(testConversationId, content);

      // Create a new store instance to verify persistence
      const newStore = new FileBackedMemoryStore.default(testDir);
      const items = await newStore.getMemoryItems(testConversationId);

      expect(items).toHaveLength(1);
      expect(items[0].content).toBe(content);
    });
  });

  describe('getMemoryItems', () => {
    it('should return empty array for conversation with no memories', async () => {
      const items = await store.getMemoryItems('non-existent-conv');
      expect(items).toEqual([]);
    });

    it('should return all memory items for a conversation', async () => {
      await store.addMemoryItem(testConversationId, 'Memory 1');
      await store.addMemoryItem(testConversationId, 'Memory 2');
      await store.addMemoryItem(testConversationId, 'Memory 3');

      const items = await store.getMemoryItems(testConversationId);
      expect(items).toHaveLength(3);
    });
  });

  describe('updateMemoryItem', () => {
    it('should update a memory item', async () => {
      const item = await store.addMemoryItem(testConversationId, 'Original content');
      
      const updated = await store.updateMemoryItem(testConversationId, item.id, {
        content: 'Updated content',
        enabled: false,
      });

      expect(updated).toBeDefined();
      expect(updated.content).toBe('Updated content');
      expect(updated.enabled).toBe(false);
      expect(updated.id).toBe(item.id); // ID should not change
    });

    it('should return null for non-existent item', async () => {
      const updated = await store.updateMemoryItem(testConversationId, 'fake-id', {
        content: 'New content',
      });

      expect(updated).toBeNull();
    });
  });

  describe('deleteMemoryItem', () => {
    it('should delete a memory item', async () => {
      const item = await store.addMemoryItem(testConversationId, 'To be deleted');
      
      const deleted = await store.deleteMemoryItem(testConversationId, item.id);
      expect(deleted).toBe(true);

      const items = await store.getMemoryItems(testConversationId);
      expect(items).toHaveLength(0);
    });

    it('should return false for non-existent item', async () => {
      const deleted = await store.deleteMemoryItem(testConversationId, 'fake-id');
      expect(deleted).toBe(false);
    });
  });

  describe('getEnabledMemoryItems', () => {
    it('should return only enabled memory items', async () => {
      const item1 = await store.addMemoryItem(testConversationId, 'Enabled memory');
      await store.addMemoryItem(testConversationId, 'Disabled memory');
      
      // Disable the second item
      await store.updateMemoryItem(testConversationId, item1.id, { enabled: false });

      const enabledItems = await store.getEnabledMemoryItems(testConversationId);
      expect(enabledItems).toHaveLength(1);
      expect(enabledItems[0].content).toBe('Disabled memory');
    });
  });

  describe('clearConversationMemory', () => {
    it('should clear all memory for a conversation', async () => {
      await store.addMemoryItem(testConversationId, 'Memory 1');
      await store.addMemoryItem(testConversationId, 'Memory 2');

      await store.clearConversationMemory(testConversationId);

      const items = await store.getMemoryItems(testConversationId);
      expect(items).toHaveLength(0);
    });
  });

  describe('atomic writes', () => {
    it('should handle concurrent writes safely', async () => {
      // Simulate concurrent writes
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(store.addMemoryItem(testConversationId, `Concurrent memory ${i}`));
      }

      await Promise.all(promises);

      const items = await store.getMemoryItems(testConversationId);
      expect(items).toHaveLength(10);
    });
  });
});
