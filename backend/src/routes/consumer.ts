import express from 'express';
import db from '../database/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { authorizeRoles } from '../middleware/roleGuard';

const router = express.Router();
router.use(authenticateToken);
router.use(authorizeRoles('CONSUMER'));

router.get('/dashboard', (req: AuthRequest, res) => {
  try {
    const activeOrders = (db.prepare("SELECT COUNT(*) as c FROM orders WHERE consumer_id = ? AND status NOT IN ('DELIVERED', 'CANCELLED')").get(req.user.id) as any).c;
    const completedOrders = (db.prepare("SELECT COUNT(*) as c FROM orders WHERE consumer_id = ? AND status = 'DELIVERED'").get(req.user.id) as any).c;
    
    let cartCount = 0;
    const cart: any = db.prepare("SELECT id FROM carts WHERE consumer_id = ?").get(req.user.id);
    if (cart) {
      cartCount = (db.prepare("SELECT COUNT(*) as c FROM cart_items WHERE cart_id = ?").get(cart.id) as any).c;
    }
    
    res.json({ activeOrders, completedOrders, cartCount });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
