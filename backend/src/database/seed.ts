import db, { initDb } from './db';
import { initializeDatabase } from './schema';
import bcryptjs from 'bcryptjs';

export async function seedDatabase() {
  await initDb();

  console.log('Initializing database schema...');
  initializeDatabase();

  console.log('Clearing existing data...');
  db.exec(`
    DELETE FROM notifications;
    DELETE FROM order_items;
    DELETE FROM orders;
    DELETE FROM cart_items;
    DELETE FROM carts;
    DELETE FROM produce_images;
    DELETE FROM price_history;
    DELETE FROM farmer_produce;
    DELETE FROM vegetables;
    DELETE FROM farmer_profiles;
    DELETE FROM users;
  `);

  console.log('Inserting users...');
  const hash = bcryptjs.hashSync('123456', 10);
  const insertUser = db.prepare(`
    INSERT INTO users (username, password_hash, role, full_name, mobile_number, email, address, village, district, state, pincode, is_verified)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const adminId = insertUser.run('admin', hash, 'ADMIN', 'System Admin', '9999999999', 'admin@farmdirect.hub', 'Hyderabad', 'Hyderabad', 'Hyderabad', 'Telangana', '500001', 1).lastInsertRowid;
  const farmer1Id = insertUser.run('farmer1', hash, 'FARMER', 'Ramesh Kumar', '9876543210', null, 'Chittoor Market Area', 'Chittoor', 'Chittoor', 'Andhra Pradesh', '517001', 1).lastInsertRowid;
  const farmer2Id = insertUser.run('farmer2', hash, 'FARMER', 'Suresh Reddy', '9876543211', null, 'Beach Road', 'Vizag', 'Visakhapatnam', 'Andhra Pradesh', '530001', 1).lastInsertRowid;
  const farmer3Id = insertUser.run('farmer3', hash, 'FARMER', 'Anita Devi', '9876543212', null, 'Main Road', 'Kakinada', 'East Godavari', 'Andhra Pradesh', '533001', 0).lastInsertRowid;
  
  const consumer1Id = insertUser.run('consumer1', hash, 'CONSUMER', 'Ravi Kumar', '9876543220', null, 'Gandhi Street', 'Pithapuram', 'East Godavari', 'Andhra Pradesh', '533450', 0).lastInsertRowid;
  insertUser.run('consumer2', hash, 'CONSUMER', 'Anita Sharma', '9876543221', null, 'Banjara Hills', 'Hyderabad', 'Hyderabad', 'Telangana', '500034', 0);
  insertUser.run('consumer3', hash, 'CONSUMER', 'Mahesh Reddy', '9876543222', null, 'MG Road', 'Vijayawada', 'Krishna', 'Andhra Pradesh', '520001', 0);
  insertUser.run('consumer4', hash, 'CONSUMER', 'Sneha Latha', '9876543223', null, 'Brodipet', 'Guntur', 'Guntur', 'Andhra Pradesh', '522002', 0);
  
  insertUser.run('coordinator1', hash, 'COORDINATOR', 'Vijay Singh', '9876543230', null, 'Railway Station Road', 'Tirupati', 'Chittoor', 'Andhra Pradesh', '517501', 1);

  console.log('Inserting farmer profiles...');
  const insertFarmerProfile = db.prepare(`
    INSERT INTO farmer_profiles (user_id, farm_name, farm_type, bank_name, account_number, ifsc_code, account_holder_name)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertFarmerProfile.run(farmer1Id, 'Sri Sai Farms', 'Mixed Farming', 'SBI', '12345678901234', 'SBIN0001234', 'Ramesh Kumar');
  insertFarmerProfile.run(farmer2Id, 'Fresh Fields', 'Organic', 'HDFC Bank', '98765432109876', 'HDFC0002345', 'Suresh Reddy');
  insertFarmerProfile.run(farmer3Id, 'Green Leaf Farms', 'Traditional', 'Bank of Baroda', '56789012345678', 'BARB0003456', 'Anita Devi');

  console.log('Inserting vegetables...');
  const insertVeg = db.prepare(`INSERT INTO vegetables (name, current_price, unit) VALUES (?, ?, ?)`);
  const tomatoesId = insertVeg.run('Tomatoes', 25, 'kg').lastInsertRowid;
  const ladiesFingerId = insertVeg.run('Ladies Finger', 30, 'kg').lastInsertRowid;
  const cucumbersId = insertVeg.run('Cucumbers', 20, 'kg').lastInsertRowid;
  const spinachId = insertVeg.run('Spinach', 15, 'bunch').lastInsertRowid;
  const bottleGourdId = insertVeg.run('Bottle Gourd', 18, 'kg').lastInsertRowid;
  const carrotsId = insertVeg.run('Carrots', 28, 'kg').lastInsertRowid;
  const brinjalId = insertVeg.run('Brinjal', 35, 'kg').lastInsertRowid;
  insertVeg.run('Potatoes', 30, 'kg');
  insertVeg.run('Onions', 35, 'kg');

  console.log('Inserting farmer produce...');
  const insertProduce = db.prepare(`
    INSERT INTO farmer_produce (farmer_id, vegetable_id, available_quantity, unit, farm_name, farm_location, village, district, state, pincode)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  insertProduce.run(farmer1Id, tomatoesId, 50, 'kg', 'Sri Sai Farms', 'Chittoor Market Area', 'Chittoor', 'Chittoor', 'Andhra Pradesh', '517001');
  insertProduce.run(farmer1Id, carrotsId, 30, 'kg', 'Sri Sai Farms', 'Chittoor Market Area', 'Chittoor', 'Chittoor', 'Andhra Pradesh', '517001');
  
  insertProduce.run(farmer2Id, cucumbersId, 40, 'kg', 'Fresh Fields', 'Beach Road', 'Vizag', 'Visakhapatnam', 'Andhra Pradesh', '530001');
  insertProduce.run(farmer2Id, spinachId, 25, 'bunch', 'Fresh Fields', 'Beach Road', 'Vizag', 'Visakhapatnam', 'Andhra Pradesh', '530001');
  
  insertProduce.run(farmer3Id, ladiesFingerId, 35, 'kg', 'Green Leaf Farms', 'Main Road', 'Kakinada', 'East Godavari', 'Andhra Pradesh', '533001');
  insertProduce.run(farmer3Id, brinjalId, 20, 'kg', 'Green Leaf Farms', 'Main Road', 'Kakinada', 'East Godavari', 'Andhra Pradesh', '533001');

  console.log('✅ Seed completed successfully!');
}

seedDatabase().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
