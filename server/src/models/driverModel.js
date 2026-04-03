const pool = require("../config/db");

const getOrCreateSeedDrivers = async () => {
  const existing = await pool.query("SELECT * FROM drivers");
  if (existing.rows.length > 0) {
    return existing.rows;
  }

  const sampleDrivers = [
    ["Arjun", "9000000001", "bike", "available"],
    ["Ravi", "9000000002", "pickup", "available"],
    ["Sahil", "9000000003", "mini truck", "available"],
    ["Kiran", "9000000004", "lorry", "available"],
  ];

  for (const driver of sampleDrivers) {
    // eslint-disable-next-line no-await-in-loop
    await pool.query(
      "INSERT INTO drivers(name, phone, vehicle_type, status) VALUES($1, $2, $3, $4)",
      driver
    );
  }

  const seeded = await pool.query("SELECT * FROM drivers");
  return seeded.rows;
};

const getAvailableDriverByVehicleType = async (vehicleType) => {
  const result = await pool.query(
    "SELECT * FROM drivers WHERE vehicle_type = $1 AND status = 'available' ORDER BY id ASC LIMIT 1",
    [vehicleType]
  );
  return result.rows[0];
};

const updateDriverStatus = async (driverId, status) => {
  const result = await pool.query(
    "UPDATE drivers SET status = $1 WHERE id = $2 RETURNING *",
    [status, driverId]
  );
  return result.rows[0];
};

const getDriverByPhone = async (phone) => {
  const result = await pool.query("SELECT * FROM drivers WHERE phone = $1", [phone]);
  return result.rows[0];
};

module.exports = {
  getOrCreateSeedDrivers,
  getAvailableDriverByVehicleType,
  updateDriverStatus,
  getDriverByPhone,
};
