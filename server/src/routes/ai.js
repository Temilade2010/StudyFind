const express = require('express');
const router = express.Router();
const { getDb } = require('../db/store');
const { summarizeResource, answerQuestionAboutDocument, suggestTagsForUpload } = require('../services/aiService');

// POST /api/v1/ai/summarize/:resourceId
router.post('/summarize/:resourceId', async (req, res) => {
  try {
    const db = getDb();
    let resource = req.body?.resource || 
                   (db.resources || []).find(r => r.id === req.params.resourceId);

    if (!resource) {
      // Fallback placeholder resource from ID
      resource = {
        id: req.params.resourceId,
        title: req.body?.title || 'Academic Resource',
        subject: req.body?.subject || 'Academic Discipline',
        description: req.body?.description || 'Educational material for student research and revision.'
      };
    }

    const insight = await summarizeResource(resource);
    res.json(insight);
  } catch (err) {
    console.error('AI summary error:', err);
    res.status(500).json({ error: 'Failed to generate summary: ' + err.message });
  }
});

// POST /api/v1/ai/qa/:resourceId - Chat with Resource/Topic
router.post('/qa/:resourceId', async (req, res) => {
  try {
    const { question, resource: clientResource } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question is required.' });
    }

    const db = getDb();
    let resource = clientResource || 
                   (db.resources || []).find(r => r.id === req.params.resourceId);

    if (!resource) {
      resource = {
        id: req.params.resourceId,
        title: req.body?.title || 'Academic Resource',
        subject: req.body?.subject || 'Academic Discipline',
        description: req.body?.description || 'Educational material for student revision.'
      };
    }

    const response = await answerQuestionAboutDocument(resource, question.trim());
    res.json(response);
  } catch (err) {
    console.error('AI QA error:', err);
    res.status(500).json({ error: 'Failed to process question: ' + err.message });
  }
});

// POST /api/v1/ai/suggest-tags
router.post('/suggest-tags', async (req, res) => {
  try {
    const { title, description } = req.body;
    const suggestions = await suggestTagsForUpload(title, description);
    res.json(suggestions);
  } catch (err) {
    console.error('AI tag suggestion error:', err);
    res.status(500).json({ error: 'Failed to generate tag suggestions.' });
  }
});

module.exports = router;
