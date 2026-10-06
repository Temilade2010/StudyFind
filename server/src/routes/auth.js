const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getDb, saveDb } = require('../db/store');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config');
const { authenticateUser } = require('../middleware/auth');

// POST /api/v1/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, full_name, role, institution, academic_level, bio, academic_title } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password, and full name are required.' });
    }

    const db = getDb();
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const userRole = role === 'instructor' ? 'instructor' : 'student';
    const password_hash = await bcrypt.hash(password, 10);

    const newUser = {
      id: 'usr_' + uuidv4().slice(0, 8),
      email: email.toLowerCase(),
      password_hash,
      full_name,
      role: userRole,
      institution: institution || (userRole === 'instructor' ? 'Academic Institution' : 'University'),
      academic_level: academic_level || 'undergraduate',
      academic_title: userRole === 'instructor' ? (academic_title || 'Instructor / Researcher') : undefined,
      bio: bio || '',
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(full_name)}&backgroundColor=4f46e5,0ea5e9,10b981`,
      verification_status: userRole === 'instructor' ? 'pending' : 'verified',
      is_verified: userRole === 'student',
      followers_count: 0,
      interests: [],
      created_at: new Date().toISOString()
    };

    db.users.push(newUser);
    saveDb();

    const token = jwt.sign({ id: newUser.id, role: newUser.role, email: newUser.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    const { password_hash: _, ...safeUser } = newUser;
    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// POST /api/v1/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const db = getDb();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    const { password_hash: _, ...safeUser } = user;
    res.json({
      message: 'Login successful.',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// GET /api/v1/auth/me
router.get('/me', authenticateUser, (req, res) => {
  const db = getDb();
  const { password_hash: _, ...safeUser } = req.user;

  // Add user library bookmark count, follows, uploads count
  const bookmarksCount = (db.bookmarks || []).filter(b => b.user_id === req.user.id).length;
  const uploadsCount = (db.resources || []).filter(r => r.uploader_id === req.user.id).length;
  const followedInstructorsCount = (db.follows || []).filter(f => f.follower_id === req.user.id).length;

  res.json({
    user: {
      ...safeUser,
      stats: {
        bookmarksCount,
        uploadsCount,
        followedInstructorsCount
      }
    }
  });
});

// PUT /api/v1/auth/profile
router.put('/profile', authenticateUser, (req, res) => {
  const db = getDb();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const { full_name, institution, bio, academic_title, interests } = req.body;
  if (full_name) user.full_name = full_name;
  if (institution) user.institution = institution;
  if (bio !== undefined) user.bio = bio;
  if (academic_title !== undefined) user.academic_title = academic_title;
  if (Array.isArray(interests)) user.interests = interests;

  saveDb();
  const { password_hash: _, ...safeUser } = user;
  res.json({ message: 'Profile updated.', user: safeUser });
});

// GET /api/v1/auth/instructors/:id
router.get('/instructors/:id', (req, res) => {
  const db = getDb();
  const instructor = db.users.find(u => u.id === req.params.id && u.role === 'instructor');
  if (!instructor) {
    return res.status(404).json({ error: 'Instructor profile not found.' });
  }

  const { password_hash: _, ...safeInstructor } = instructor;
  const uploads = db.resources.filter(r => r.uploader_id === instructor.id);
  const collections = db.collections.filter(c => c.creator_id === instructor.id);

  res.json({
    instructor: safeInstructor,
    uploads,
    collections,
    totalDownloads: uploads.reduce((acc, curr) => acc + (curr.download_count || 0), 0)
  });
});

module.exports = router;
