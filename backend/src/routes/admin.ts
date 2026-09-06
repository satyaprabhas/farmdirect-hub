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
    const totalCoordinators = (db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'COORDINATOR'").get() as any).count;
    const totalProducts = (db.prepare("SELECT COUNT(*) as count FROM farmer_produce WHERE status = 'ACTIVE'").get() as any).count;
    const totalOrders = (db.prepare("SELECT COUNT(*) as count FROM orders").get() as any).count;
    const pendingOrders = (db.prepare("SELECT COUNT(*) as count FROM orders WHERE status NOT IN ('DELIVERED', 'CANCELLED')").get() as any).count;
    const completedOrders = (db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'DELIVERED'").get() as any).count;
    const totalSales = (db.prepare("SELECT COALESCE(SUM(total_amount), 0) as sum FROM orders WHERE status = 'DELIVERED'").get() as any).sum;

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
      totalFarmers, totalConsumers, totalCoordinators, totalProducts,
      totalOrders, pendingOrders, completedOrders, totalSales,
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
    const info = db.prepare("INSERT INTO vegetables (name, current_price, unit) VALUES (?, ?, ?)").run(name, current_price, unit);
    res.json({ id: info.lastInsertRowid, name, current_price, unit });
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
    SELECT u.*, fp.*, (SELECT COUNT(*) FROM farmer_produce WHERE farmer_id = u.id) as produce_count
    FROM users u
    LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
    WHERE u.role = 'FARMER'
  `).all());
});

router.put('/farmers/:id/verify', (req, res) => {
  try {
    db.prepare("UPDATE users SET is_verified = NOT is_verified WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/farmers/:id/suspend', (req, res) => {
  try {
    db.prepare("UPDATE users SET is_active = NOT is_active WHERE id = ?").run(req.params.id);
    res.json({ success: true });
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

router.get('/coordinators', (req, res) => {
  res.json(db.prepare("SELECT * FROM users WHERE role = 'COORDINATOR'").all());
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
