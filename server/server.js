import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db, { initDatabase } from './db.js';
import { generateBusinessAdvisory } from './aiEngine.js';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'antigravity_secret_key_2026_super_secure';

app.use(cors());
app.use(express.json());

// Initialize DB schema & seed
initDatabase().then(() => {
  console.log("Database schema initialized and ready.");
}).catch(err => console.error("Database initialization error:", err));

// Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// Admin Middleware
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access privileges required' });
  }
}

// ----------------------------------------------------
// AUTH ENDPOINTS
// ----------------------------------------------------

// Register
app.post('/api/auth/register', (req, res) => {
  const { name, mobile, email, password } = req.body;
  if (!name || !mobile || !email || !password) {
    return res.status(400).json({ message: 'Please fill in all required fields.' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  db.run(
    `INSERT INTO users (name, email, mobile, password_hash, role) VALUES (?, ?, ?, ?, 'user')`,
    [name, email, mobile, passwordHash],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ message: 'An account with this email already exists.' });
        }
        return res.status(500).json({ message: 'Error registering user', error: err.message });
      }

      const user = { id: this.lastID, name, email, mobile, role: 'user' };
      const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
      res.status(201).json({ message: 'Registration successful', token, user });
    }
  );
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  db.get(`SELECT * FROM users WHERE email = ? OR mobile = ?`, [email, email], (err, user) => {
    if (err || !user) {
      return res.status(401).json({ message: 'Invalid email/mobile or password.' });
    }

    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email/mobile or password.' });
    }

    const userData = { id: user.id, name: user.name, email: user.email, mobile: user.mobile, role: user.role };
    const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Login successful', token, user: userData });
  });
});

// Profile
app.get('/api/auth/profile', authenticateToken, (req, res) => {
  db.get(`SELECT id, name, email, mobile, role, created_at FROM users WHERE id = ?`, [req.user.id], (err, user) => {
    if (err || !user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  });
});

// ----------------------------------------------------
// CATEGORIES ENDPOINTS
// ----------------------------------------------------

app.get('/api/categories', (req, res) => {
  db.all(`SELECT * FROM business_categories ORDER BY name_en ASC`, [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    res.json({ categories: rows });
  });
});

// ----------------------------------------------------
// 15 KM COMPETITOR SPATIAL SEARCH
// ----------------------------------------------------

app.post('/api/competitors/search', (req, res) => {
  const { category_code, state, district, mandal, lat, lng } = req.body;
  
  // Default coordinates centered on Andhra Pradesh / Telangana if missing
  const userLat = lat || 16.483;
  const userLng = lng || 80.601;

  db.all(
    `SELECT * FROM competitors WHERE category_code = ? OR category_code IS NULL`,
    [category_code || 'dairy'],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Error searching competitors', error: err.message });

      // Calculate approximate Haversine 15km distance for each competitor pin
      const competitorsWithDist = rows.map(comp => {
        const dLat = (comp.lat - userLat) * Math.PI / 180;
        const dLng = (comp.lng - userLng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(userLat * Math.PI / 180) * Math.cos(comp.lat * Math.PI / 180) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceKm = Math.round((6371 * c) * 10) / 10;

        return { ...comp, distanceKm };
      });

      // Filter competitors within 15 km or return top regional results
      const within15km = competitorsWithDist.filter(c => c.distanceKm <= 15.0);
      const results = within15km.length > 0 ? within15km : competitorsWithDist.slice(0, 4);

      res.json({
        userLocation: { lat: userLat, lng: userLng, state, district, mandal },
        radiusKm: 15,
        totalFound: results.length,
        competitors: results,
        disclaimer: 'Note: Results are derived from verified business records & public mapping APIs. Informal or unregistered vendors may not all be reflected.'
      });
    }
  );
});

// ----------------------------------------------------
// AI ADVISORY GENERATOR
// ----------------------------------------------------

app.post('/api/advisory/generate', (req, res) => {
  const { category, location, capital, skills, competitorsCount, language } = req.body;

  try {
    const report = generateBusinessAdvisory({
      category,
      location,
      capital,
      skills,
      competitorsCount,
      language
    });
    res.json({ report });
  } catch (error) {
    res.status(500).json({ message: 'Error generating AI business advisory', error: error.message });
  }
});

// ----------------------------------------------------
// GOVERNMENT SCHEMES & AUTOMATIC SELECTION
// ----------------------------------------------------

app.get('/api/schemes', (req, res) => {
  const { capital, category } = req.query;

  db.all(`SELECT * FROM schemes ORDER BY min_cost ASC`, [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error fetching schemes', error: err.message });

    const processed = rows.map(s => ({
      ...s,
      documents: JSON.parse(s.documents_json || '[]')
    }));

    let autoSelectedCode = null;

    if (capital) {
      const userCapital = Number(capital);
      // Project Cost = Capital / 0.10 (Formula requirement: Beneficiary capital = 10%)
      const estimatedProjectCost = userCapital / 0.10;

      if (estimatedProjectCost <= 140000) {
        autoSelectedCode = 'MICRO_FINANCE';
      } else if (estimatedProjectCost <= 5000000) {
        autoSelectedCode = 'TERM_LOAN';
      } else {
        autoSelectedCode = 'PMEGP';
      }
    }

    res.json({ schemes: processed, autoSelectedCode });
  });
});

// ----------------------------------------------------
// PRODUCTS & MACHINERY
// ----------------------------------------------------

app.get('/api/products', (req, res) => {
  const { category_code, search, max_price } = req.query;

  let query = `SELECT * FROM products WHERE 1=1`;
  const params = [];

  if (category_code) {
    query += ` AND category_code = ?`;
    params.push(category_code);
  }

  if (search) {
    query += ` AND (name LIKE ? OR brand LIKE ? OR supplier_name LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (max_price) {
    query += ` AND price <= ?`;
    params.push(Number(max_price));
  }

  query += ` ORDER BY price ASC`;

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error fetching products', error: err.message });
    res.json({ products: rows });
  });
});

// ----------------------------------------------------
// AI ASSISTANT CHAT API
// ----------------------------------------------------

app.post('/api/ai/chat', (req, res) => {
  const { question, context } = req.body;
  const q = (question || '').toLowerCase();
  const categoryName = context?.category?.name_en || 'your business';
  const villageName = context?.location?.village || 'your location';
  const capital = context?.capital || 100000;

  let answer = '';

  if (q.includes('competitor') || q.includes('competition') || q.includes('పోటీ') || q.includes('प्रतिस्पर्धा')) {
    answer = `Based on your selected location in ${villageName}, our 15 KM radius analysis identifies nearby vendors. To stand out, offer superior product fresh quality, competitive transparent pricing, and digital payment convenience.`;
  } else if (q.includes('scheme') || q.includes('loan') || q.includes('funding') || q.includes('పథకం') || q.includes('ऋण')) {
    const estimatedCost = capital / 0.10;
    const schemeName = estimatedCost <= 140000 ? 'Micro Finance Scheme (up to ₹1.25L loan at 6.5% interest)' : 'Term Loan Scheme (up to ₹45L loan at 8.0% interest)';
    answer = `For your capital of ₹${Number(capital).toLocaleString('en-IN')}, the recommended government funding is the ${schemeName}. You provide 10% margin capital and the agency funds 90%.`;
  } else if (q.includes('machine') || q.includes('product') || q.includes('equipment') || q.includes('యంత్రాలు') || q.includes('मशीन')) {
    answer = `For starting ${categoryName}, essential machinery can be procured from our verified suppliers catalog (like DeLaval, Juki, or CSK). Ensure you look for '[✔ Verified Company]' status for genuine warranty and service guarantees.`;
  } else if (q.includes('profit') || q.includes('margin') || q.includes('revenue') || q.includes('లాభం') || q.includes('लाभ')) {
    answer = `With your capital of ₹${Number(capital).toLocaleString('en-IN')}, typical gross profit margins in ${categoryName} range from 20% to 35% after accounting for monthly operating expenses.`;
  } else {
    answer = `Regarding your query on starting ${categoryName} in ${villageName}: Make sure to balance initial equipment investment with a 2-month cash buffer, register for appropriate government scheme subsidies, and source equipment from verified suppliers.`;
  }

  res.json({ answer });
});

// ----------------------------------------------------
// ADMIN API ENDPOINTS (Protected)
// ----------------------------------------------------

app.post('/api/admin/schemes', authenticateToken, requireAdmin, (req, res) => {
  const { code, name_en, name_te, name_hi, department, min_cost, max_cost, max_loan_pct, max_loan_amount, interest_rate, tenure_years, moratorium_months, margin_pct, eligibility, benefits, documents, official_link, rules } = req.body;
  
  const docJson = JSON.stringify(documents || []);
  const stmt = db.prepare(`INSERT INTO schemes (code, name_en, name_te, name_hi, department, min_cost, max_cost, max_loan_pct, max_loan_amount, interest_rate, tenure_years, moratorium_months, margin_pct, eligibility, benefits, documents_json, official_link, rules, last_updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  
  const today = new Date().toISOString().split('T')[0];
  stmt.run(code, name_en, name_te, name_hi, department, min_cost, max_cost, max_loan_pct, max_loan_amount, interest_rate, tenure_years, moratorium_months, margin_pct, eligibility, benefits, docJson, official_link, rules, today, function(err) {
    if (err) return res.status(500).json({ message: 'Error adding scheme', error: err.message });
    res.status(201).json({ message: 'Scheme added successfully', id: this.lastID });
  });
});

app.post('/api/admin/products', authenticateToken, requireAdmin, (req, res) => {
  const { category_code, name, brand, model, price, specs, capacity, warranty, supplier_name, supplier_status, official_link } = req.body;
  
  const stmt = db.prepare(`INSERT INTO products (category_code, name, brand, model, price, specs, capacity, warranty, supplier_name, supplier_status, official_link) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  stmt.run(category_code, name, brand, model, price, specs, capacity, warranty, supplier_name, supplier_status, official_link, function(err) {
    if (err) return res.status(500).json({ message: 'Error adding product', error: err.message });
    res.status(201).json({ message: 'Product added successfully', id: this.lastID });
  });
});

app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  db.all(`SELECT id, name, email, mobile, role, created_at FROM users ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error fetching users', error: err.message });
    res.json({ users: rows });
  });
});

app.listen(PORT, () => {
  console.log(`Express API Server running on http://localhost:${PORT}`);
});
