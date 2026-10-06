const express = require('express');
const cors = require('cors');
const path = require('path');
const { PORT, UPLOADS_DIR } = require('./config');

const authRoutes = require('./routes/auth');
const searchRoutes = require('./routes/search');
const resourceRoutes = require('./routes/resources');
const collectionRoutes = require('./routes/collections');
const interactionRoutes = require('./routes/interactions');
const aiRoutes = require('./routes/ai');
const adminRoutes = require('./routes/admin');
const { getDb } = require('./db/store');

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads serving
app.use('/uploads', express.static(UPLOADS_DIR));

// In-browser Document / PDF Simulation stream for sample resources
app.get('/api/v1/resources/preview-sample/:file', (req, res) => {
  const fileName = req.params.file;
  const db = getDb();
  const matched = db.resources.find(r => r.file_url.includes(fileName)) || db.resources[0];

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${matched ? matched.title : 'StudyFind Academic Document Viewer'}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      margin: 0;
      padding: 30px 16px;
      background: #f1f5f9;
      color: #1e293b;
      line-height: 1.6;
    }
    .paper-container {
      max-width: 760px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      border-radius: 8px;
      padding: 40px 48px;
    }
    .header-badge {
      display: inline-block;
      padding: 3px 10px;
      background: #f1f5f9;
      color: #475569;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 14px;
      border: 1px solid #e2e8f0;
    }
    h1 {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 0;
      margin-bottom: 8px;
      line-height: 1.3;
    }
    .meta-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      color: #64748b;
      font-size: 13.5px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .meta-bar span strong {
      color: #0f172a;
    }
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #0f172a;
      margin-top: 24px;
      margin-bottom: 10px;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 4px;
    }
    p {
      color: #334155;
      font-size: 14.5px;
      line-height: 1.65;
      margin-bottom: 14px;
    }
    .takeaways-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 16px 20px;
      margin: 16px 0;
    }
    .takeaways-box ul {
      margin: 0;
      padding-left: 20px;
    }
    .takeaways-box li {
      margin-bottom: 6px;
      color: #334155;
      font-size: 14px;
    }
    .callout {
      background: #eff6ff;
      border-left: 3px solid #2563eb;
      padding: 14px;
      border-radius: 4px;
      margin: 20px 0;
      font-size: 14px;
      color: #1e3a8a;
    }
    .page-footer {
      margin-top: 36px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      color: #64748b;
      font-size: 12.5px;
    }
  </style>
</head>
<body>
  <div class="paper-container">
    <div class="header-badge">Academic Reading Document</div>
    <h1>${matched ? matched.title : 'Data Structures & Algorithmic Complexity'}</h1>
    <div class="meta-bar">
      <span><strong>Instructor:</strong> ${matched ? matched.uploader_name : 'Dr. Evelyn Reed'}</span>
      <span><strong>Institution:</strong> ${matched ? matched.uploader_institution : 'MIT'}</span>
      <span><strong>Course:</strong> ${matched ? (matched.course_code || matched.subject) : 'CS 106B'}</span>
      <span><strong>Pages:</strong> ${matched ? matched.page_count : 48}</span>
    </div>

    <div class="section-title">Overview & Syllabus Context</div>
    <p>${matched ? matched.description : 'Comprehensive lecture notes synthesis.'}</p>

    <div class="section-title">Key Core Points</div>
    <div class="takeaways-box">
      <ul>
        ${((matched && matched.key_takeaways) || [
          'Foundational algorithmic formulations and proofs',
          'Step-by-step problem sets with verified solutions',
          'Examination preparation cheat-sheet and edge case checklists'
        ]).map(t => `<li>${t}</li>`).join('')}
      </ul>
    </div>

    <div class="section-title">Section 1: Foundations & Core Principles</div>
    <p>In analyzing computational complexities, asymptotic tight bounds capture both the upper and lower limits of growth rates up to constant multipliers. When solving recurrent relationships, evaluating the critical exponent dictates whether the work done at the root or the leaf nodes dominates execution time.</p>
    
    <div class="callout">
      <strong>Study Note:</strong> Pay strict attention to base cases when unrolling recursive functions. A common exam mistake occurs when students omit verification of empty collections or single-element inputs.
    </div>

    <div class="section-title">Section 2: Practical Implementation Nuances</div>
    <p>Balanced binary search structures maintain logarithmic height invariant guarantees. During rotation operations, pointer updates must occur in strict invariant-preserving sequence to prevent memory cycles or transient dangling references.</p>

    <div class="page-footer">
      <span>StudyFind Academic Network • Page 1 of ${matched ? matched.page_count : 48}</span>
      <span>Document ID: ${matched ? matched.id : 'res_001'}</span>
    </div>
  </div>
</body>
</html>
  `);
});

// API Routes mounting
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/resources', resourceRoutes);
app.use('/api/v1/collections', collectionRoutes);
app.use('/api/v1/interactions', interactionRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'StudyFind Academic Search API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`StudyFind server running on http://localhost:${PORT}`);
});
