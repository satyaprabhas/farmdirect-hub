import db from './db';

export const DEFAULT_VEGETABLES = [
  { name: 'Tomatoes', price: 25, unit: 'kg' },
  { name: 'Ladies Finger', price: 30, unit: 'kg' },
  { name: 'Cucumbers', price: 20, unit: 'kg' },
  { name: 'Spinach', price: 15, unit: 'bunch' },
  { name: 'Bottle Gourd', price: 18, unit: 'kg' },
  { name: 'Carrots', price: 28, unit: 'kg' },
  { name: 'Brinjal', price: 35, unit: 'kg' },
  { name: 'Ridge Gourd', price: 40, unit: 'kg' },
  { name: 'Bitter Gourd', price: 45, unit: 'kg' },
  { name: 'Tindora', price: 35, unit: 'kg' },
  { name: 'Cauliflower', price: 30, unit: 'kg' },
  { name: 'Beans', price: 50, unit: 'kg' },
  { name: 'Drumstick', price: 60, unit: 'kg' },
  { name: 'Potatoes', price: 30, unit: 'kg' },
  { name: 'Onions', price: 35, unit: 'kg' },
];

export function ensureVegetablesAndStock() {
  try {
    console.log('🔄 Ensuring vegetables catalog and active stock...');

    // 1. Ensure a verified farmer exists to assign produce to
    let farmer: any = db.prepare("SELECT id, village, district, state, pincode FROM users WHERE role = 'FARMER' AND is_verified = 1 LIMIT 1").get();
    if (!farmer) {
      farmer = db.prepare("SELECT id, village, district, state, pincode FROM users WHERE role = 'FARMER' LIMIT 1").get();
    }
    const farmerId = farmer?.id || 20;
    const farmLocation = farmer?.village || 'Chittoor';
    const district = farmer?.district || 'Chittoor';
    const state = farmer?.state || 'Andhra Pradesh';
    const pincode = farmer?.pincode || '517001';

    // 2. Ensure all default vegetables exist
    for (const veg of DEFAULT_VEGETABLES) {
      const existing: any = db.prepare("SELECT id FROM vegetables WHERE name = ?").get(veg.name);
      let vegId: number;

      if (!existing) {
        const info = db.prepare("INSERT INTO vegetables (name, current_price, unit, is_active) VALUES (?, ?, ?, 1)").run(veg.name, veg.price, veg.unit);
        vegId = info.lastInsertRowid;
        console.log(`  ➕ Added missing vegetable: ${veg.name} (ID: ${vegId})`);
      } else {
        vegId = existing.id;
        db.prepare("UPDATE vegetables SET is_active = 1 WHERE id = ?").run(vegId);
      }

      // 3. Ensure this vegetable has at least one active produce listing with available stock > 0
      const activeProduce: any = db.prepare(`
        SELECT id, available_quantity FROM farmer_produce 
        WHERE vegetable_id = ? AND status = 'ACTIVE' AND available_quantity > 0
        LIMIT 1
      `).get(vegId);

      if (!activeProduce) {
        const existingRow: any = db.prepare("SELECT id FROM farmer_produce WHERE vegetable_id = ? LIMIT 1").get(vegId);
        if (existingRow) {
          db.prepare(`
            UPDATE farmer_produce 
            SET available_quantity = 50, status = 'ACTIVE', updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
          `).run(existingRow.id);
          console.log(`  🌾 Replenished stock for: ${veg.name} (50 kg active)`);
        } else {
          db.prepare(`
            INSERT INTO farmer_produce (farmer_id, vegetable_id, available_quantity, unit, farm_name, farm_location, village, district, state, pincode, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
          `).run(farmerId, vegId, 50, veg.unit, 'Sri Sai Organic Farm', farmLocation, farmLocation, district, state, pincode);
          console.log(`  🌾 Listed new stock for: ${veg.name} (50 kg active)`);
        }
      }
    }

    const count: any = db.prepare("SELECT COUNT(*) as c FROM farmer_produce WHERE status = 'ACTIVE' AND available_quantity > 0").get();
    console.log(`✅ All vegetables checked. Total active produce listings: ${count.c}`);
  } catch (err) {
    console.error('⚠️ Error ensuring vegetables and stock:', err);
  }
}
