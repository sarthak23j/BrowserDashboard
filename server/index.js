require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 1337;
// Ensure MASTER_KEY is exactly 32 bytes for AES-256
const MASTER_KEY = crypto.scryptSync(process.env.MASTER_KEY || 'default_secret', 'salt', 32); 

app.use(cors());
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

// Encryption Helper
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', MASTER_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return {
    iv: iv.toString('hex'),
    content: encrypted,
    authTag: authTag
  };
}

// Decryption Helper
function decrypt(hash) {
  const decipher = crypto.createDecipheriv('aes-256-gcm', MASTER_KEY, Buffer.from(hash.iv, 'hex'));
  decipher.setAuthTag(Buffer.from(hash.authTag, 'hex'));
  let decrypted = decipher.update(hash.content, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// --- API Routes ---

// GET /api/creds/get - Fetch all credentials
app.get('/api/creds/get', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM credentials ORDER BY created_at DESC');
    const rows = stmt.all();
    
    const decryptedRows = rows.map(row => {
      try {
        const data = JSON.parse(row.data); // data stored as JSON string { content, authTag }
        return {
          id: row.id,
          service: row.service,
          tags: JSON.parse(row.tags || '[]'),
          data: JSON.parse(decrypt({ iv: row.iv, content: data.content, authTag: data.authTag })),
          created_at: row.created_at
        };
      } catch (err) {
        console.error(`Failed to decrypt cred ID ${row.id}:`, err);
        return { ...row, data: { error: 'Decryption failed' } };
      }
    });

    res.json(decryptedRows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/creds/add - Add new credential
app.post('/api/creds/add', (req, res) => {
  const { service, tags, data } = req.body;
  
  if (!service || !data) {
    return res.status(400).json({ error: 'Service name and data are required' });
  }

  try {
    const encrypted = encrypt(JSON.stringify(data));
    // Store encrypted content and authTag together in the data column as JSON
    const storedData = JSON.stringify({ content: encrypted.content, authTag: encrypted.authTag });

    const stmt = db.prepare('INSERT INTO credentials (service, tags, data, iv) VALUES (?, ?, ?, ?)');
    const info = stmt.run(service, JSON.stringify(tags || []), storedData, encrypted.iv);
    
    res.json({ id: info.lastInsertRowid, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/creds/update/:id - Update existing credential
app.put('/api/creds/update/:id', (req, res) => {
  const { service, tags, data } = req.body;
  const id = req.params.id;

  if (!service || !data) {
    return res.status(400).json({ error: 'Service name and data are required' });
  }

  try {
    // Re-encrypt the data with a new IV
    const encrypted = encrypt(JSON.stringify(data));
    const storedData = JSON.stringify({ content: encrypted.content, authTag: encrypted.authTag });

    const stmt = db.prepare('UPDATE credentials SET service = ?, tags = ?, data = ?, iv = ? WHERE id = ?');
    const info = stmt.run(service, JSON.stringify(tags || []), storedData, encrypted.iv, id);

    if (info.changes === 0) return res.status(404).json({ error: 'Credential not found' });
    
    res.json({ success: true, id: id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/creds/delete/:id
app.delete('/api/creds/delete/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM credentials WHERE id = ?');
    const info = stmt.run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Credential not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------- SEARCH API (BANGS) -----------------

const bangsPath = path.join(__dirname, 'bangs.json');

const readBangs = () => {
  if (!fs.existsSync(bangsPath)) return [];
  try {
    const data = fs.readFileSync(bangsPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading bangs.json:', err);
    return [];
  }
};

const writeBangs = (bangs) => {
  try {
    fs.writeFileSync(bangsPath, JSON.stringify(bangs, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing bangs.json:', err);
    return false;
  }
};

// GET /api/search/bangs - Fetch search shortcuts
app.get('/api/search/bangs', (req, res) => {
  res.json(readBangs());
});

// POST /api/search/bangs - Add a new bang
app.post('/api/search/bangs', (req, res) => {
  const { c, n, u, s } = req.body;
  if (!c || !n || !u || !s) return res.status(400).json({ error: 'All fields (c, n, u, s) are required' });

  const bangs = readBangs();
  bangs.push({ c, n, u, s });
  
  if (writeBangs(bangs)) {
    res.json({ success: true, bangs });
  } else {
    res.status(500).json({ error: 'Failed to save bangs' });
  }
});

// PUT /api/search/bangs/:index - Update a bang at index
app.put('/api/search/bangs/:index', (req, res) => {
  const index = parseInt(req.params.index);
  const { c, n, u, s } = req.body;
  
  const bangs = readBangs();
  if (isNaN(index) || index < 0 || index >= bangs.length) {
    return res.status(404).json({ error: 'Bang not found at this index' });
  }

  if (!c || !n || !u || !s) return res.status(400).json({ error: 'All fields (c, n, u, s) are required' });

  bangs[index] = { c, n, u, s };
  
  if (writeBangs(bangs)) {
    res.json({ success: true, bangs });
  } else {
    res.status(500).json({ error: 'Failed to save bangs' });
  }
});

// DELETE /api/search/bangs/:index - Delete a bang at index
app.delete('/api/search/bangs/:index', (req, res) => {
  const index = parseInt(req.params.index);
  const bangs = readBangs();

  if (isNaN(index) || index < 0 || index >= bangs.length) {
    return res.status(404).json({ error: 'Bang not found at this index' });
  }

  bangs.splice(index, 1);
  
  if (writeBangs(bangs)) {
    res.json({ success: true, bangs });
  } else {
    res.status(500).json({ error: 'Failed to save bangs' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
