const pool = require("../config/db");

const initDb = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(180) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS drivers (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      phone VARCHAR(20) UNIQUE NOT NULL,
      vehicle_type VARCHAR(40) NOT NULL,
      status VARCHAR(20) DEFAULT 'available'
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id VARCHAR(64) PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      driver_id INTEGER REFERENCES drivers(id),
      pickup TEXT NOT NULL,
      drop_location TEXT NOT NULL,
      cargo_size VARCHAR(20) NOT NULL,
      slot_date DATE,
      slot_label VARCHAR(20),
      scheduled_at TIMESTAMP,
      is_priority BOOLEAN DEFAULT false,
      priority_fee NUMERIC(10,2) DEFAULT 0,
      distance_km NUMERIC(10,2) NOT NULL,
      price NUMERIC(10,2) NOT NULL,
      needs_helpers BOOLEAN DEFAULT false,
      fragile_items BOOLEAN DEFAULT false,
      status VARCHAR(30) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      booking_id VARCHAR(64) REFERENCES bookings(id),
      amount NUMERIC(10,2) NOT NULL,
      status VARCHAR(30) DEFAULT 'pending'
    );
  `;

  await pool.query(query);
  await pool.query(
    "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS slot_date DATE"
  );
  await pool.query(
    "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS slot_label VARCHAR(20)"
  );
  await pool.query(
    "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP"
  );
  await pool.query(
    "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_priority BOOLEAN DEFAULT false"
  );
  await pool.query(
    "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS priority_fee NUMERIC(10,2) DEFAULT 0"
  );
};

module.exports = initDb;
