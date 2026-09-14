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

// Ensure only vegetable catalog definitions exist (so farmers have crops to choose from when adding produce)
// DO NOT automatically create farmer produce stock - only show what the farmer actually lists!
export function ensureVegetablesAndStock() {
  try {
    for (const veg of DEFAULT_VEGETABLES) {
      const existing: any = db.prepare("SELECT id FROM vegetables WHERE name = ?").get(veg.name);
      if (!existing) {
        db.prepare("INSERT INTO vegetables (name, current_price, unit, is_active) VALUES (?, ?, ?, 1)").run(veg.name, veg.price, veg.unit);
      } else {
        db.prepare("UPDATE vegetables SET is_active = 1 WHERE id = ?").run(existing.id);
      }
    }
  } catch (err) {
    console.error('Error ensuring vegetable catalog:', err);
  }
}
