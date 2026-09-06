import express from 'express';
import db from '../database/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
router.use(authenticateToken);

router.get('/', (req: AuthRequest, res) => {
  try {
    const user: any = db.prepare("SELECT id, full_name, username, mobile_number, email, address, village, district, state, pincode, role FROM users WHERE id = ?").get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    if (user.role === 'FARMER') {
      user.farmer_profile = db.prepare("SELECT farm_name, farm_type, bank_name, account_number, ifsc_code, account_holder_name FROM farmer_profiles WHERE user_id = ?").get(user.id);
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/', (req: AuthRequest, res) => {
  const { full_name, mobile_number, email, address, village, district, state, pincode, ...profile } = req.body;
  try {
    db.transaction(() => {
      db.prepare(`
        UPDATE users SET 
          full_name = COALESCE(?, full_name), 
          mobile_number = COALESCE(?, mobile_number), 
          email = COALESCE(?, email), 
          address = COALESCE(?, address), 
          village = COALESCE(?, village), 
          district = COALESCE(?, district), 
          state = COALESCE(?, state), 
          pincode = COALESCE(?, pincode)
        WHERE id = ?
      `).run(full_name, mobile_number, email, address, village, district, state, pincode, req.user.id);
      
      if (req.user.role === 'FARMER') {
        db.prepare(`
          UPDATE farmer_profiles SET 
            farm_name = COALESCE(?, farm_name), 
            farm_type = COALESCE(?, farm_type), 
            bank_name = COALESCE(?, bank_name), 
            account_number = COALESCE(?, account_number), 
            ifsc_code = COALESCE(?, ifsc_code), 
            account_holder_name = COALESCE(?, account_holder_name)
          WHERE user_id = ?
        `).run(profile.farm_name, profile.farm_type, profile.bank_name, profile.account_number, profile.ifsc_code, profile.account_holder_name, req.user.id);
      }
    })();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
