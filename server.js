const express = require('express');
const { Pool } = require('pg'); 
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();
const app = express();

// 1. CORS FIX (Production Ready)
// Yahan tumhari Vercel site aur localhost dono allow hain
const allowedOrigins = [
  'https://x-one-boutique-1.vercel.app', // Tumhari asli site
  'http://localhost:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS Policy: Bhai ye origin allowed nahi hai!'));
    }
  },
  credentials: true
}));

app.use(express.json()); 

// 2. DATABASE CONNECTION
// process.env.MONGO_URI ko hum Postgres connection string ke liye use kar rahe hain
const pool = new Pool({
  connectionString: process.env.MONGO_URI,
  ssl: { rejectUnauthorized: false }
});

pool.connect((err) => {
  if (err) console.error('Supabase Connection Error ❌:', err.message);
  else console.log('Supabase Connected! ✅');
});

// --- SIGNUP ROUTE ---
app.post('/api/signup', async (req, res) => {
    const { username, fullName, email, password } = req.body;
    const finalName = username || fullName || "User";

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Email and Password are required!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const query = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id';
        const values = [finalName, email, hashedPassword];

        const result = await pool.query(query, values);

        return res.status(201).json({ 
            message: "User Registered! ✅", 
            id: result.rows[0].id 
        });

    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ message: "Email already exists!" });
        }
        return res.status(500).json({ error: err.message });
    }
});

// --- LOGIN ROUTE ---
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const token = jwt.sign(
            { id: user.id }, 
            process.env.JWT_SECRET || 'fallback_secret', 
            { expiresIn: '1h' }
        );

        res.json({ 
            token, 
            user: { id: user.id, username: user.username, email: user.email },
            message: "Login Successful! 🚀" 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. DYNAMIC PORT (Render/Railway ke liye zaroori)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Engine Start! Server running on port ${PORT}`);
});