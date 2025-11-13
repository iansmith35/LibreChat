const express = require('express');
const { generateCheckAccess } = require('@librechat/api');
const { PermissionTypes, Permissions } = require('librechat-data-provider');
const { requireJwtAuth } = require('~/server/middleware');
const { getRoleByName } = require('~/models/Role');
const {
  getDirectives,
  getDirective,
  createDirective,
  updateDirective,
  deleteDirective,
  getPresets,
} = require('~/server/services/Directives');

const router = express.Router();

const checkDirectiveRead = generateCheckAccess({
  permissionType: PermissionTypes.PROMPTS,
  permissions: [Permissions.USE, Permissions.READ],
  getRoleByName,
});
const checkDirectiveCreate = generateCheckAccess({
  permissionType: PermissionTypes.PROMPTS,
  permissions: [Permissions.USE, Permissions.CREATE],
  getRoleByName,
});
const checkDirectiveUpdate = generateCheckAccess({
  permissionType: PermissionTypes.PROMPTS,
  permissions: [Permissions.USE, Permissions.UPDATE],
  getRoleByName,
});
const checkDirectiveDelete = generateCheckAccess({
  permissionType: PermissionTypes.PROMPTS,
  permissions: [Permissions.USE, Permissions.DELETE],
  getRoleByName,
});

router.use(requireJwtAuth);

/**
 * GET /directives
 * Returns all directives for the authenticated user.
 */
router.get('/', checkDirectiveRead, async (req, res) => {
  try {
    const directives = await getDirectives(req.user.id);
    res.json({ directives });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /directives/presets
 * Returns available directive presets.
 */
router.get('/presets', checkDirectiveRead, async (req, res) => {
  try {
    const presets = getPresets();
    res.json({ presets });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /directives/:id
 * Returns a specific directive by ID.
 */
router.get('/:id', checkDirectiveRead, async (req, res) => {
  try {
    const directive = await getDirective(req.user.id, req.params.id);
    if (!directive) {
      return res.status(404).json({ error: 'Directive not found' });
    }
    res.json({ directive });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /directives
 * Creates a new directive for the authenticated user.
 * Body: { name: string, systemPrompt?: string, personality?: string, directives?: string, memoryPolicy?: string }
 */
router.post('/', checkDirectiveCreate, async (req, res) => {
  try {
    const { name, systemPrompt, personality, directives, memoryPolicy } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required and must be a non-empty string.' });
    }

    const directive = await createDirective(req.user.id, {
      name: name.trim(),
      systemPrompt: systemPrompt?.trim() || '',
      personality: personality?.trim() || '',
      directives: directives?.trim() || '',
      memoryPolicy: memoryPolicy?.trim() || '',
    });

    res.status(201).json({ created: true, directive });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /directives/:id
 * Updates an existing directive.
 * Body: { name?: string, systemPrompt?: string, personality?: string, directives?: string, memoryPolicy?: string }
 */
router.patch('/:id', checkDirectiveUpdate, async (req, res) => {
  try {
    const { name, systemPrompt, personality, directives, memoryPolicy } = req.body;

    const updates = {};
    if (name !== undefined) {
      updates.name = name.trim();
    }
    if (systemPrompt !== undefined) {
      updates.systemPrompt = systemPrompt.trim();
    }
    if (personality !== undefined) {
      updates.personality = personality.trim();
    }
    if (directives !== undefined) {
      updates.directives = directives.trim();
    }
    if (memoryPolicy !== undefined) {
      updates.memoryPolicy = memoryPolicy.trim();
    }

    const directive = await updateDirective(req.user.id, req.params.id, updates);
    if (!directive) {
      return res.status(404).json({ error: 'Directive not found' });
    }

    res.json({ updated: true, directive });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /directives/:id
 * Deletes a directive.
 */
router.delete('/:id', checkDirectiveDelete, async (req, res) => {
  try {
    const result = await deleteDirective(req.user.id, req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Directive not found' });
    }

    res.json({ deleted: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
