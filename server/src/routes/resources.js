const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { getDb, saveDb } = require('../db/store');
const { authenticateUser, optionalAuth, requireRole } = require('../middleware/auth');
const { UPLOADS_DIR } = require('../config');
const { summarizeResource } = require('../services/aiService');

// Multer storage for uploaded PDFs
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf' || ext === '.docx' || ext === '.pptx' || ext === '.txt') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOCX, PPTX, or TXT documents are supported.'));
    }
  }
});

// GET /api/v1/resources - List internal resources
router.get('/', (req, res) => {
  const db = getDb();
  const { subject, level, course_code, uploader_id } = req.query;

  let results = db.resources.filter(r => !r.is_flagged);

  if (subject) {
    results = results.filter(r => r.subject.toLowerCase() === subject.toLowerCase());
  }
  if (level) {
    results = results.filter(r => r.academic_level.toLowerCase() === level.toLowerCase());
  }
  if (course_code) {
    results = results.filter(r => (r.course_code || '').toLowerCase().includes(course_code.toLowerCase()));
  }
  if (uploader_id) {
    results = results.filter(r => r.uploader_id === uploader_id);
  }

  res.json({ count: results.length, resources: results });
});

// GET /api/v1/resources/trending
router.get('/trending', (req, res) => {
  const db = getDb();
  const trending = [...db.resources]
    .sort((a, b) => (b.download_count || 0) + (b.view_count || 0) * 0.1 - ((a.download_count || 0) + (a.view_count || 0) * 0.1))
    .slice(0, 6);

  res.json({ trending });
});

// GET /api/v1/resources/:id - Get resource details
router.get('/:id', optionalAuth, (req, res) => {
  const db = getDb();
  const resource = db.resources.find(r => r.id === req.params.id);

  if (!resource) {
    // If not found in internal DB, check if it's in external search service
    const { fallbackAcademicPapers } = require('../services/externalSearchService');
    const externalResource = fallbackAcademicPapers.find(p => p.id === req.params.id);
    if (externalResource) {
      return res.json({ resource: externalResource, reviews: [], comments: [], related: [] });
    }
    return res.status(404).json({ error: 'Resource not found.' });
  }

  // Increment view count
  resource.view_count = (resource.view_count || 0) + 1;
  saveDb();

  // Fetch reviews and comments
  const reviews = (db.reviews || []).filter(r => r.resource_id === resource.id);
  const comments = (db.comments || []).filter(c => c.resource_id === resource.id);

  // Check if bookmarked by current user
  let isBookmarked = false;
  if (req.user) {
    isBookmarked = (db.bookmarks || []).some(b => b.user_id === req.user.id && b.resource_id === resource.id);
  }

  // Related resources (same subject, excluding self)
  const related = (db.resources || [])
    .filter(r => r.id !== resource.id && r.subject === resource.subject)
    .slice(0, 3);

  res.json({
    resource,
    isBookmarked,
    reviews,
    comments,
    related
  });
});

// POST /api/v1/resources - Upload/Contribute reading material (Open to all students & educators)
router.post('/', optionalAuth, upload.single('file'), async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      course_code,
      academic_level,
      author_name,
      institution,
      tags
    } = req.body;

    if (!title || !subject) {
      return res.status(400).json({ error: 'Title and subject are required.' });
    }

    const db = getDb();
    const parsedTags = Array.isArray(tags) 
      ? tags 
      : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : []);

    let fileUrl = '/api/v1/resources/preview-sample/cs106b.pdf';
    let fileSizeBytes = 3500000;
    let pageCount = 28;

    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
      fileSizeBytes = req.file.size;
      pageCount = Math.max(5, Math.round(fileSizeBytes / 150000));
    }

    const uploaderName = req.user ? req.user.full_name : (author_name || 'Student Contributor');
    const uploaderInst = req.user ? (req.user.institution || 'Academic Institution') : (institution || 'Open Academic Community');

    const newResource = {
      id: 'res_' + uuidv4().slice(0, 8),
      title,
      description: description || 'Study material uploaded to open academic repository.',
      subject,
      course_code: course_code || 'General',
      academic_level: academic_level || 'undergraduate',
      file_url: fileUrl,
      file_type: 'pdf',
      file_size_bytes: fileSizeBytes,
      page_count: pageCount,
      uploader_id: req.user ? req.user.id : 'guest_student',
      uploader_name: uploaderName,
      uploader_institution: uploaderInst,
      source: 'internal',
      ai_summary: '',
      key_takeaways: [
        'Open-access study material contributed for students',
        'Direct PDF download available',
        `Subject focus: ${subject}`
      ],
      tags: parsedTags.length > 0 ? parsedTags : [subject, 'Study Notes', 'PDF'],
      download_count: 1,
      view_count: 5,
      rating_avg: 5.0,
      rating_count: 1,
      is_flagged: false,
      created_at: new Date().toISOString()
    };

    // Auto-generate AI summary & key takeaways
    const aiInsight = await summarizeResource(newResource);
    newResource.ai_summary = aiInsight.summary;
    newResource.key_takeaways = aiInsight.keyTakeaways;

    db.resources.unshift(newResource);
    saveDb();

    res.status(201).json({
      message: 'Resource uploaded successfully.',
      resource: newResource
    });
  } catch (err) {
    console.error('Resource upload error:', err);
    res.status(500).json({ error: 'Failed to upload resource: ' + err.message });
  }
});

// PUT /api/v1/resources/:id - Update resource (Owner or Admin)
router.put('/:id', authenticateUser, (req, res) => {
  const db = getDb();
  const resource = db.resources.find(r => r.id === req.params.id);

  if (!resource) return res.status(404).json({ error: 'Resource not found.' });

  // Ownership check
  if (resource.uploader_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized to edit this resource.' });
  }

  const { title, description, subject, course_code, academic_level, tags } = req.body;
  if (title) resource.title = title;
  if (description) resource.description = description;
  if (subject) resource.subject = subject;
  if (course_code !== undefined) resource.course_code = course_code;
  if (academic_level) resource.academic_level = academic_level;
  if (tags && Array.isArray(tags)) resource.tags = tags;

  saveDb();
  res.json({ message: 'Resource updated.', resource });
});

// DELETE /api/v1/resources/:id - Delete resource
router.delete('/:id', authenticateUser, (req, res) => {
  const db = getDb();
  const index = db.resources.findIndex(r => r.id === req.params.id);

  if (index === -1) return res.status(404).json({ error: 'Resource not found.' });

  const resource = db.resources[index];
  if (resource.uploader_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized to delete this resource.' });
  }

  db.resources.splice(index, 1);
  saveDb();
  res.json({ message: 'Resource deleted.' });
});

// POST /api/v1/resources/:id/download - Increment download and return stream/url
router.post('/:id/download', (req, res) => {
  const db = getDb();
  const resource = db.resources.find(r => r.id === req.params.id);

  if (resource) {
    resource.download_count = (resource.download_count || 0) + 1;
    saveDb();
    return res.json({ 
      downloadUrl: resource.file_url, 
      downloadCount: resource.download_count,
      title: resource.title 
    });
  }

  // If external resource
  const targetUrl = req.body.url || (req.body.resource && req.body.resource.file_url) || 'https://arxiv.org';
  res.json({ 
    downloadUrl: targetUrl, 
    downloadCount: 1,
    title: req.body.title || 'Academic Reading Material'
  });
});

// GET /api/v1/resources/:id/download-file - Direct browser download trigger
router.get('/:id/download-file', (req, res) => {
  const db = getDb();
  const resource = db.resources.find(r => r.id === req.params.id);

  if (!resource) {
    // If external URL passed in query
    if (req.query.url) {
      return res.redirect(req.query.url);
    }
    return res.status(404).json({ error: 'Reading material not found.' });
  }

  resource.download_count = (resource.download_count || 0) + 1;
  saveDb();

  // If local uploaded file
  if (resource.file_url.startsWith('/uploads/')) {
    const filename = resource.file_url.replace('/uploads/', '');
    const filePath = path.join(UPLOADS_DIR, filename);
    const cleanTitle = (resource.title || 'study_document').replace(/[^a-zA-Z0-9_-]/g, '_') + '.pdf';
    return res.download(filePath, cleanTitle);
  }

  // If external web link
  if (resource.file_url.startsWith('http')) {
    return res.redirect(resource.file_url);
  }

  // If sample document
  res.redirect(`${resource.file_url}?download=1`);
});

module.exports = router;
