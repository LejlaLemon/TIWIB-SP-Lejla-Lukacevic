const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

const saveDir = path.join(__dirname, 'data');
const validSlots = new Set(['1', '2', '3']);
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(cors({
  origin: allowedOrigin
}));
app.use(express.json({ limit: '128kb' }));

function isFiniteNumber(v) {
  return typeof v === 'number' && Number.isFinite(v);
}

function isValidSaveBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return false;
  if (!isFiniteNumber(body.level)) return false;

  if (body.position !== undefined) {
    if (!body.position || typeof body.position !== 'object' || Array.isArray(body.position)) return false;
    if (!isFiniteNumber(body.position.x) || !isFiniteNumber(body.position.y)) return false;
  }

  return true;
}

function getValidatedSlot(req, res) {
  const slot = String(req.params.slot || '');
  if (!validSlots.has(slot)) {
    res.status(400).json({ message: 'Invalid slot. Use 1, 2, or 3.' });
    return null;
  }
  return slot;
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'this-is-where-it-begins-api' });
});

// ======================
// SAVE SLOT (1,2,3)
// ======================
app.post('/api/save/:slot', async (req, res) => {
  const slot = getValidatedSlot(req, res);
  if (!slot) return;

  if (!isValidSaveBody(req.body)) {
    return res.status(400).json({
      message: 'Invalid save payload. Expected { level:number, position?:{ x:number, y:number } }.'
    });
  }

  try {
    await fs.mkdir(saveDir, { recursive: true });

    const file = path.join(saveDir, `saveSlot${slot}.json`);

    await fs.writeFile(file, JSON.stringify(req.body, null, 2), 'utf8');

    res.status(201).json({
      message: `Save slot ${slot} stored successfully.`
    });
  } catch (error) {
    console.error('POST /api/save failed', { slot, error: error?.message });
    res.status(500).json({ message: 'Failed to write save.' });
  }
});

// ======================
// LOAD SLOT (1,2,3)
// ======================
app.get('/api/save/:slot', async (req, res) => {
  const slot = getValidatedSlot(req, res);
  if (!slot) return;

  try {
    const file = path.join(saveDir, `saveSlot${slot}.json`);

    const raw = await fs.readFile(file, 'utf8');
    res.json(JSON.parse(raw));

  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json(null);
    }

    console.error('GET /api/save failed', { slot, error: error?.message });
    res.status(500).json({ message: 'Failed to read save.' });
  }
});

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});