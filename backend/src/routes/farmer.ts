import express from 'express';
import db from '../database/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { authorizeRoles } from '../middleware/roleGuard';
import multer from 'multer';
import path from 'path';

const router = express.Router();
router.use(authenticateToken);
router.use(authorizeRoles('FARMER'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/')),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.get('/dashboard', (req: AuthRequest, res) => {
  try {
    const produceCount = (db.prepare("SELECT COUNT(*) as c FROM farmer_produce WHERE farmer_id = ?").get(req.user.id) as any).c;
    const stockSum = (db.prepare("SELECT COALESCE(SUM(available_quantity), 0) as s FROM farmer_produce WHERE farmer_id = ?").get(req.user.id) as any).s;
    const ordersReceived = (db.prepare("SELECT COUNT(DISTINCT order_id) as c FROM order_items WHERE farmer_id = ?").get(req.user.id) as any).c;
    const completedOrders = (db.prepare("SELECT COUNT(DISTINCT oi.order_id) as c FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE oi.farmer_id = ? AND o.status = 'DELIVERED'").get(req.user.id) as any).c;
    const totalEarnings = (db.prepare("SELECT COALESCE(SUM(oi.subtotal), 0) as s FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE oi.farmer_id = ? AND o.status = 'DELIVERED'").get(req.user.id) as any).s;
    
    const recentOrders = db.prepare(`
      SELECT oi.*, o.order_number, o.status, o.placed_at, o.total_amount,
             u.full_name as consumer_name
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN users u ON o.consumer_id = u.id
      WHERE oi.farmer_id = ?
      ORDER BY o.placed_at DESC LIMIT 5
    `).all(req.user.id);

    res.json({ produceCount, stockSum, ordersReceived, completedOrders, totalEarnings, recentOrders });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/vegetables', (req: AuthRequest, res) => {
  try {
    const vegetables = db.prepare("SELECT * FROM vegetables WHERE is_active = 1 ORDER BY name ASC").all();
    res.json(vegetables);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.get('/produce', (req: AuthRequest, res) => {
  try {
    const produce = db.prepare(`
      SELECT fp.*, v.name as vegetable_name, v.current_price
      FROM farmer_produce fp
      JOIN vegetables v ON fp.vegetable_id = v.id
      WHERE fp.farmer_id = ?
    `).all(req.user.id);
    
    const result = produce.map((p: any) => {
      p.images = db.prepare("SELECT image_url FROM produce_images WHERE produce_id = ?").all(p.id);
      return p;
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/produce', (req: AuthRequest, res) => {
  const { vegetable_id, available_quantity, unit, farm_name, farm_location, village, district, state, pincode } = req.body;
  try {
    const veg: any = db.prepare("SELECT id FROM vegetables WHERE id = ? AND is_active = 1").get(vegetable_id);
    if (!veg) return res.status(400).json({ error: 'Invalid vegetable' });
    
    const info = db.prepare(`
      INSERT INTO farmer_produce (farmer_id, vegetable_id, available_quantity, unit, farm_name, farm_location, village, district, state, pincode)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.user.id, 
      vegetable_id ?? null, 
      available_quantity ?? null, 
      unit ?? null, 
      farm_name ?? null, 
      farm_location ?? null, 
      village ?? null, 
      district ?? null, 
      state ?? null, 
      pincode ?? null
    );
    
    res.json({ success: true, id: info.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/produce/:id', (req: AuthRequest, res) => {
  const { available_quantity, farm_location, status } = req.body;
  try {
    const info = db.prepare(`
      UPDATE farmer_produce 
      SET available_quantity = COALESCE(?, available_quantity), farm_location = COALESCE(?, farm_location), status = COALESCE(?, status), updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND farmer_id = ?
    `).run(available_quantity ?? null, farm_location ?? null, status ?? null, req.params.id, req.user.id);
    
    if (info.changes === 0) return res.status(404).json({ error: 'Produce not found or unauthorized' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/produce/:id', (req: AuthRequest, res) => {
  try {
    const info = db.prepare("UPDATE farmer_produce SET status = 'INACTIVE' WHERE id = ? AND farmer_id = ?").run(req.params.id, req.user.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Produce not found or unauthorized' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/produce/:id/images', upload.array('images', 5), (req: AuthRequest, res) => {
  try {
    const p: any = db.prepare("SELECT id FROM farmer_produce WHERE id = ? AND farmer_id = ?").get(req.params.id, req.user.id);
    if (!p) return res.status(404).json({ error: 'Produce not found or unauthorized' });
    
    if (req.files) {
      const files = req.files as Express.Multer.File[];
      const insert = db.prepare("INSERT INTO produce_images (produce_id, image_url) VALUES (?, ?)");
      db.transaction(() => {
        files.forEach(f => insert.run(req.params.id, f.filename));
      })();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/orders', (req: AuthRequest, res) => {
  try {
    const orders = db.prepare(`
      SELECT DISTINCT o.*, u.full_name as consumer_name
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN users u ON o.consumer_id = u.id
      WHERE oi.farmer_id = ?
      ORDER BY o.placed_at DESC
    `).all(req.user.id);
    
    const result = orders.map((o: any) => {
      o.items = db.prepare(`SELECT * FROM order_items WHERE order_id = ? AND farmer_id = ?`).all(o.id, req.user.id);
      return o;
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/earnings', (req: AuthRequest, res) => {
  try {
    const earnings = db.prepare(`
      SELECT vegetable_name, strftime('%Y-%m', o.placed_at) as month, SUM(oi.subtotal) as total
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE oi.farmer_id = ? AND o.status = 'DELIVERED'
      GROUP BY vegetable_name, month
      ORDER BY month DESC
    `).all(req.user.id);
    res.json(earnings);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
