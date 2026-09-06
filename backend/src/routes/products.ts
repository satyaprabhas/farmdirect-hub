import express from 'express';
import db from '../database/db';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const { search, vegetable_id, location, sort, verified } = req.query;
    
    let query = `
      SELECT fp.*, v.name as vegetable_name, v.current_price, v.unit as veg_unit,
             u.full_name as farmer_name, u.is_verified
      FROM farmer_produce fp
      JOIN vegetables v ON fp.vegetable_id = v.id
      JOIN users u ON fp.farmer_id = u.id
      WHERE fp.status = 'ACTIVE' AND fp.available_quantity > 0
    `;
    const params = [];
    
    if (search) {
      query += ` AND v.name LIKE ?`;
      params.push(`%${search}%`);
    }
    if (vegetable_id) {
      query += ` AND fp.vegetable_id = ?`;
      params.push(vegetable_id);
    }
    if (location) {
      query += ` AND (fp.village LIKE ? OR fp.district LIKE ? OR fp.state LIKE ?)`;
      params.push(`%${location}%`, `%${location}%`, `%${location}%`);
    }
    if (verified === 'true') {
      query += ` AND u.is_verified = 1`;
    }
    
    if (sort === 'price_asc') query += ` ORDER BY v.current_price ASC`;
    else if (sort === 'price_desc') query += ` ORDER BY v.current_price DESC`;
    else query += ` ORDER BY fp.listed_at DESC`;
    
    const produce = db.prepare(query).all(...params);
    const result = produce.map((p: any) => {
      p.images = db.prepare("SELECT image_url FROM produce_images WHERE produce_id = ?").all(p.id);
      return p;
    });
    
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const p: any = db.prepare(`
      SELECT fp.*, v.name as vegetable_name, v.current_price, v.unit as veg_unit,
             u.full_name as farmer_name, u.is_verified
      FROM farmer_produce fp
      JOIN vegetables v ON fp.vegetable_id = v.id
      JOIN users u ON fp.farmer_id = u.id
      WHERE fp.id = ?
    `).get(req.params.id);
    
    if (!p) return res.status(404).json({ error: 'Produce not found' });
    
    p.images = db.prepare("SELECT image_url FROM produce_images WHERE produce_id = ?").all(p.id);
    res.json(p);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
