import express from 'express';
import db from '../database/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
router.use(authenticateToken);

router.post('/', (req: AuthRequest, res) => {
  if (req.user.role !== 'CONSUMER') return res.status(403).json({ error: 'Forbidden' });
  
  try {
    let orderId;
    db.transaction(() => {
      const cart: any = db.prepare("SELECT id FROM carts WHERE consumer_id = ?").get(req.user.id);
      if (!cart) throw new Error('Cart is empty');
      
      const items = db.prepare(`
        SELECT ci.*, fp.available_quantity, fp.farmer_id, fp.vegetable_id, fp.unit, fp.farm_name, fp.farm_location,
               v.name as vegetable_name, v.current_price
        FROM cart_items ci
        JOIN farmer_produce fp ON ci.produce_id = fp.id
        JOIN vegetables v ON fp.vegetable_id = v.id
        WHERE ci.cart_id = ?
      `).all(cart.id);
      
      if (items.length === 0) throw new Error('Cart is empty');
      
      let subtotal = 0;
      for (const item of items as any[]) {
        if (item.available_quantity < item.quantity) {
          throw new Error(`Only ${item.available_quantity} available for ${item.vegetable_name}`);
        }
        db.prepare("UPDATE farmer_produce SET available_quantity = available_quantity - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(item.quantity, item.produce_id);
        const newQ = item.available_quantity - item.quantity;
        if (newQ === 0) {
          db.prepare("UPDATE farmer_produce SET status = 'SOLDOUT' WHERE id = ?").run(item.produce_id);
        }
        subtotal += (item.quantity * item.current_price);
      }
      
      const order_number = 'FDH-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const reqBody = req.body || {};
      const isHubPickup = reqBody.delivery_type === 'HUB_PICKUP';
      const delivery_fee = isHubPickup ? 0 : 20;
      const total_amount = subtotal + delivery_fee;
      
      let final_address = reqBody.delivery_address || '';
      let final_village = reqBody.delivery_village || '';
      let final_district = reqBody.delivery_district || '';
      let final_state = reqBody.delivery_state || '';
      let final_pincode = reqBody.delivery_pincode || '';
      
      if (isHubPickup) {
        final_address = 'Hub Pickup';
      } else if (!final_address) {
        const consumer: any = db.prepare("SELECT address, village, district, state, pincode FROM users WHERE id = ?").get(req.user.id);
        final_address = consumer?.address || '';
        final_village = consumer?.village || '';
        final_district = consumer?.district || '';
        final_state = consumer?.state || '';
        final_pincode = consumer?.pincode || '';
      }
      
      const coord: any = db.prepare("SELECT id FROM users WHERE role = 'COORDINATOR' LIMIT 1").get();
      
      const orderInfo = db.prepare(`
        INSERT INTO orders (order_number, consumer_id, coordinator_id, delivery_address, delivery_village, delivery_district, delivery_state, delivery_pincode, subtotal, delivery_fee, total_amount)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(order_number, req.user.id, coord ? coord.id : null, final_address, final_village, final_district, final_state, final_pincode, subtotal, delivery_fee, total_amount);
      orderId = orderInfo.lastInsertRowid;
      
      for (const item of items as any[]) {
        db.prepare(`
          INSERT INTO order_items (order_id, produce_id, farmer_id, vegetable_id, vegetable_name, quantity, unit, price_at_purchase, subtotal, farm_name, farmer_location)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(orderId, item.produce_id, item.farmer_id, item.vegetable_id, item.vegetable_name, item.quantity, item.unit, item.current_price, item.quantity * item.current_price, item.farm_name, item.farm_location);
        
        db.prepare("INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)").run(item.farmer_id, 'New Order Received', `You have a new order for ${item.vegetable_name}`);
      }
      
      db.prepare("DELETE FROM cart_items WHERE cart_id = ?").run(cart.id);
      
      db.prepare("INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)").run(req.user.id, 'Order Placed Successfully', `Your order ${order_number} has been placed`);
      if (coord) {
        db.prepare("INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)").run(coord.id, 'New Order Assigned', `Order ${order_number} needs coordination`);
      }
      
    })();
    
    const order: any = db.prepare("SELECT order_number FROM orders WHERE id = ?").get(orderId);
    res.json({ success: true, orderId, order_number: order?.order_number });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', (req: AuthRequest, res) => {
  try {
    let orders: any[] = [];
    if (req.user.role === 'CONSUMER') {
      orders = db.prepare("SELECT * FROM orders WHERE consumer_id = ? ORDER BY placed_at DESC").all(req.user.id);
    } else if (req.user.role === 'COORDINATOR') {
      orders = db.prepare("SELECT * FROM orders WHERE coordinator_id = ? ORDER BY placed_at DESC").all(req.user.id);
    } else if (req.user.role === 'FARMER') {
      orders = db.prepare(`
        SELECT DISTINCT o.* 
        FROM orders o 
        JOIN order_items oi ON o.id = oi.order_id 
        WHERE oi.farmer_id = ?
        ORDER BY o.placed_at DESC
      `).all(req.user.id);
    } else {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    // Attach items to each order
    const result = orders.map((o: any) => {
      o.items = db.prepare(`
        SELECT oi.*, fp.vegetable_id, v.name as vegetable_name, v.unit
        FROM order_items oi
        JOIN farmer_produce fp ON oi.produce_id = fp.id
        JOIN vegetables v ON fp.vegetable_id = v.id
        WHERE oi.order_id = ?
      `).all(o.id);
      return o;
    });
    
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', (req: AuthRequest, res) => {
  try {
    const order: any = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    order.items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(order.id);
    order.consumer = db.prepare("SELECT full_name, mobile_number, address FROM users WHERE id = ?").get(order.consumer_id);
    
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
