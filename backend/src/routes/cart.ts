import express from 'express';
import db from '../database/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { authorizeRoles } from '../middleware/roleGuard';

const router = express.Router();
router.use(authenticateToken);
router.use(authorizeRoles('CONSUMER'));

router.get('/', (req: AuthRequest, res) => {
  try {
    let cart: any = db.prepare("SELECT id FROM carts WHERE consumer_id = ?").get(req.user.id);
    if (!cart) {
      const info = db.prepare("INSERT INTO carts (consumer_id) VALUES (?)").run(req.user.id);
      cart = { id: info.lastInsertRowid };
    }
    
    const items = db.prepare(`
      SELECT ci.*, fp.available_quantity, fp.farm_name, fp.farm_location,
             v.name as vegetable_name, v.current_price, v.unit as veg_unit,
             u.full_name as farmer_name
      FROM cart_items ci
      JOIN farmer_produce fp ON ci.produce_id = fp.id
      JOIN vegetables v ON fp.vegetable_id = v.id
      JOIN users u ON fp.farmer_id = u.id
      WHERE ci.cart_id = ?
    `).all(cart.id);
    
    let subtotal = 0;
    const finalItems = items.map((i: any) => {
      i.subtotal = i.quantity * i.current_price;
      subtotal += i.subtotal;
      return i;
    });
    
    res.json({ id: cart.id, items: finalItems, subtotal, delivery_fee: 20, total_amount: subtotal + 20 });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/items', (req: AuthRequest, res) => {
  const { produce_id, quantity } = req.body;
  try {
    const produce: any = db.prepare("SELECT * FROM farmer_produce WHERE id = ? AND status = 'ACTIVE'").get(produce_id);
    if (!produce) return res.status(404).json({ error: 'Produce not found or inactive' });
    if (produce.available_quantity < quantity) return res.status(400).json({ error: 'Not enough quantity' });
    
    let cart: any = db.prepare("SELECT id FROM carts WHERE consumer_id = ?").get(req.user.id);
    if (!cart) {
      cart = { id: db.prepare("INSERT INTO carts (consumer_id) VALUES (?)").run(req.user.id).lastInsertRowid };
    }
    
    const existing: any = db.prepare("SELECT * FROM cart_items WHERE cart_id = ? AND produce_id = ?").get(cart.id, produce_id);
    if (existing) {
      const newQ = existing.quantity + quantity;
      if (produce.available_quantity < newQ) return res.status(400).json({ error: 'Not enough quantity' });
      db.prepare("UPDATE cart_items SET quantity = ? WHERE id = ?").run(newQ, existing.id);
    } else {
      db.prepare("INSERT INTO cart_items (cart_id, produce_id, quantity) VALUES (?, ?, ?)").run(cart.id, produce_id, quantity);
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/items/:id', (req: AuthRequest, res) => {
  const { quantity } = req.body;
  try {
    const item: any = db.prepare("SELECT * FROM cart_items WHERE id = ?").get(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    
    const produce: any = db.prepare("SELECT available_quantity FROM farmer_produce WHERE id = ?").get(item.produce_id);
    if (produce.available_quantity < quantity) return res.status(400).json({ error: 'Not enough quantity' });
    
    db.prepare("UPDATE cart_items SET quantity = ? WHERE id = ?").run(quantity, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/items/:id', (req: AuthRequest, res) => {
  try {
    db.prepare("DELETE FROM cart_items WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/', (req: AuthRequest, res) => {
  try {
    const cart: any = db.prepare("SELECT id FROM carts WHERE consumer_id = ?").get(req.user.id);
    if (cart) {
      db.prepare("DELETE FROM cart_items WHERE cart_id = ?").run(cart.id);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
