import db from './db';

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      mobile_number TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('FARMER','CONSUMER','COORDINATOR','ADMIN')),
      email TEXT,
      address TEXT,
      village TEXT,
      district TEXT,
      state TEXT,
      pincode TEXT,
      is_verified INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS farmer_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE REFERENCES users(id),
      farm_name TEXT,
      farm_type TEXT,
      bank_name TEXT,
      account_number TEXT,
      ifsc_code TEXT,
      account_holder_name TEXT
    );

    CREATE TABLE IF NOT EXISTS vegetables (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      image_url TEXT,
      current_price REAL NOT NULL,
      unit TEXT NOT NULL DEFAULT 'kg',
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS price_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vegetable_id INTEGER REFERENCES vegetables(id),
      old_price REAL,
      new_price REAL NOT NULL,
      changed_by INTEGER REFERENCES users(id),
      changed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS farmer_produce (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      farmer_id INTEGER REFERENCES users(id),
      vegetable_id INTEGER REFERENCES vegetables(id),
      available_quantity REAL NOT NULL,
      unit TEXT NOT NULL DEFAULT 'kg',
      farm_name TEXT,
      farm_location TEXT,
      village TEXT,
      district TEXT,
      state TEXT,
      pincode TEXT,
      status TEXT DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','INACTIVE','SOLDOUT')),
      listed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS produce_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      produce_id INTEGER REFERENCES farmer_produce(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS carts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      consumer_id INTEGER UNIQUE REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE,
      produce_id INTEGER REFERENCES farmer_produce(id),
      quantity REAL NOT NULL,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      consumer_id INTEGER REFERENCES users(id),
      coordinator_id INTEGER REFERENCES users(id),
      delivery_address TEXT,
      delivery_village TEXT,
      delivery_district TEXT,
      delivery_state TEXT,
      delivery_pincode TEXT,
      subtotal REAL NOT NULL,
      delivery_fee REAL DEFAULT 0,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'PLACED' CHECK(status IN ('PLACED','CONFIRMED','ASSIGNED','PICKUP','OUT_FOR_DELIVERY','DELIVERED','CANCELLED')),
      placed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
      produce_id INTEGER REFERENCES farmer_produce(id),
      farmer_id INTEGER REFERENCES users(id),
      vegetable_id INTEGER REFERENCES vegetables(id),
      vegetable_name TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      price_at_purchase REAL NOT NULL,
      subtotal REAL NOT NULL,
      farm_name TEXT,
      farmer_location TEXT
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'INFO',
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
