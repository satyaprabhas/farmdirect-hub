import express from 'express';
import db from '../database/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { authorizeRoles } from '../middleware/roleGuard';

const router = express.Router();
router.use(authenticateToken);
router.use(authorizeRoles('ADMIN'));

router.get('/dashboard', (req, res) => {
  try {
    const totalFarmers = (db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'FARMER'").get() as any).count;
    const totalConsumers = (db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'CONSUMER'").get() as any).count;
    const totalBulkConsumers = (db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'LARGE_SCALE_CONSUMER'").get() as any).count;
    const totalAdvisers = (db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'ADVISER'").get() as any).count;
    const totalCoordinators = (db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'COORDINATOR'").get() as any).count;
    const pendingFarmers = (db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'FARMER' AND (is_verified = 0 OR is_verified IS NULL)").get() as any).count;
    const approvedFarmers = (db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'FARMER' AND is_verified = 1").get() as any).count;
    const pendingCoordinators = (db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'COORDINATOR' AND (is_verified = 0 OR is_verified IS NULL)").get() as any).count;
    const totalProducts = (db.prepare("SELECT COUNT(*) as count FROM farmer_produce WHERE status = 'ACTIVE'").get() as any).count;
    const totalOrders = (db.prepare("SELECT COUNT(*) as count FROM orders").get() as any).count;
    const pendingOrders = (db.prepare("SELECT COUNT(*) as count FROM orders WHERE status NOT IN ('DELIVERED', 'CANCELLED')").get() as any).count;
    const completedOrders = (db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'DELIVERED'").get() as any).count;
    const totalSales = (db.prepare("SELECT COALESCE(SUM(total_amount), 0) as sum FROM orders WHERE status = 'DELIVERED'").get() as any).sum;
    const totalConsultations = (db.prepare("SELECT COUNT(*) as count FROM crop_disease_consultations").get() as any).count;

    const recentOrders = db.prepare(`
      SELECT o.*, u.full_name as consumer_name
      FROM orders o
      JOIN users u ON o.consumer_id = u.id
      ORDER BY o.placed_at DESC LIMIT 10
    `).all().map((o: any) => {
      o.items = db.prepare(`
        SELECT oi.*, u.full_name as farmer_name, v.name as vegetable_name
        FROM order_items oi
        LEFT JOIN users u ON oi.farmer_id = u.id
        LEFT JOIN farmer_produce fp ON oi.produce_id = fp.id
        LEFT JOIN vegetables v ON fp.vegetable_id = v.id
        WHERE oi.order_id = ?
      `).all(o.id);
      return o;
    });

    const topVegetables = db.prepare(`
      SELECT vegetable_name, SUM(quantity) as total_sold
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'DELIVERED'
      GROUP BY vegetable_name
      ORDER BY total_sold DESC LIMIT 5
    `).all();

    res.json({
      totalFarmers, approvedFarmers, pendingFarmers, totalConsumers, totalBulkConsumers, totalAdvisers, 
      totalCoordinators, pendingCoordinators, totalProducts,
      totalOrders, pendingOrders, completedOrders, totalSales, totalConsultations,
      recentOrders, topVegetables
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/vegetables', (req, res) => {
  res.json(db.prepare("SELECT * FROM vegetables ORDER BY name").all());
});

router.post('/vegetables', (req, res) => {
  const { name, current_price, unit } = req.body;
  try {
    const info = db.prepare("INSERT INTO vegetables (name, current_price, unit, is_active) VALUES (?, ?, ?, 1)").run(name, current_price, unit || 'kg');
    res.json({ id: info.lastInsertRowid, name, current_price, unit: unit || 'kg' });
  } catch (err: any) {
    if (err.message && err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Vegetable exists' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/vegetables/:id', (req: AuthRequest, res) => {
  const { current_price, name, is_active } = req.body;
  const id = req.params.id;
  try {
    db.transaction(() => {
      const oldVeg: any = db.prepare("SELECT current_price FROM vegetables WHERE id = ?").get(id);
      if (oldVeg && oldVeg.current_price !== current_price && current_price !== undefined) {
        db.prepare("INSERT INTO price_history (vegetable_id, old_price, new_price, changed_by) VALUES (?, ?, ?, ?)").run(id, oldVeg.current_price, current_price, req.user.id);
      }
      db.prepare("UPDATE vegetables SET current_price = COALESCE(?, current_price), name = COALESCE(?, name), is_active = COALESCE(?, is_active), updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(current_price ?? null, name ?? null, is_active ?? null, id);
    })();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/vegetables/:id', (req, res) => {
  try {
    db.prepare("UPDATE vegetables SET is_active = 0 WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/farmers', (req, res) => {
  res.json(db.prepare(`
    SELECT u.id as id, u.full_name, u.username, u.mobile_number, u.email, u.address, u.village, u.district, u.state, u.pincode,
           u.is_verified, u.is_active, u.created_at,
           fp.id as profile_id, fp.farm_name, fp.farm_type, fp.bank_name, fp.account_number, fp.ifsc_code, fp.account_holder_name,
           (SELECT COUNT(*) FROM farmer_produce WHERE farmer_id = u.id) as produce_count
    FROM users u
    LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
    WHERE u.role = 'FARMER'
    ORDER BY u.created_at DESC
  `).all());
});

router.put('/farmers/:id/verify', (req, res) => {
  try {
    let targetUserId = req.params.id;
    const userExists = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'FARMER'").get(targetUserId);
    if (!userExists) {
      const profile = db.prepare("SELECT user_id FROM farmer_profiles WHERE id = ?").get(targetUserId);
      if (profile) {
        targetUserId = profile.user_id;
      }
    }

    const { is_verified } = req.body;
    if (is_verified !== undefined) {
      db.prepare("UPDATE users SET is_verified = ? WHERE id = ?").run(is_verified ? 1 : 0, targetUserId);
    } else {
      db.prepare("UPDATE users SET is_verified = 1 - is_verified WHERE id = ?").run(targetUserId);
    }
    const updated: any = db.prepare("SELECT is_verified FROM users WHERE id = ?").get(targetUserId);
    res.json({ success: true, is_verified: updated ? updated.is_verified : 0, user_id: targetUserId });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/farmers/:id/suspend', (req, res) => {
  try {
    let targetUserId = req.params.id;
    const userExists = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'FARMER'").get(targetUserId);
    if (!userExists) {
      const profile = db.prepare("SELECT user_id FROM farmer_profiles WHERE id = ?").get(targetUserId);
      if (profile) {
        targetUserId = profile.user_id;
      }
    }

    const { status, is_active } = req.body;
    if (status !== undefined) {
      db.prepare("UPDATE users SET is_active = ? WHERE id = ?").run(status === 'ACTIVE' ? 1 : 0, targetUserId);
    } else if (is_active !== undefined) {
      db.prepare("UPDATE users SET is_active = ? WHERE id = ?").run(is_active ? 1 : 0, targetUserId);
    } else {
      db.prepare("UPDATE users SET is_active = 1 - is_active WHERE id = ?").run(targetUserId);
    }
    const updated: any = db.prepare("SELECT is_active FROM users WHERE id = ?").get(targetUserId);
    res.json({ success: true, is_active: updated ? updated.is_active : 1, user_id: targetUserId });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/consumers', (req, res) => {
  res.json(db.prepare(`
    SELECT u.*, (SELECT COUNT(*) FROM orders WHERE consumer_id = u.id) as order_count
    FROM users u
    WHERE u.role = 'CONSUMER'
  `).all());
});

router.get('/large-scale-consumers', (req, res) => {
  res.json(db.prepare(`
    SELECT u.*, (SELECT COUNT(*) FROM orders WHERE consumer_id = u.id) as order_count,
           (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE consumer_id = u.id) as total_spent
    FROM users u
    WHERE u.role = 'LARGE_SCALE_CONSUMER'
  `).all());
});

router.get('/advisers', (req, res) => {
  res.json(db.prepare(`
    SELECT u.id, u.username, u.full_name, u.mobile_number, u.email, u.district, u.state, u.is_active, u.is_verified,
           ap.specialization, ap.qualification, ap.license_number, ap.experience_years, ap.bio,
           (SELECT COUNT(*) FROM crop_disease_consultations WHERE adviser_id = u.id) as resolved_cases,
           (SELECT COUNT(*) FROM crop_disease_consultations WHERE status = 'PENDING') as pending_cases
    FROM users u
    LEFT JOIN adviser_profiles ap ON u.id = ap.user_id
    WHERE u.role = 'ADVISER'
    ORDER BY u.created_at DESC
  `).all());
});

router.put('/advisers/:id/verify', (req, res) => {
  try {
    const { is_verified } = req.body;
    if (is_verified !== undefined) {
      db.prepare("UPDATE users SET is_verified = ? WHERE id = ?").run(is_verified ? 1 : 0, req.params.id);
    } else {
      db.prepare("UPDATE users SET is_verified = 1 - is_verified WHERE id = ?").run(req.params.id);
    }
    const updated: any = db.prepare("SELECT is_verified FROM users WHERE id = ?").get(req.params.id);
    res.json({ success: true, is_verified: updated ? updated.is_verified : 0 });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/advisers/:id/suspend', (req, res) => {
  try {
    const { status, is_active } = req.body;
    if (status !== undefined) {
      db.prepare("UPDATE users SET is_active = ? WHERE id = ?").run(status === 'ACTIVE' ? 1 : 0, req.params.id);
    } else if (is_active !== undefined) {
      db.prepare("UPDATE users SET is_active = ? WHERE id = ?").run(is_active ? 1 : 0, req.params.id);
    } else {
      db.prepare("UPDATE users SET is_active = 1 - is_active WHERE id = ?").run(req.params.id);
    }
    const updated: any = db.prepare("SELECT is_active FROM users WHERE id = ?").get(req.params.id);
    res.json({ success: true, is_active: updated ? updated.is_active : 1 });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/coordinators', (req, res) => {
  res.json(db.prepare(`
    SELECT u.*,
           (SELECT COUNT(*) FROM orders WHERE coordinator_id = u.id) as assigned_orders,
           (SELECT COUNT(*) FROM orders WHERE coordinator_id = u.id AND status = 'DELIVERED') as completed_orders
    FROM users u
    WHERE u.role = 'COORDINATOR'
    ORDER BY u.created_at DESC
  `).all());
});

router.put('/coordinators/:id/verify', (req, res) => {
  try {
    const { is_verified } = req.body;
    if (is_verified !== undefined) {
      db.prepare("UPDATE users SET is_verified = ? WHERE id = ?").run(is_verified ? 1 : 0, req.params.id);
    } else {
      db.prepare("UPDATE users SET is_verified = 1 - is_verified WHERE id = ?").run(req.params.id);
    }
    const updated: any = db.prepare("SELECT is_verified FROM users WHERE id = ?").get(req.params.id);
    res.json({ success: true, is_verified: updated ? updated.is_verified : 0 });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/coordinators/:id/suspend', (req, res) => {
  try {
    const { status, is_active } = req.body;
    if (status !== undefined) {
      db.prepare("UPDATE users SET is_active = ? WHERE id = ?").run(status === 'ACTIVE' ? 1 : 0, req.params.id);
    } else if (is_active !== undefined) {
      db.prepare("UPDATE users SET is_active = ? WHERE id = ?").run(is_active ? 1 : 0, req.params.id);
    } else {
      db.prepare("UPDATE users SET is_active = 1 - is_active WHERE id = ?").run(req.params.id);
    }
    const updated: any = db.prepare("SELECT is_active FROM users WHERE id = ?").get(req.params.id);
    res.json({ success: true, is_active: updated ? updated.is_active : 1 });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/orders', (req, res) => {
  try {
    const status = req.query.status as string;
    let query = `
      SELECT o.*, u.full_name as consumer_name 
      FROM orders o 
      JOIN users u ON o.consumer_id = u.id
    `;
    const params = [];
    if (status) {
      query += ` WHERE o.status = ?`;
      params.push(status);
    }
    query += ` ORDER BY o.placed_at DESC`;
    
    const orders = db.prepare(query).all(...params);
    const result = orders.map((o: any) => {
      o.items = db.prepare(`
        SELECT oi.*, u.full_name as farmer_name
        FROM order_items oi
        LEFT JOIN users u ON oi.farmer_id = u.id
        WHERE oi.order_id = ?
      `).all(o.id);
      return o;
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/reports', (req, res) => {
  try {
    const ordersByDay = db.prepare(`
      SELECT date(placed_at) as date, COUNT(*) as count, SUM(total_amount) as total
      FROM orders
      WHERE placed_at >= date('now', '-30 days')
      GROUP BY date(placed_at)
      ORDER BY date
    `).all();
    
    const vegetableSales = db.prepare(`
      SELECT vegetable_name, SUM(quantity) as quantity, SUM(subtotal) as total
      FROM order_items
      GROUP BY vegetable_name
    `).all();
    
    const farmerSales = db.prepare(`
      SELECT oi.farmer_id, u.full_name, SUM(oi.subtotal) as total
      FROM order_items oi
      JOIN users u ON oi.farmer_id = u.id
      GROUP BY oi.farmer_id
    `).all();
    
    res.json({ ordersByDay, vegetableSales, farmerSales });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
