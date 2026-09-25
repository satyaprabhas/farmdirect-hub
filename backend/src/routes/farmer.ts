import express from 'express';
import db from '../database/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { authorizeRoles } from '../middleware/roleGuard';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();
router.use(authenticateToken);
router.use(authorizeRoles('FARMER'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/')),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

function saveBase64Image(dataString: string | undefined): string | null {
  if (!dataString || typeof dataString !== 'string' || !dataString.startsWith('data:image/')) return null;
  try {
    const matches = dataString.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return null;
    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const filename = `${Date.now()}_camera.${ext}`;
    const uploadDir = path.join(__dirname, '../uploads/');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    fs.writeFileSync(path.join(uploadDir, filename), buffer);
    return `/uploads/${filename}`;
  } catch (e) {
    console.error('Error saving base64 image:', e);
    return null;
  }
}

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
    const farmerUser: any = db.prepare("SELECT is_verified, is_active FROM users WHERE id = ?").get(req.user.id);
    if (!farmerUser || farmerUser.is_verified !== 1) {
      return res.status(403).json({
        error: 'Your farmer account is pending verification and approval by Admin. You cannot sell or list produce until approved.'
      });
    }
    if (farmerUser.is_active !== 1) {
      return res.status(403).json({
        error: 'Your farmer account has been suspended by Admin.'
      });
    }

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
    const farmerUser: any = db.prepare("SELECT is_verified, is_active FROM users WHERE id = ?").get(req.user.id);
    if (!farmerUser || farmerUser.is_verified !== 1) {
      return res.status(403).json({
        error: 'Your farmer account is pending verification and approval by Admin. You cannot update produce until approved.'
      });
    }
    if (farmerUser.is_active !== 1) {
      return res.status(403).json({
        error: 'Your farmer account has been suspended by Admin.'
      });
    }

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
    const farmerUser: any = db.prepare("SELECT is_verified, is_active FROM users WHERE id = ?").get(req.user.id);
    if (!farmerUser || farmerUser.is_verified !== 1) {
      return res.status(403).json({
        error: 'Your farmer account is pending verification and approval by Admin. You cannot upload produce images until approved.'
      });
    }
    if (farmerUser.is_active !== 1) {
      return res.status(403).json({
        error: 'Your farmer account has been suspended by Admin.'
      });
    }

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

// 1. Crop Recommendation & Advisory based on Statistics
router.get('/crop-advisory', (req: AuthRequest, res) => {
  try {
    const vegetables = db.prepare("SELECT * FROM vegetables WHERE is_active = 1").all();

    // Agronomic metadata lookup for statistical advice
    const agronomicData: Record<string, { seasons: string[]; duration: string; yieldPerAcre: number; costPerAcre: number; waterReq: string; risk: string }> = {
      'Tomatoes': { seasons: ['Kharif', 'Rabi', 'All-Year'], duration: '90-110 days', yieldPerAcre: 12000, costPerAcre: 45000, waterReq: 'Moderate', risk: 'Low' },
      'Drumstick': { seasons: ['All-Year', 'Perennial'], duration: '180 days (Perennial)', yieldPerAcre: 8500, costPerAcre: 35000, waterReq: 'Low (Drought Tolerant)', risk: 'Very Low' },
      'Ridge Gourd': { seasons: ['Summer', 'Kharif'], duration: '60-70 days', yieldPerAcre: 6000, costPerAcre: 28000, waterReq: 'Moderate', risk: 'Low' },
      'Bitter Gourd': { seasons: ['Summer', 'Kharif'], duration: '65-75 days', yieldPerAcre: 5500, costPerAcre: 30000, waterReq: 'Moderate', risk: 'Low' },
      'Beans': { seasons: ['Rabi', 'Winter'], duration: '70-85 days', yieldPerAcre: 5000, costPerAcre: 32000, waterReq: 'Low to Moderate', risk: 'Low' },
      'Ladies Finger': { seasons: ['Summer', 'Kharif'], duration: '50-60 days', yieldPerAcre: 6500, costPerAcre: 26000, waterReq: 'Low to Moderate', risk: 'Low' },
      'Brinjal': { seasons: ['All-Year'], duration: '100-120 days', yieldPerAcre: 10000, costPerAcre: 38000, waterReq: 'Moderate', risk: 'Medium' },
      'Cauliflower': { seasons: ['Rabi', 'Winter'], duration: '80-100 days', yieldPerAcre: 8000, costPerAcre: 34000, waterReq: 'Moderate', risk: 'Medium' },
      'Tindora': { seasons: ['All-Year', 'Summer'], duration: '75-90 days', yieldPerAcre: 7000, costPerAcre: 32000, waterReq: 'Moderate', risk: 'Low' },
      'Carrots': { seasons: ['Rabi', 'Winter'], duration: '85-100 days', yieldPerAcre: 9000, costPerAcre: 30000, waterReq: 'Moderate', risk: 'Low' },
      'Cucumbers': { seasons: ['Summer', 'Zaid'], duration: '45-55 days', yieldPerAcre: 7500, costPerAcre: 24000, waterReq: 'Moderate', risk: 'Low' },
      'Bottle Gourd': { seasons: ['Summer', 'Kharif'], duration: '60-70 days', yieldPerAcre: 11000, costPerAcre: 25000, waterReq: 'Moderate', risk: 'Very Low' },
      'Spinach': { seasons: ['All-Year', 'Winter'], duration: '30-40 days', yieldPerAcre: 4500, costPerAcre: 15000, waterReq: 'High', risk: 'Very Low' },
      'Potatoes': { seasons: ['Rabi', 'Winter'], duration: '90-110 days', yieldPerAcre: 10000, costPerAcre: 40000, waterReq: 'Moderate', risk: 'Low' },
      'Onions': { seasons: ['Kharif', 'Rabi'], duration: '120-140 days', yieldPerAcre: 9500, costPerAcre: 42000, waterReq: 'Low to Moderate', risk: 'Low' },
    };

    const recommendations = (vegetables as any[]).map(veg => {
      // 1. Total order volume from marketplace stats
      const salesStats: any = db.prepare(`
        SELECT COUNT(*) as order_count, COALESCE(SUM(quantity), 0) as total_sold
        FROM order_items WHERE vegetable_id = ?
      `).get(veg.id);

      // 2. Current active stock in market
      const stockStats: any = db.prepare(`
        SELECT COALESCE(SUM(available_quantity), 0) as total_stock, COUNT(*) as active_farmers
        FROM farmer_produce WHERE vegetable_id = ? AND status = 'ACTIVE'
      `).get(veg.id);

      const agro = agronomicData[veg.name] || {
        seasons: ['All-Year'],
        duration: '70-90 days',
        yieldPerAcre: 7000,
        costPerAcre: 30000,
        waterReq: 'Moderate',
        risk: 'Low'
      };

      const mandatedPrice = veg.current_price;
      const farmerPricePerKg = Number((mandatedPrice * 0.85).toFixed(2));
      const estGrossRevenuePerAcre = farmerPricePerKg * agro.yieldPerAcre;
      const estNetProfitPerAcre = Math.max(0, estGrossRevenuePerAcre - agro.costPerAcre);
      const profitMarginPercent = Math.round((estNetProfitPerAcre / estGrossRevenuePerAcre) * 100);

      // Demand score calculation
      let demandRating = 'HIGH';
      let benefitScore = 80;

      if (mandatedPrice >= 50 || (salesStats.total_sold > stockStats.total_stock)) {
        demandRating = 'VERY HIGH';
        benefitScore = 95;
      } else if (stockStats.total_stock < 50) {
        demandRating = 'HIGH (Supply Shortage)';
        benefitScore = 90;
      } else if (mandatedPrice < 25 && stockStats.total_stock > 100) {
        demandRating = 'MODERATE';
        benefitScore = 70;
      }

      // Harvest duration days
      const daysMatch = (agro.duration || '').match(/(\d+)/);
      const harvestDays = daysMatch ? parseInt(daysMatch[1]) : 75;

      return {
        id: veg.id,
        name: veg.name,
        vegetable_name: veg.name,
        current_price: mandatedPrice,
        mandated_price: mandatedPrice,
        farmer_earning_rate: farmerPricePerKg,
        farmer_price: farmerPricePerKg,
        unit: veg.unit,
        demand_rating: demandRating,
        demand_level: demandRating.includes('HIGH') ? 'HIGH' : (demandRating.includes('MODERATE') ? 'MODERATE' : 'NORMAL'),
        demand_score: benefitScore,
        benefit_score: benefitScore,
        est_net_profit_per_acre: estNetProfitPerAcre,
        est_profit_acre: estNetProfitPerAcre,
        profit_margin_percent: profitMarginPercent,
        margin_percent: profitMarginPercent,
        yield_per_acre: agro.yieldPerAcre,
        avg_yield_acre: agro.yieldPerAcre,
        growing_duration: agro.duration,
        harvest_days: harvestDays,
        recommended_seasons: agro.seasons,
        best_season: agro.seasons.join(', '),
        water_requirement: agro.waterReq,
        risk_level: agro.risk,
        current_active_farmers: stockStats.active_farmers || 0,
        total_stock_available: stockStats.total_stock || 0,
        recommendation: `Recommended for ${agro.seasons.join(' & ')} season. High market demand yielding ₹${estNetProfitPerAcre.toLocaleString('en-IN')} est. net profit/acre with ${profitMarginPercent}% margin.`,
        stat_note: `${salesStats.order_count || 0} direct consumer orders (${salesStats.total_sold || 0} kg traded)`,
        market_stats: {
          total_orders: salesStats.order_count || 0,
          total_kg_sold: salesStats.total_sold || 0,
          current_active_stock_kg: stockStats.total_stock || 0,
          active_farmers_competing: stockStats.active_farmers || 0
        }
      };
    });

    recommendations.sort((a, b) => b.benefit_score - a.benefit_score || b.est_net_profit_per_acre - a.est_net_profit_per_acre);
    res.json({ success: true, advisory: recommendations, count: recommendations.length });
  } catch (err) {
    console.error('Crop advisory error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Crop Disease Detection & Consultation - Get Farmer's Cases
router.get('/consultations', (req: AuthRequest, res) => {
  try {
    const consultations = db.prepare(`
      SELECT c.*, 
             u.full_name as adviser_name, u.mobile_number as adviser_mobile,
             ap.specialization as adviser_specialization, ap.qualification as adviser_qualification
      FROM crop_disease_consultations c
      LEFT JOIN users u ON c.adviser_id = u.id
      LEFT JOIN adviser_profiles ap ON u.id = ap.user_id
      WHERE c.farmer_id = ?
      ORDER BY c.created_at DESC
    `).all(req.user.id);

    res.json(consultations);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Crop Disease Detection - Submit New Case with Photo
router.post('/consultations', upload.single('crop_image'), (req: AuthRequest, res) => {
  try {
    const { crop_name, symptoms, affected_area } = req.body;
    if (!crop_name || !symptoms) {
      return res.status(400).json({ error: 'Crop name and symptoms description are required' });
    }

    let image_url = req.file ? `/uploads/${req.file.filename}` : null;
    if (!image_url && req.body.crop_image) {
      image_url = saveBase64Image(req.body.crop_image);
    }
    if (!image_url && req.body.image_url) {
      image_url = saveBase64Image(req.body.image_url) || req.body.image_url;
    }
    if (!image_url) {
      image_url = '/uploads/1789361063839.jpeg';
    }

    // Rule-based diagnostic screening
    let preliminaryDiagnosis = 'Analyzing with Agricultural Experts';
    const lowerSymptoms = symptoms.toLowerCase();
    if (lowerSymptoms.includes('spot') || lowerSymptoms.includes('blight') || lowerSymptoms.includes('ring')) {
      preliminaryDiagnosis = 'Likely Early/Late Blight or Fungal Leaf Spot';
    } else if (lowerSymptoms.includes('yellow') || lowerSymptoms.includes('curl')) {
      preliminaryDiagnosis = 'Likely Leaf Curl Virus or Nutrient Deficiency';
    } else if (lowerSymptoms.includes('rot') || lowerSymptoms.includes('wet')) {
      preliminaryDiagnosis = 'Likely Bacterial Soft Rot or Damping Off';
    } else if (lowerSymptoms.includes('hole') || lowerSymptoms.includes('pest') || lowerSymptoms.includes('worm')) {
      preliminaryDiagnosis = 'Likely Fruit Borer or Caterpillar Pest Infestation';
    }

    const info = db.prepare(`
      INSERT INTO crop_disease_consultations (farmer_id, crop_name, image_url, symptoms, affected_area, status, disease_name)
      VALUES (?, ?, ?, ?, ?, 'PENDING', ?)
    `).run(
      req.user.id,
      crop_name,
      image_url,
      symptoms,
      affected_area || 'Not specified',
      preliminaryDiagnosis
    );

    // Notify all active advisers
    const advisers = db.prepare("SELECT id FROM users WHERE role = 'ADVISER'").all();
    advisers.forEach((adv: any) => {
      db.prepare(`
        INSERT INTO notifications (user_id, title, message)
        VALUES (?, 'New Crop Disease Case Submitted', ?)
      `).run(adv.id, `Farmer submitted a disease case for ${crop_name}. Please review and advise.`);
    });

    res.status(201).json({
      success: true,
      id: info.lastInsertRowid,
      preliminary_diagnosis: preliminaryDiagnosis,
      message: 'Disease case submitted successfully to Agricultural Advisers.'
    });
  } catch (err) {
    console.error('Submit consultation error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. Crop Disease Detection - Delete Consultation Case
router.delete('/consultations/:id', (req: AuthRequest, res) => {
  try {
    const consultationId = req.params.id;
    const consultation: any = db.prepare('SELECT * FROM crop_disease_consultations WHERE id = ?').get(consultationId);
    if (!consultation) {
      return res.status(404).json({ error: 'Consultation case not found' });
    }

    if (consultation.farmer_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'You are not authorized to delete this consultation case' });
    }

    db.prepare('DELETE FROM crop_disease_consultations WHERE id = ?').run(consultationId);
    res.json({ success: true, message: 'Consultation case deleted successfully' });
  } catch (err) {
    console.error('Delete consultation error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 5. Farmer Support - Get Farmer's Soil & Nutrient Consultations
router.get('/soil-reports', (req: AuthRequest, res) => {
  try {
    const reports = db.prepare(`
      SELECT s.*,
             u.full_name as adviser_name, u.mobile_number as adviser_mobile,
             ap.specialization as adviser_specialization, ap.qualification as adviser_qualification
      FROM soil_nutrient_consultations s
      LEFT JOIN users u ON s.adviser_id = u.id
      LEFT JOIN adviser_profiles ap ON u.id = ap.user_id
      WHERE s.farmer_id = ?
      ORDER BY s.created_at DESC
    `).all(req.user.id);

    res.json(reports);
  } catch (err) {
    console.error('Fetch soil reports error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 6. Farmer Support - Submit Soil Test Report for Nutrient Advisory
router.post('/soil-reports', upload.single('soil_report_image'), (req: AuthRequest, res) => {
  try {
    const { crop_name, land_area, soil_type, fertilizer_preference, farmer_notes } = req.body;
    if (!crop_name || !land_area) {
      return res.status(400).json({ error: 'Crop name and land area are required' });
    }

    let soil_report_image = req.file ? `/uploads/${req.file.filename}` : null;
    if (!soil_report_image && req.body.soil_report_image) {
      soil_report_image = saveBase64Image(req.body.soil_report_image) || req.body.soil_report_image;
    }
    if (!soil_report_image) {
      soil_report_image = '/uploads/1789360871472.jpeg';
    }

    const info = db.prepare(`
      INSERT INTO soil_nutrient_consultations (
        farmer_id, crop_name, land_area, soil_type, fertilizer_preference, soil_report_image, farmer_notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')
    `).run(
      req.user.id,
      crop_name,
      land_area,
      soil_type || 'General Agricultural Soil',
      fertilizer_preference || 'ORGANIC',
      soil_report_image,
      farmer_notes || null
    );

    // Notify all active advisers
    const advisers = db.prepare("SELECT id FROM users WHERE role = 'ADVISER'").all();
    advisers.forEach((adv: any) => {
      db.prepare(`
        INSERT INTO notifications (user_id, title, message)
        VALUES (?, 'New Soil & Nutrient Advisory Request', ?)
      `).run(adv.id, `Farmer submitted soil test report for ${crop_name} (${land_area}) with preference for ${fertilizer_preference || 'Organic'} fertilizer. Please provide fertilizer advice.`);
    });

    res.status(201).json({
      success: true,
      id: info.lastInsertRowid,
      message: 'Soil report submitted successfully! An agricultural adviser will analyze and recommend optimal nutrient dosages.'
    });
  } catch (err) {
    console.error('Submit soil report error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 7. Farmer Support - Delete Soil Consultation Case
router.delete('/soil-reports/:id', (req: AuthRequest, res) => {
  try {
    const reportId = req.params.id;
    const report: any = db.prepare('SELECT * FROM soil_nutrient_consultations WHERE id = ?').get(reportId);
    if (!report) {
      return res.status(404).json({ error: 'Soil report case not found' });
    }

    if (report.farmer_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'You are not authorized to delete this soil report case' });
    }

    db.prepare('DELETE FROM soil_nutrient_consultations WHERE id = ?').run(reportId);
    res.json({ success: true, message: 'Soil report case deleted successfully' });
  } catch (err) {
    console.error('Delete soil report error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
