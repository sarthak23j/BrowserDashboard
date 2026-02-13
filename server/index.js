require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 1336;
// Ensure MASTER_KEY is exactly 32 bytes for AES-256
const MASTER_KEY = crypto.scryptSync(process.env.MASTER_KEY || 'default_secret', 'salt', 32); 

app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
