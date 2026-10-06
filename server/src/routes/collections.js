const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb, saveDb } = require('../db/store');
const { authenticateUser, requireRole } = require('../middleware/auth');

// GET /api/v1/collections - List study packs
router.get('/', (req, res) => {
  const db = getDb();
  const { subject } = req.query;

  let list = db.collections || [];
  if (subject) {
    list = list.filter(c => c.subject.toLowerCase() === subject.toLowerCase());
  }

  // Populate resources in collection
  const populated = list.map(col => {
    const resources = (col.resource_ids || []).map(id => db.resources.find(r => r.id === id)).filter(Boolean);
    return {
      ...col,
      resourcesCount: resources.length,
      resources: resources.slice(0, 4)
    };
  });

  res.json({ count: populated.length, collections: populated });
});

// GET /api/v1/collections/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const col = (db.collections || []).find(c => c.id === req.params.id);
  if (!col) return res.status(404).json({ error: 'Collection not found.' });

  const resources = (col.resource_ids || []).map(id => db.resources.find(r => r.id === id)).filter(Boolean);

  res.json({
    collection: {
      ...col,
      resources
    }
  });
});

// POST /api/v1/collections - Create study pack (Instructors only)
router.post('/', authenticateUser, requireRole('instructor', 'admin'), (req, res) => {
  const { title, description, subject, resource_ids, banner_color } = req.body;
  if (!title || !subject) {
    return res.status(400).json({ error: 'Title and subject are required.' });
  }

  const db = getDb();
  const newCol = {
    id: 'col_' + uuidv4().slice(0, 8),
    title,
    description: description || '',
    creator_id: req.user.id,
    creator_name: req.user.full_name,
    subject,
    resource_ids: Array.isArray(resource_ids) ? resource_ids : [],
    banner_color: banner_color || 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
    likes_count: 0,
    created_at: new Date().toISOString()
  };

  db.collections.unshift(newCol);
  saveDb();

  res.status(201).json({ message: 'Study Pack created.', collection: newCol });
});

module.exports = router;
