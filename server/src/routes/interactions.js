const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb, saveDb } = require('../db/store');
const { authenticateUser } = require('../middleware/auth');

// 1. BOOKMARKS / SAVED LIBRARY
// POST /api/v1/interactions/bookmarks/:resourceId - Toggle save
router.post('/bookmarks/:resourceId', authenticateUser, (req, res) => {
  const db = getDb();
  const resourceId = req.params.resourceId;
  const existingIdx = (db.bookmarks || []).findIndex(b => b.user_id === req.user.id && b.resource_id === resourceId);

  if (existingIdx !== -1) {
    db.bookmarks.splice(existingIdx, 1);
    saveDb();
    return res.json({ bookmarked: false, message: 'Removed from library.' });
  }

  const resourceData = req.body?.resource || null;
  db.bookmarks.push({
    user_id: req.user.id,
    resource_id: resourceId,
    resource: resourceData,
    saved_at: new Date().toISOString()
  });
  saveDb();
  res.json({ bookmarked: true, message: 'Saved to your personal library.' });
});

// GET /api/v1/interactions/library - Get user's saved resources
router.get('/library', authenticateUser, (req, res) => {
  const db = getDb();
  const userBookmarks = (db.bookmarks || []).filter(b => b.user_id === req.user.id);

  const savedResources = userBookmarks
    .map(b => b.resource || (db.resources || []).find(r => r.id === b.resource_id))
    .filter(Boolean);

  res.json({ count: savedResources.length, resources: savedResources });
});

// 2. REVIEWS & RATINGS
// POST /api/v1/interactions/reviews/:resourceId
router.post('/reviews/:resourceId', authenticateUser, (req, res) => {
  const { rating, comment } = req.body;
  const numRating = Number(rating);

  if (!numRating || numRating < 1 || numRating > 5) {
    return res.status(400).json({ error: 'Rating must be a number between 1 and 5.' });
  }

  const db = getDb();
  const resource = db.resources.find(r => r.id === req.params.resourceId);
  if (!resource) return res.status(404).json({ error: 'Resource not found in internal database.' });

  // Check if existing review
  const existingReview = (db.reviews || []).find(r => r.resource_id === resource.id && r.user_id === req.user.id);

  if (existingReview) {
    existingReview.rating = numRating;
    existingReview.comment = comment || existingReview.comment;
    existingReview.updated_at = new Date().toISOString();
  } else {
    const newReview = {
      id: 'rev_' + uuidv4().slice(0, 8),
      resource_id: resource.id,
      user_id: req.user.id,
      user_name: req.user.full_name,
      user_avatar: req.user.avatar_url,
      rating: numRating,
      comment: comment || '',
      created_at: new Date().toISOString()
    };
    db.reviews.push(newReview);
  }

  // Recalculate average rating
  const allForRes = db.reviews.filter(r => r.resource_id === resource.id);
  const avg = allForRes.reduce((acc, curr) => acc + curr.rating, 0) / allForRes.length;
  resource.rating_avg = Math.round(avg * 10) / 10;
  resource.rating_count = allForRes.length;

  saveDb();
  res.json({ message: 'Review recorded.', ratingAvg: resource.rating_avg, ratingCount: resource.rating_count });
});

// 3. COMMENTS & DISCUSSION
// POST /api/v1/interactions/comments/:resourceId - Add question or comment
router.post('/comments/:resourceId', authenticateUser, (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Comment content cannot be empty.' });
  }

  const db = getDb();
  const newComment = {
    id: 'com_' + uuidv4().slice(0, 8),
    resource_id: req.params.resourceId,
    user_id: req.user.id,
    user_name: req.user.full_name,
    user_role: req.user.role,
    user_avatar: req.user.avatar_url,
    content: content.trim(),
    created_at: new Date().toISOString(),
    replies: []
  };

  db.comments.push(newComment);
  saveDb();
  res.status(201).json({ message: 'Comment posted.', comment: newComment });
});

// POST /api/v1/interactions/comments/:commentId/reply - Reply to a comment
router.post('/comments/:commentId/reply', authenticateUser, (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Reply content cannot be empty.' });
  }

  const db = getDb();
  const parent = (db.comments || []).find(c => c.id === req.params.commentId);
  if (!parent) return res.status(404).json({ error: 'Parent comment not found.' });

  if (!parent.replies) parent.replies = [];

  const reply = {
    id: 'rep_' + uuidv4().slice(0, 8),
    user_id: req.user.id,
    user_name: req.user.full_name,
    user_role: req.user.role,
    user_avatar: req.user.avatar_url,
    content: content.trim(),
    created_at: new Date().toISOString()
  };

  parent.replies.push(reply);
  saveDb();
  res.status(201).json({ message: 'Reply posted.', reply });
});

// 4. INSTRUCTOR FOLLOWS
// POST /api/v1/interactions/instructors/:id/follow - Toggle follow
router.post('/instructors/:id/follow', authenticateUser, (req, res) => {
  const db = getDb();
  const targetInstructor = db.users.find(u => u.id === req.params.id && u.role === 'instructor');
  if (!targetInstructor) return res.status(404).json({ error: 'Instructor not found.' });

  if (targetInstructor.id === req.user.id) {
    return res.status(400).json({ error: 'You cannot follow yourself.' });
  }

  const existingIdx = (db.follows || []).findIndex(f => f.follower_id === req.user.id && f.instructor_id === targetInstructor.id);

  if (existingIdx !== -1) {
    db.follows.splice(existingIdx, 1);
    targetInstructor.followers_count = Math.max(0, (targetInstructor.followers_count || 1) - 1);
    saveDb();
    return res.json({ following: false, followersCount: targetInstructor.followers_count });
  }

  db.follows.push({
    follower_id: req.user.id,
    instructor_id: targetInstructor.id,
    followed_at: new Date().toISOString()
  });
  targetInstructor.followers_count = (targetInstructor.followers_count || 0) + 1;
  saveDb();
  res.json({ following: true, followersCount: targetInstructor.followers_count });
});

// 5. REPORTS / FLAG CONTENT
// POST /api/v1/interactions/reports/:resourceId
router.post('/reports/:resourceId', authenticateUser, (req, res) => {
  const { reason, details } = req.body;
  if (!reason) return res.status(400).json({ error: 'Reason for report is required.' });

  const db = getDb();
  const report = {
    id: 'rep_' + uuidv4().slice(0, 8),
    resource_id: req.params.resourceId,
    reporter_id: req.user.id,
    reporter_email: req.user.email,
    reason, // 'copyright_infringement', 'inappropriate_content', 'wrong_subject', 'broken_file'
    details: details || '',
    status: 'pending',
    created_at: new Date().toISOString()
  };

  db.reports.push(report);
  saveDb();

  res.status(201).json({ message: 'Thank you. The resource has been reported and queued for academic moderation.', report });
});

module.exports = router;
