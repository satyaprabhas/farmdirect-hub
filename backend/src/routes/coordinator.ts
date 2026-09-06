import express from 'express';
import db from '../database/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { authorizeRoles } from '../middleware/roleGuard';

const router = express.Router();
router.use(authenticateToken);
router.use(authorizeRoles('COORDINATOR'));

router.get('/dashboard', (req: AuthRequest, res) => {
  try {
    const totalOrders = (db.prepare("SELECT COUNT(*) as c FROM orders WHERE coordinator_id = ?").get(req.user.id) as any).c;
    const completedOrders = (db.prepare("SELECT COUNT(*) as c FROM orders WHERE coordinator_id = ? AND status = 'DELIVERED'").get(req.user.id) as any).c;
    const pendingOrders = (db.prepare("SELECT COUNT(*) as c FROM orders WHERE coordinator_id = ? AND status NOT IN ('DELIVERED', 'CANCELLED')").get(req.user.id) as any).c;
    
    const totalFarmers = (db.prepare("SELECT COUNT(DISTINCT oi.farmer_id) as c FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE o.coordinator_id = ?").get(req.user.id) as any).c;
    const totalCustomers = (db.prepare("SELECT COUNT(DISTINCT consumer_id) as c FROM orders WHERE coordinator_id = ?").get(req.user.id) as any).c;
    
    res.json({ totalOrders, completedOrders, pendingOrders, totalFarmers, totalCustomers });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/orders', (req: AuthRequest, res) => {
  try {
    let query = `
      SELECT o.*, u.full_name as consumer_name, u.mobile_number as consumer_mobile
      FROM orders o
      JOIN users u ON o.consumer_id = u.id
      WHERE o.coordinator_id = ?
    `;
    const params: any[] = [req.user.id];
    
    if (req.query.status) {
      query += ` AND o.status = ?`;
      params.push(req.query.status);
    }
    query += ` ORDER BY o.placed_at DESC`;
    
    const orders: any[] = db.prepare(query).all(...params);
    
    // Attach items to each order
    orders.forEach(order => {
      order.items = db.prepare(`
        SELECT oi.vegetable_name, oi.quantity, oi.unit, u.full_name as farmer_name 
        FROM order_items oi
        LEFT JOIN users u ON oi.farmer_id = u.id
        WHERE oi.order_id = ?
      `).all(order.id);
    });
    
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/orders/:id', (req: AuthRequest, res) => {
  try {
    const order: any = db.prepare("SELECT * FROM orders WHERE id = ? AND coordinator_id = ?").get(req.params.id, req.user.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    order.items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(order.id);
    order.consumer = db.prepare("SELECT full_name, mobile_number, address, village, district, state, pincode FROM users WHERE id = ?").get(order.consumer_id);
    
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/orders/:id/status', (req: AuthRequest, res) => {
  const { status } = req.body;
  try {
    db.transaction(() => {
      const order: any = db.prepare("SELECT * FROM orders WHERE id = ? AND coordinator_id = ?").get(req.params.id, req.user.id);
      if (!order) throw new Error('Order not found');
      
      db.prepare("UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(status, req.params.id);
      
      const farmers = db.prepare("SELECT DISTINCT farmer_id FROM order_items WHERE order_id = ?").all(order.id);
      
      if (status === 'CONFIRMED') {
        db.prepare("INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)").run(order.consumer_id, 'Order Confirmed', `Order ${order.order_number} has been confirmed`);
      } else if (status === 'PICKUP') {
        farmers.forEach((f: any) => db.prepare("INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)").run(f.farmer_id, 'Pickup Scheduled', `Pickup scheduled for order ${order.order_number}`));
      } else if (status === 'OUT_FOR_DELIVERY') {
        db.prepare("INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)").run(order.consumer_id, 'Out for Delivery', `Order ${order.order_number} is out for delivery`);
      } else if (status === 'DELIVERED') {
        db.prepare("INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)").run(order.consumer_id, 'Order Delivered', `Order ${order.order_number} has been delivered`);
        farmers.forEach((f: any) => db.prepare("INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)").run(f.farmer_id, 'Order Completed', `Order ${order.order_number} completed`));
      } else if (status === 'CANCELLED') {
        db.prepare("INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)").run(order.consumer_id, 'Order Cancelled', `Order ${order.order_number} was cancelled`);
        const items = db.prepare("SELECT produce_id, quantity FROM order_items WHERE order_id = ?").all(order.id);
        for (const item of items as any[]) {
          db.prepare("UPDATE farmer_produce SET available_quantity = available_quantity + ?, status = 'ACTIVE' WHERE id = ?").run(item.quantity, item.produce_id);
        }
      }
    })();
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/farmers', (req: AuthRequest, res) => {
  try {
    const farmers = db.prepare(`
      SELECT DISTINCT u.* 
      FROM users u
      JOIN order_items oi ON u.id = oi.farmer_id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.coordinator_id = ?
    `).all(req.user.id);
    res.json(farmers);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/customers', (req: AuthRequest, res) => {
  try {
    const customers = db.prepare(`
      SELECT DISTINCT u.* 
      FROM users u
      JOIN orders o ON u.id = o.consumer_id
      WHERE o.coordinator_id = ?
    `).all(req.user.id);
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
