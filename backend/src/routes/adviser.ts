import express from 'express';
import db from '../database/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { authorizeRoles } from '../middleware/roleGuard';

const router = express.Router();
router.use(authenticateToken);
router.use(authorizeRoles('ADVISER', 'ADMIN'));

// 1. Get Adviser Dashboard Stats
router.get('/stats', (req: AuthRequest, res) => {
  try {
    const totalCases = (db.prepare("SELECT COUNT(*) as c FROM crop_disease_consultations").get() as any).c;
    const pendingCases = (db.prepare("SELECT COUNT(*) as c FROM crop_disease_consultations WHERE status = 'PENDING'").get() as any).c;
    const resolvedCases = (db.prepare("SELECT COUNT(*) as c FROM crop_disease_consultations WHERE status IN ('ANALYZED', 'RESOLVED')").get() as any).c;
    const myAdvisedCases = (db.prepare("SELECT COUNT(*) as c FROM crop_disease_consultations WHERE adviser_id = ?").get(req.user.id) as any).c;

    const totalSoilCases = (db.prepare("SELECT COUNT(*) as c FROM soil_nutrient_consultations").get() as any).c;
    const pendingSoilCases = (db.prepare("SELECT COUNT(*) as c FROM soil_nutrient_consultations WHERE status = 'PENDING'").get() as any).c;
    const advisedSoilCases = (db.prepare("SELECT COUNT(*) as c FROM soil_nutrient_consultations WHERE status = 'ADVISED'").get() as any).c;

    res.json({
      total_cases: totalCases,
      pending_cases: pendingCases,
      resolved_cases: resolvedCases,
      my_advised_cases: myAdvisedCases,
      total_soil_cases: totalSoilCases,
      pending_soil_cases: pendingSoilCases,
      advised_soil_cases: advisedSoilCases
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Get All Crop Disease Cases
router.get('/cases', (req: AuthRequest, res) => {
  try {
    const { status, crop } = req.query;
    let query = `
      SELECT c.*, 
             u.full_name as farmer_name, u.mobile_number as farmer_mobile,
             u.village as farmer_village, u.district as farmer_district, u.state as farmer_state,
             adv.full_name as adviser_name
      FROM crop_disease_consultations c
      JOIN users u ON c.farmer_id = u.id
      LEFT JOIN users adv ON c.adviser_id = adv.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'ALL') {
      query += ` AND c.status = ?`;
      params.push(status);
    }
    if (crop && crop !== 'All') {
      query += ` AND c.crop_name = ?`;
      params.push(crop);
    }

    query += ` ORDER BY CASE WHEN c.status = 'PENDING' THEN 0 ELSE 1 END, c.created_at DESC`;

    const cases = db.prepare(query).all(...params);
    res.json(cases);
  } catch (err) {
    console.error('Error fetching adviser cases:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Get Single Case Details
router.get('/cases/:id', (req: AuthRequest, res) => {
  try {
    const consultation: any = db.prepare(`
      SELECT c.*, 
             u.full_name as farmer_name, u.mobile_number as farmer_mobile,
             u.village as farmer_village, u.district as farmer_district, u.state as farmer_state,
             adv.full_name as adviser_name, ap.specialization as adviser_specialization
      FROM crop_disease_consultations c
      JOIN users u ON c.farmer_id = u.id
      LEFT JOIN users adv ON c.adviser_id = adv.id
      LEFT JOIN adviser_profiles ap ON adv.id = ap.user_id
      WHERE c.id = ?
    `).get(req.params.id);

    if (!consultation) return res.status(404).json({ error: 'Case not found' });
    res.json(consultation);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. Submit Expert Diagnosis & Prescription
router.post('/cases/:id/advise', (req: AuthRequest, res) => {
  try {
    const { disease_name, prescription, adviser_notes } = req.body;
    if (!disease_name || !prescription) {
      return res.status(400).json({ error: 'Diagnosis and prescription are required' });
    }

    // Check if adviser is approved by admin
    const adviserUser: any = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
    if (!adviserUser || !adviserUser.is_verified) {
      return res.status(403).json({ 
        error: 'Your adviser account is pending verification and approval by the Admin. You cannot provide advice until approved.' 
      });
    }

    const currentCase: any = db.prepare("SELECT * FROM crop_disease_consultations WHERE id = ?").get(req.params.id);
    if (!currentCase) return res.status(404).json({ error: 'Case not found' });

    db.prepare(`
      UPDATE crop_disease_consultations 
      SET disease_name = ?, prescription = ?, adviser_notes = ?, adviser_id = ?, status = 'RESOLVED', advised_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(disease_name, prescription, adviser_notes || null, req.user.id, req.params.id);

    // Notify farmer
    const adviserName = adviserUser ? adviserUser.full_name : 'Agricultural Adviser';
    db.prepare(`
      INSERT INTO notifications (user_id, title, message)
      VALUES (?, ?, ?)
    `).run(
      currentCase.farmer_id,
      'Crop Disease Advice Received 🌾',
      `Expert ${adviserName} diagnosed your ${currentCase.crop_name} as "${disease_name}" and submitted a prescription.`
    );

    res.json({ success: true, message: 'Prescription and advice successfully sent to the farmer.' });
  } catch (err) {
    console.error('Submit advice error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 5. Farmer Support - Get All Soil Nutrient Reports for Advisers
router.get('/soil-reports', (req: AuthRequest, res) => {
  try {
    const { status, crop } = req.query;
    let query = `
      SELECT s.*,
             u.full_name as farmer_name, u.mobile_number as farmer_mobile,
             u.village as farmer_village, u.district as farmer_district, u.state as farmer_state,
             adv.full_name as adviser_name
      FROM soil_nutrient_consultations s
      JOIN users u ON s.farmer_id = u.id
      LEFT JOIN users adv ON s.adviser_id = adv.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'ALL') {
      query += ` AND s.status = ?`;
      params.push(status);
    }
    if (crop && crop !== 'All') {
      query += ` AND s.crop_name = ?`;
      params.push(crop);
    }

    query += ` ORDER BY CASE WHEN s.status = 'PENDING' THEN 0 ELSE 1 END, s.created_at DESC`;

    const reports = db.prepare(query).all(...params);
    res.json(reports);
  } catch (err) {
    console.error('Error fetching soil reports for adviser:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 6. Farmer Support - Submit Soil Nutrient Prescription & Advice
router.post('/soil-reports/:id/advise', (req: AuthRequest, res) => {
  try {
    const {
      fertilizer_advice,
      general_prescription,
      nitrogen_advice,
      phosphorus_advice,
      potassium_advice,
      micronutrients_advice,
      organic_advice,
      adviser_notes
    } = req.body;

    const finalAdvice = fertilizer_advice || general_prescription;
    if (!finalAdvice && !nitrogen_advice && !phosphorus_advice && !potassium_advice) {
      return res.status(400).json({ error: 'Please provide fertilizer recommendation and advice based on farmer preference.' });
    }

    // Check if adviser is verified by Admin
    const adviserUser: any = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
    if (!adviserUser || !adviserUser.is_verified) {
      return res.status(403).json({
        error: 'Your adviser account is pending verification and approval by the Admin. You cannot provide advice until approved.'
      });
    }

    const currentCase: any = db.prepare("SELECT * FROM soil_nutrient_consultations WHERE id = ?").get(req.params.id);
    if (!currentCase) return res.status(404).json({ error: 'Soil report case not found' });

    db.prepare(`
      UPDATE soil_nutrient_consultations
      SET fertilizer_advice = ?,
          general_prescription = ?,
          nitrogen_advice = ?,
          phosphorus_advice = ?,
          potassium_advice = ?,
          micronutrients_advice = ?,
          organic_advice = ?,
          adviser_notes = ?,
          adviser_id = ?,
          status = 'ADVISED',
          advised_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      finalAdvice || 'Custom fertilizer and nutrient advice prepared by specialist.',
      finalAdvice || 'Custom fertilizer and nutrient advice prepared by specialist.',
      nitrogen_advice || null,
      phosphorus_advice || null,
      potassium_advice || null,
      micronutrients_advice || null,
      organic_advice || null,
      adviser_notes || null,
      req.user.id,
      req.params.id
    );

    // Notify farmer
    const adviserName = adviserUser ? adviserUser.full_name : 'Agricultural Adviser';
    db.prepare(`
      INSERT INTO notifications (user_id, title, message)
      VALUES (?, ?, ?)
    `).run(
      currentCase.farmer_id,
      'Soil & Nutrient Advisory Received 🧪',
      `Expert ${adviserName} provided customized nutrient recommendations for your ${currentCase.crop_name} (${currentCase.land_area}).`
    );

    res.json({ success: true, message: 'Nutrient prescription and advice successfully sent to the farmer!' });
  } catch (err) {
    console.error('Submit soil advice error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 7. Get Adviser Profile
router.get('/profile', (req: AuthRequest, res) => {
  try {
    const profile: any = db.prepare(`
      SELECT u.id, u.full_name, u.username, u.mobile_number, u.email, u.district, u.state,
             ap.specialization, ap.qualification, ap.license_number, ap.experience_years, ap.bio
      FROM users u
      LEFT JOIN adviser_profiles ap ON u.id = ap.user_id
      WHERE u.id = ?
    `).get(req.user.id);

    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
