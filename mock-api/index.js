const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

const DB = path.join(__dirname, 'mock-db', 'users.json');
const SALT_ROUNDS = 10;

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('[HEALTH] API is running');
  return res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

function readUsers() {
  try {
    const raw = fs.readFileSync(DB, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(DB, JSON.stringify(users, null, 2), 'utf8');
}

// Extract username from token
function getUserFromToken(token) {
  if (!token || !token.startsWith('mock-token:')) return null;
  return token.split(':')[1];
}

app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ message: 'Missing fields' });
    
    const users = readUsers();
    if (users.find(u => u.username === username)) {
      return res.status(409).json({ message: 'Usuário já existe' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    users.push({ username, password: hashedPassword, transactions: [] });
    writeUsers(users);
    return res.status(201).json({ message: 'Registered' });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ message: 'Missing fields' });
    
    const users = readUsers();
    const user = users.find(u => u.username === username);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    
    // Compare password with hash
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });
    
    // Generate token
    return res.json({ token: `mock-token:${username}` });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET transactions for authenticated user
app.get('/api/transactions', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const username = getUserFromToken(token);
    console.log(`[GET] Token: ${token}, Username: ${username}`);
    
    if (!username) return res.status(401).json({ message: 'Unauthorized' });
    
    const users = readUsers();
    const user = users.find(u => u.username === username);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    console.log(`[GET] Found ${(user.transactions || []).length} transactions`);
    return res.json({ transactions: user.transactions || [] });
  } catch (err) {
    console.error('Get transactions error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

  // Categories endpoints
  app.get('/api/categories', (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const username = getUserFromToken(token);
      console.log(`[GET /categories] Token: ${token}, Username: ${username}`);
      if (!username) return res.status(401).json({ message: 'Unauthorized' });

      const users = readUsers();
      const user = users.find(u => u.username === username);
      if (!user) return res.status(404).json({ message: 'User not found' });

      return res.json({ categories: user.categories || [] });
    } catch (err) {
      console.error('Get categories error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/categories', (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const username = getUserFromToken(token);
      console.log(`[POST /categories] Token: ${token}, Username: ${username}`);
      if (!username) return res.status(401).json({ message: 'Unauthorized' });

      const { name } = req.body || {};
      if (!name) return res.status(400).json({ message: 'Missing fields' });

      const users = readUsers();
      const user = users.find(u => u.username === username);
      if (!user) return res.status(404).json({ message: 'User not found' });

      const category = { id: Date.now().toString(), name };
      if (!user.categories) user.categories = [];
      user.categories.push(category);
      writeUsers(users);

      console.log(`[POST /categories] Created category ${category.id}`);
      return res.status(201).json(category);
    } catch (err) {
      console.error('Post category error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });

  app.delete('/api/categories/:id', (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const username = getUserFromToken(token);
      console.log(`[DELETE /categories] Token: ${token}, Username: ${username}`);
      if (!username) return res.status(401).json({ message: 'Unauthorized' });

      const { id } = req.params;
      const users = readUsers();
      const user = users.find(u => u.username === username);
      if (!user) return res.status(404).json({ message: 'User not found' });

      const idx = (user.categories || []).findIndex(c => c.id === id);
      if (idx === -1) return res.status(404).json({ message: 'Category not found' });

      user.categories.splice(idx, 1);
      // Remove category reference from transactions
      (user.transactions || []).forEach(t => { if (t.categoryId === id) t.categoryId = null; });
      writeUsers(users);

      console.log('[DELETE /categories] Delete successful');
      return res.json({ message: 'Deleted' });
    } catch (err) {
      console.error('Delete category error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });

// POST new transaction
app.post('/api/transactions', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const username = getUserFromToken(token);
    console.log(`[POST] Token: ${token}, Username: ${username}`);
    
    if (!username) return res.status(401).json({ message: 'Unauthorized' });
    
    const { description, amount, type, date, categoryId } = req.body || {};
    console.log(`[POST] Body: description=${description}, amount=${amount}, type=${type}, categoryId=${categoryId}`);
    
    if (!description || amount === undefined || !type) return res.status(400).json({ message: 'Missing fields' });
    
    const users = readUsers();
    const user = users.find(u => u.username === username);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const transaction = {
      id: Date.now().toString(),
      description,
      amount: parseFloat(amount),
      type,
      categoryId: categoryId || null,
      date: date || new Date().toISOString(),
    };
    
    if (!user.transactions) user.transactions = [];
    user.transactions.push(transaction);
    writeUsers(users);
    
    console.log(`[POST] Created transaction ${transaction.id}`);
    return res.status(201).json(transaction);
  } catch (err) {
    console.error('Post transaction error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// DELETE transaction
app.delete('/api/transactions/:id', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const username = getUserFromToken(token);
    console.log(`[DELETE] Transaction ${req.params.id} - Token: ${token}, Username: ${username}`);
    
    if (!username) return res.status(401).json({ message: 'Unauthorized' });
    
    const { id } = req.params;
    const users = readUsers();
    const user = users.find(u => u.username === username);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const idx = (user.transactions || []).findIndex(t => t.id === id);
    if (idx === -1) return res.status(404).json({ message: 'Transaction not found' });
    
    user.transactions.splice(idx, 1);
    writeUsers(users);
    
    console.log('[DELETE] Delete successful');
    return res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Delete transaction error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// PUT update transaction
app.put('/api/transactions/:id', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const username = getUserFromToken(token);
    console.log(`[PUT] Transaction ${req.params.id} - Token: ${token}, Username: ${username}`);
    
    if (!username) {
      console.log('[PUT] Unauthorized - No username from token');
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { id } = req.params;
    const { description, amount, type, categoryId } = req.body || {};
    console.log(`[PUT] Body: description=${description}, amount=${amount}, type=${type}, categoryId=${categoryId}`);
    
    if (!description || amount === undefined || !type) {
      console.log('[PUT] Bad request - Missing fields');
      return res.status(400).json({ message: 'Missing fields' });
    }
    
    const users = readUsers();
    const user = users.find(u => u.username === username);
    if (!user) {
      console.log('[PUT] User not found:', username);
      return res.status(404).json({ message: 'User not found' });
    }
    
    const transaction = (user.transactions || []).find(t => t.id === id);
    console.log(`[PUT] Looking for transaction ${id}, found:`, !!transaction);
    
    if (!transaction) {
      console.log('[PUT] Transaction not found');
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    transaction.description = description;
    transaction.amount = parseFloat(amount);
    transaction.type = type;
    transaction.categoryId = categoryId || null;
    writeUsers(users);
    
    console.log('[PUT] Update successful');
    return res.json(transaction);
  } catch (err) {
    console.error('Update transaction error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Mock API running on http://localhost:${port}`));
