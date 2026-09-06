import express from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';

router.post('/login', (req, res) => {
  const { username, password, role } = req.body;
  
  try {
    const user: any = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    if (user.role !== role) {
      return res.status(401).json({ error: 'Invalid role' });
    }
    
    const valid = bcryptjs.compareSync(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role, full_name: user.full_name }, JWT_SECRET, { expiresIn: '24h' });
    
    const { password_hash, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/register', (req, res) => {
  let { 
    full_name, username, mobile_number, password, role, 
    email, address, village, district, state, pincode,
    farm_name, farm_type, bank_name, account_number, ifsc_code, account_holder_name
  } = req.body;
  
  // Fallback for camelCase payload from frontend
  full_name = full_name || req.body.fullName;
  mobile_number = mobile_number || req.body.mobileNumber;
  farm_name = farm_name || req.body.farmName;
  farm_type = farm_type || req.body.farmType;
  bank_name = bank_name || req.body.bankName;
  account_number = account_number || req.body.accountNumber;
  ifsc_code = ifsc_code || req.body.ifscCode;
  account_holder_name = account_holder_name || req.body.accountHolderName;
  
  if (role === 'ADMIN') {
    return res.status(400).json({ error: 'Cannot register as ADMIN' });
  }
  
  try {
    const password_hash = bcryptjs.hashSync(password, 10);
    
    let userId;
    db.transaction(() => {
      const stmt = db.prepare(`
        INSERT INTO users (full_name, username, mobile_number, password_hash, role, email, address, village, district, state, pincode)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(
        full_name ?? null, username ?? null, mobile_number ?? null, password_hash, role ?? null, 
        email ?? null, address ?? null, village ?? null, district ?? null, state ?? null, pincode ?? null
      );
      userId = info.lastInsertRowid;
      
      if (role === 'FARMER') {
        const profileStmt = db.prepare(`
          INSERT INTO farmer_profiles (user_id, farm_name, farm_type, bank_name, account_number, ifsc_code, account_holder_name)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        profileStmt.run(
          userId, farm_name ?? null, farm_type ?? null, bank_name ?? null, 
          account_number ?? null, ifsc_code ?? null, account_holder_name ?? null
        );
      }
    })();
    
    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (err: any) {
    if (err.message && err.message.includes('UNIQUE')) {
      res.status(400).json({ error: 'Username already exists' });
    } else {
      console.error('Register error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

router.get('/me', authenticateToken, (req: AuthRequest, res) => {
  try {
    const user: any = db.prepare('SELECT id, full_name, username, mobile_number, role, email, address, village, district, state, pincode, is_verified, is_active, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
