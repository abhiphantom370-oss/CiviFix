import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { nanoid } from 'nanoid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// LowDB setup
const dbFile = join(__dirname, '../data/db.json');
const adapter = new JSONFile(dbFile);
const db = new Low(adapter, { issues: [], comments: [], users: [] });
await db.read();
db.data ||= { issues: [], comments: [], users: [] };

// Static uploads
const uploadsDir = join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const id = nanoid(10);
    const ext = file.originalname.split('.').pop();
    cb(null, `${id}.${ext}`);
  }
});
const upload = multer({ storage });

// Helpers
const formatNow = () => new Date().toISOString();

// Seed demo data if empty
if (db.data.issues.length === 0) {
  db.data.issues.push(
    {
      id: nanoid(),
      title: 'Large pothole causing traffic issues',
      category: 'roads',
      description: 'Deep pothole on Main Street junction causing vehicles to swerve dangerously',
      location: { lat: 19.1176, lng: 72.9060, address: 'Main Street, Airoli' },
      photos: [],
      status: 'in-progress',
      priority: 'high',
      upvotes: 23,
      comments: 5,
      reporter: 'Anonymous',
      createdAt: formatNow(),
      updatedAt: formatNow(),
      assignedTo: 'PWD Mumbai',
      estimatedResolution: '2025-10-01'
    },
    {
      id: nanoid(),
      title: 'Street light not working',
      category: 'electricity',
      description: 'Street light near bus stop has been out for 3 days, safety concern',
      location: { lat: 19.1180, lng: 72.9065, address: 'Bus Stop Road, Airoli' },
      photos: [],
      status: 'reported',
      priority: 'medium',
      upvotes: 8,
      comments: 2,
      reporter: 'Rahul S.',
      createdAt: formatNow(),
      updatedAt: formatNow(),
      assignedTo: null,
      estimatedResolution: null
    },
    {
      id: nanoid(),
      title: 'Garbage bin overflowing',
      category: 'waste',
      description: 'Community bin near park overflowing, attracting stray animals',
      location: { lat: 19.1165, lng: 72.9055, address: 'Park Avenue, Airoli' },
      photos: [],
      status: 'resolved',
      priority: 'medium',
      upvotes: 15,
      comments: 8,
      reporter: 'Priya M.',
      createdAt: formatNow(),
      updatedAt: formatNow(),
      assignedTo: 'NMMC Waste Management',
      resolvedAt: formatNow()
    }
  );
  await db.write();
}

// Routes
app.get('/health', (req, res) => res.json({ ok: true }));

// Issues CRUD
app.get('/issues', async (req, res) => {
  await db.read();
  res.json(db.data.issues);
});

app.post('/issues', async (req, res) => {
  const { title, description, category, priority = 'medium', location, photos = [], anonymous = false } = req.body;
  if (!title || !description || !category || !location) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const issue = {
    id: nanoid(),
    title,
    description,
    category,
    priority,
    location,
    photos,
    status: 'reported',
    upvotes: 1,
    comments: 0,
    reporter: anonymous ? 'Anonymous' : 'You',
    createdAt: formatNow(),
    updatedAt: formatNow(),
    assignedTo: null,
    estimatedResolution: null
  };
  db.data.issues.unshift(issue);
  await db.write();
  res.status(201).json(issue);
});

app.post('/issues/:id/upvote', async (req, res) => {
  const { id } = req.params;
  await db.read();
  const issue = db.data.issues.find(i => i.id === id);
  if (!issue) return res.status(404).json({ error: 'Not found' });
  issue.upvotes += 1;
  issue.updatedAt = formatNow();
  await db.write();
  res.json(issue);
});

app.post('/issues/:id/comment', async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Comment text required' });
  await db.read();
  const issue = db.data.issues.find(i => i.id === id);
  if (!issue) return res.status(404).json({ error: 'Not found' });
  issue.comments += 1;
  issue.updatedAt = formatNow();
  db.data.comments.push({ id: nanoid(), issueId: id, text, createdAt: formatNow() });
  await db.write();
  res.json({ ok: true });
});

// Upload endpoint
app.post('/upload', upload.array('files', 6), (req, res) => {
  const files = (req.files || []).map(f => `/uploads/${f.filename}`);
  res.status(201).json({ files });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`CivicFix server running on http://localhost:${port}`);
});

