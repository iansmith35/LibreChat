const path = require('path');
const fs = require('fs').promises;
const {
  getDirectives,
  getDirective,
  createDirective,
  updateDirective,
  deleteDirective,
  getPresets,
} = require('./index');

// Mock storage path for tests
const TEST_STORAGE_PATH = path.join(__dirname, '../../../test/storage/directives');

describe('Directives Service', () => {
  const TEST_USER_ID = 'test-user-123';

  beforeAll(async () => {
    // Set test storage path
    process.env.DIRECTIVE_STORE_PATH = TEST_STORAGE_PATH;
    // Ensure test storage directory exists
    await fs.mkdir(TEST_STORAGE_PATH, { recursive: true });
  });

  afterAll(async () => {
    // Clean up test storage
    try {
      const files = await fs.readdir(TEST_STORAGE_PATH);
      for (const file of files) {
        await fs.unlink(path.join(TEST_STORAGE_PATH, file));
      }
      await fs.rmdir(TEST_STORAGE_PATH);
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  afterEach(async () => {
    // Clean up test user's directives after each test
    try {
      const filePath = path.join(TEST_STORAGE_PATH, `${TEST_USER_ID}.json`);
      await fs.unlink(filePath);
    } catch (error) {
      // Ignore if file doesn't exist
    }
  });

  describe('getPresets', () => {
    it('should return an array of preset directives', () => {
      const presets = getPresets();
      expect(Array.isArray(presets)).toBe(true);
      expect(presets.length).toBeGreaterThan(0);
      expect(presets[0]).toHaveProperty('name');
      expect(presets[0]).toHaveProperty('systemPrompt');
      expect(presets[0]).toHaveProperty('personality');
      expect(presets[0]).toHaveProperty('directives');
      expect(presets[0]).toHaveProperty('memoryPolicy');
    });

    it('should include expected preset names', () => {
      const presets = getPresets();
      const names = presets.map(p => p.name);
      expect(names).toContain('Professional Assistant');
      expect(names).toContain('Creative Writer');
      expect(names).toContain('Technical Expert');
      expect(names).toContain('Educational Tutor');
    });
  });

  describe('getDirectives', () => {
    it('should return an empty array for a new user', async () => {
      const directives = await getDirectives(TEST_USER_ID);
      expect(Array.isArray(directives)).toBe(true);
      expect(directives.length).toBe(0);
    });

    it('should return directives after creating some', async () => {
      await createDirective(TEST_USER_ID, {
        name: 'Test Directive',
        systemPrompt: 'Test prompt',
        personality: 'Test personality',
        directives: 'Test directives',
        memoryPolicy: 'Test policy',
      });

      const directives = await getDirectives(TEST_USER_ID);
      expect(directives.length).toBe(1);
      expect(directives[0].name).toBe('Test Directive');
    });
  });

  describe('createDirective', () => {
    it('should create a new directive', async () => {
      const data = {
        name: 'My Assistant',
        systemPrompt: 'You are helpful',
        personality: 'Friendly',
        directives: '- Be concise',
        memoryPolicy: 'Remember context',
      };

      const directive = await createDirective(TEST_USER_ID, data);

      expect(directive).toHaveProperty('id');
      expect(directive.name).toBe(data.name);
      expect(directive.systemPrompt).toBe(data.systemPrompt);
      expect(directive.personality).toBe(data.personality);
      expect(directive.directives).toBe(data.directives);
      expect(directive.memoryPolicy).toBe(data.memoryPolicy);
      expect(directive).toHaveProperty('createdAt');
      expect(directive).toHaveProperty('updatedAt');
    });

    it('should generate unique IDs for multiple directives', async () => {
      const directive1 = await createDirective(TEST_USER_ID, {
        name: 'Directive 1',
        systemPrompt: 'Prompt 1',
        personality: 'Personality 1',
        directives: 'Directives 1',
        memoryPolicy: 'Policy 1',
      });

      const directive2 = await createDirective(TEST_USER_ID, {
        name: 'Directive 2',
        systemPrompt: 'Prompt 2',
        personality: 'Personality 2',
        directives: 'Directives 2',
        memoryPolicy: 'Policy 2',
      });

      expect(directive1.id).not.toBe(directive2.id);
    });
  });

  describe('getDirective', () => {
    it('should return null for non-existent directive', async () => {
      const directive = await getDirective(TEST_USER_ID, 'non-existent-id');
      expect(directive).toBeNull();
    });

    it('should return the correct directive by ID', async () => {
      const created = await createDirective(TEST_USER_ID, {
        name: 'Find Me',
        systemPrompt: 'Test',
        personality: 'Test',
        directives: 'Test',
        memoryPolicy: 'Test',
      });

      const found = await getDirective(TEST_USER_ID, created.id);
      expect(found).not.toBeNull();
      expect(found.id).toBe(created.id);
      expect(found.name).toBe('Find Me');
    });
  });

  describe('updateDirective', () => {
    it('should update an existing directive', async () => {
      const created = await createDirective(TEST_USER_ID, {
        name: 'Original',
        systemPrompt: 'Original',
        personality: 'Original',
        directives: 'Original',
        memoryPolicy: 'Original',
      });

      const updated = await updateDirective(TEST_USER_ID, created.id, {
        name: 'Updated',
        systemPrompt: 'Updated',
      });

      expect(updated).not.toBeNull();
      expect(updated.name).toBe('Updated');
      expect(updated.systemPrompt).toBe('Updated');
      expect(updated.personality).toBe('Original'); // Unchanged
      expect(updated.updatedAt).not.toBe(created.updatedAt);
    });

    it('should return null for non-existent directive', async () => {
      const updated = await updateDirective(TEST_USER_ID, 'non-existent-id', {
        name: 'Updated',
      });
      expect(updated).toBeNull();
    });
  });

  describe('deleteDirective', () => {
    it('should delete an existing directive', async () => {
      const created = await createDirective(TEST_USER_ID, {
        name: 'To Delete',
        systemPrompt: 'Test',
        personality: 'Test',
        directives: 'Test',
        memoryPolicy: 'Test',
      });

      const result = await deleteDirective(TEST_USER_ID, created.id);
      expect(result).toBe(true);

      const found = await getDirective(TEST_USER_ID, created.id);
      expect(found).toBeNull();
    });

    it('should return false for non-existent directive', async () => {
      const result = await deleteDirective(TEST_USER_ID, 'non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('persistence', () => {
    it('should persist directives across multiple operations', async () => {
      // Create
      const directive1 = await createDirective(TEST_USER_ID, {
        name: 'First',
        systemPrompt: 'Test 1',
        personality: 'Test 1',
        directives: 'Test 1',
        memoryPolicy: 'Test 1',
      });

      const directive2 = await createDirective(TEST_USER_ID, {
        name: 'Second',
        systemPrompt: 'Test 2',
        personality: 'Test 2',
        directives: 'Test 2',
        memoryPolicy: 'Test 2',
      });

      // Read all
      let directives = await getDirectives(TEST_USER_ID);
      expect(directives.length).toBe(2);

      // Update one
      await updateDirective(TEST_USER_ID, directive1.id, { name: 'First Updated' });

      // Read all again
      directives = await getDirectives(TEST_USER_ID);
      expect(directives.length).toBe(2);
      const updated = directives.find(d => d.id === directive1.id);
      expect(updated.name).toBe('First Updated');

      // Delete one
      await deleteDirective(TEST_USER_ID, directive2.id);

      // Read all again
      directives = await getDirectives(TEST_USER_ID);
      expect(directives.length).toBe(1);
      expect(directives[0].id).toBe(directive1.id);
    });
  });
});
