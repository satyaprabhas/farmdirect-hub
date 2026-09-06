import express from 'express';
import db from '../database/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
router.use(authenticateToken);

router.get('/', (req: AuthRequest, res) => {
  try {
    const notifs = db.prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50").all(req.user.id);
    res.json(notifs);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/read', (req: AuthRequest, res) => {
  try {
    db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?").run(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/read-all', (req: AuthRequest, res) => {
  try {
    db.prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?").run(req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/unread-count', (req: AuthRequest, res) => {
  try {
    const count = (db.prepare("SELECT COUNT(*) as c FROM notifications WHERE user_id = ? AND is_read = 0").get(req.user.id) as any).c;
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
