const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, publicUser } = require('../db');
const { authRequired } = require('../middleware/auth');
const router = express.Router();

// POST /api/auth/login  { email, password } -> { token, user }
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  const user = await db.findUserByEmail(email);
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
  const token = jwt.sign({ id: String(user._id || user.id), email: user.email, role: user.role }, process.env.JWT_SECRET || 'chatdesk-dev-secret-change-me', { expiresIn: '12h' });
  res.json({ token, user: publicUser(user) });
});

router.get('/me', authRequired, (req, res) => res.json({ user: req.user }));
module.exports = router;
