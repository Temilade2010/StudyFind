const express = require('express');
const router = express.Router();
const { getDb, saveDb } = require('../db/store');
const { authenticateUser, requireRole } = require('../middleware/auth');

// All admin routes require admin role
router.use(authenticateUser, requireRole('admin'));

// GET /api/v1/admin/pending-instructors
router.get('/pending-instructors', (req, res) => {
  const db = getDb();
  const pending = db.users
    .filter(u => u.role === 'instructor' && u.verification_status === 'pending')
    .map(({ password_hash, ...u }) => u);

  res.json({ pending });
});

// PUT /api/v1/admin/verify-instructor/:id
router.put('/verify-instructor/:id', (req, res) => {
  const { status } = req.body; // 'verified' | 'rejected'
  if (!['verified', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status must be verified or rejected.' });
  }

  const db = getDb();
  const instructor = db.users.find(u => u.id === req.params.id && u.role === 'instructor');
  if (!instructor) return res.status(404).json({ error: 'Instructor not found.' });

  instructor.verification_status = status;
  instructor.is_verified = status === 'verified';
  saveDb();

  res.json({ message: `Instructor status updated to ${status}.`, instructor });
});

// GET /api/v1/admin/reports
router.get('/reports', (req, res) => {
  const db = getDb();
  const reportsWithDetails = (db.reports || []).map(rep => {
    const resource = db.resources.find(r => r.id === rep.resource_id);
    return {
      ...rep,
      resourceTitle: resource ? resource.title : 'Deleted Resource',
      resourceUploader: resource ? resource.uploader_name : 'Unknown'
    };
  });

  res.json({ reports: reportsWithDetails });
});

// PUT /api/v1/admin/resolve-report/:id
router.put('/resolve-report/:id', (req, res) => {
  const { action } = req.body; // 'take_down' | 'dismiss'
  const db = getDb();
  const report = (db.reports || []).find(r => r.id === req.params.id);

  if (!report) return res.status(404).json({ error: 'Report not found.' });

  report.status = action === 'take_down' ? 'resolved' : 'dismissed';
  report.resolved_at = new Date().toISOString();

  if (action === 'take_down') {
    const resource = db.resources.find(r => r.id === report.resource_id);
    if (resource) {
      resource.is_flagged = true; // Quarantine resource from public search
    }
  }

  saveDb();
  res.json({ message: `Report marked as ${report.status}. Action: ${action}` });
});

// GET /api/v1/admin/analytics
router.get('/analytics', (req, res) => {
  const db = getDb();
  const totalUsers = db.users.length;
  const studentCount = db.users.filter(u => u.role === 'student').length;
  const instructorCount = db.users.filter(u => u.role === 'instructor').length;
  const totalResources = db.resources.length;
  const totalDownloads = db.resources.reduce((acc, r) => acc + (r.download_count || 0), 0);
  const totalViews = db.resources.reduce((acc, r) => acc + (r.view_count || 0), 0);

  const subjectCounts = {};
  db.resources.forEach(r => {
    subjectCounts[r.subject] = (subjectCounts[r.subject] || 0) + 1;
  });

  res.json({
    metrics: {
      totalUsers,
      studentCount,
      instructorCount,
      totalResources,
      totalDownloads,
      totalViews,
      pendingVerifications: db.users.filter(u => u.role === 'instructor' && u.verification_status === 'pending').length,
      pendingReports: (db.reports || []).filter(r => r.status === 'pending').length
    },
    subjectBreakdown: subjectCounts
  });
});

module.exports = router;
