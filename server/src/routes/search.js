const express = require('express');
const router = express.Router();
const { getDb, WORLD_SUBJECT_CATEGORIES, ALL_SUBJECTS } = require('../db/store');
const { searchPdfNotes, searchAllResources } = require('../services/externalSearchService');

// GET /api/v1/search/subjects - Return all subjects taught in the world
router.get('/subjects', (req, res) => {
  res.json({
    categories: WORLD_SUBJECT_CATEGORIES,
    allSubjects: ALL_SUBJECTS,
    totalCount: ALL_SUBJECTS.length
  });
});

// GET /api/v1/search - Unified Real-Time Reading Materials & PDF Search
router.get('/', async (req, res) => {
  try {
    const {
      q = '',
      subject = '',
      type = 'all', // 'all' | 'textbook' | 'notes' | 'exam' | 'paper' | 'cheatsheet'
      level = '',
      sort = 'relevance', // 'relevance' | 'downloads' | 'rating' | 'newest'
      page = 1,
      limit = 16
    } = req.query;

    const queryStr = (q || '').trim();
    const subjectFilter = (subject || '').trim();
    const typeFilter = (type || 'all').toLowerCase();
    const levelFilter = (level || '').trim().toLowerCase();

    const db = getDb();
    let internalMaterials = (db.resources || []).filter(r => !r.is_flagged).map(r => ({
      ...r,
      type: 'pdf',
      document_type: r.course_code?.includes('Exam') || r.title?.toLowerCase().includes('exam') ? 'exam_packet'
        : r.title?.toLowerCase().includes('cheatsheet') ? 'cheatsheet'
        : r.title?.toLowerCase().includes('slides') ? 'lecture_notes'
        : 'lecture_notes'
    }));

    // Filter internal resources by query and subject
    if (queryStr) {
      const qLower = queryStr.toLowerCase();
      internalMaterials = internalMaterials.filter(r => 
        (r.title && r.title.toLowerCase().includes(qLower)) ||
        (r.description && r.description.toLowerCase().includes(qLower)) ||
        (r.course_code && r.course_code.toLowerCase().includes(qLower)) ||
        (r.subject && r.subject.toLowerCase().includes(qLower)) ||
        (Array.isArray(r.tags) && r.tags.some(t => t.toLowerCase().includes(qLower)))
      );
    }

    if (subjectFilter && subjectFilter !== 'All Subjects') {
      internalMaterials = internalMaterials.filter(r => 
        r.subject && r.subject.toLowerCase() === subjectFilter.toLowerCase()
      );
    }

    if (levelFilter && levelFilter !== 'all') {
      internalMaterials = internalMaterials.filter(r => 
        !r.academic_level || r.academic_level.toLowerCase() === levelFilter
      );
    }

    // Fetch external live PDF materials via arXiv, OpenAlex, Open Library, Gutenberg
    const fetchedResults = await searchPdfNotes(
      queryStr,
      subjectFilter === 'All Subjects' ? '' : subjectFilter,
      levelFilter === 'all' ? '' : levelFilter,
      Math.min(32, Math.max(1, parseInt(limit) * 2 || 24))
    );

    // Merge internal materials first (high verification confidence) with external materials
    const seenTitles = new Set();
    const combined = [];

    for (const item of [...internalMaterials, ...fetchedResults]) {
      const key = (item.title || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 32);
      if (key && !seenTitles.has(key)) {
        seenTitles.add(key);
        combined.push({
          ...item,
          type: 'pdf' // All reading materials are PDFs
        });
      }
    }

    // Filter by document type if specified
    let filtered = combined;
    if (typeFilter && typeFilter !== 'all') {
      filtered = combined.filter(item => {
        const titleLower = (item.title || '').toLowerCase();
        const descLower = (item.description || '').toLowerCase();
        if (typeFilter === 'textbook') {
          return item.document_type === 'textbook' || item.source === 'openlibrary' || titleLower.includes('textbook') || titleLower.includes('handbook') || titleLower.includes('volume');
        }
        if (typeFilter === 'notes') {
          return item.document_type === 'lecture_notes' || titleLower.includes('notes') || titleLower.includes('lecture') || titleLower.includes('slides');
        }
        if (typeFilter === 'exam') {
          return item.document_type === 'exam_packet' || titleLower.includes('exam') || titleLower.includes('midterm') || titleLower.includes('final') || titleLower.includes('solved');
        }
        if (typeFilter === 'cheatsheet') {
          return item.document_type === 'cheatsheet' || titleLower.includes('cheat') || titleLower.includes('formula') || titleLower.includes('summary');
        }
        if (typeFilter === 'paper') {
          return item.source === 'arxiv' || item.source === 'openalex' || titleLower.includes('paper') || titleLower.includes('review') || descLower.includes('preprint');
        }
        return true;
      });
    }

    // Sort results
    if (sort === 'downloads') {
      filtered.sort((a, b) => (b.download_count || 0) - (a.download_count || 0));
    } else if (sort === 'rating') {
      filtered.sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0));
    } else if (sort === 'newest') {
      filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(30, Math.max(1, parseInt(limit) || 16));
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedResults = filtered.slice(startIndex, startIndex + limitNum);

    res.json({
      query: queryStr,
      subject: subjectFilter,
      type: typeFilter,
      total: filtered.length,
      page: pageNum,
      totalPages: Math.ceil(filtered.length / limitNum) || 1,
      results: paginatedResults
    });
  } catch (err) {
    console.error('Real-time academic search error:', err);
    res.status(500).json({ error: 'Search failed due to internal error.' });
  }
});

module.exports = router;
