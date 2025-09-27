const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

// Ensure folders exist
const PUBLIC_DIR = path.join(__dirname, 'public');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Middlewares
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));
app.use(express.static(PUBLIC_DIR));
app.use('/vendor', express.static(path.join(__dirname, 'node_modules')));

// Explicit root routes
app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Multer storage for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || '') || '.jpg';
    cb(null, `photo-${unique}${ext}`);
  }
});
const upload = multer({ storage });

// In-memory data store
let nextId = 1;
/** @type {Array<any>} */
let issues = [];

// Health
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Upload photos
app.post('/api/uploads', upload.array('photos', 10), (req, res) => {
  const files = (req.files || []).map((f) => `/uploads/${path.basename(f.path)}`);
  res.json({ urls: files });
});

// List issues
app.get('/api/issues', (req, res) => {
  res.json({ issues });
});

// Create issue
app.post('/api/issues', (req, res) => {
  const body = req.body || {};
  const now = new Date().toISOString();
  const created = {
    id: nextId++,
    title: String(body.title || 'Untitled'),
    description: String(body.description || ''),
    category: String(body.category || 'other'),
    location: body.location || null,
    photos: Array.isArray(body.photos) ? body.photos : [],
    status: body.status || 'reported',
    priority: body.priority || 'medium',
    upvotes: Number(body.upvotes || 0),
    comments: Number(body.comments || 0),
    reporter: body.anonymous ? 'Anonymous' : (body.reporter || 'You'),
    createdAt: now,
    updatedAt: now
  };
  issues.unshift(created);
  res.status(201).json({ issue: created });
});

// Upvote
app.post('/api/issues/:id/upvote', (req, res) => {
  const id = Number(req.params.id);
  const issue = issues.find((i) => i.id === id);
  if (!issue) return res.status(404).json({ error: 'Not found' });
  issue.upvotes = (issue.upvotes || 0) + 1;
  issue.updatedAt = new Date().toISOString();
  res.json({ issue });
});

// Comment (simple counter or store comments array)
app.post('/api/issues/:id/comments', (req, res) => {
  const id = Number(req.params.id);
  const issue = issues.find((i) => i.id === id);
  if (!issue) return res.status(404).json({ error: 'Not found' });
  const comment = (req.body && req.body.comment) || '';
  if (!issue.commentsList) issue.commentsList = [];
  if (comment && String(comment).trim()) {
    issue.commentsList.push({ text: String(comment), at: new Date().toISOString() });
    issue.comments = (issue.comments || 0) + 1;
  }
  issue.updatedAt = new Date().toISOString();
  res.json({ issue });
});

// Fallback to index.html for SPA routes (Express 5 compatible)
app.get(/^(?!\/(api|uploads)(\/|$)).*/, (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`CivicFix server running on http://localhost:${PORT}`);
});

