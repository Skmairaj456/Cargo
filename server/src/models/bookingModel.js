const pool = require("../config/db");

/**
 * Single transaction: advisory lock per slot+cargo, capacity check,
 * driver row lock (SKIP LOCKED), status update, booking insert.
 * Prevents double-booking the last slot and concurrent driver assignment.
 */
const createBookingWithSlotAndDriver = async (booking, slotCapacity, vehicleType) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const lockKey = `${booking.slot_date}:${booking.slot_label}:${booking.cargo_size}`;
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [lockKey]);

    const slotCountResult = await client.query(
      `SELECT COUNT(*)::int AS count
       FROM bookings
       WHERE slot_date = $1
         AND slot_label = $2
         AND cargo_size = $3
         AND status IN ('pending', 'accepted', 'in_transit')`,
      [booking.slot_date, booking.slot_label, booking.cargo_size]
    );

    if (slotCountResult.rows[0].count >= slotCapacity) {
      await client.query("ROLLBACK");
      return { error: "slot_full" };
    }

    const driverResult = await client.query(
      `SELECT * FROM drivers
       WHERE vehicle_type = $1 AND status = 'available'
       ORDER BY id ASC
       LIMIT 1
       FOR UPDATE SKIP LOCKED`,
      [vehicleType]
    );
    const driver = driverResult.rows[0];
    if (!driver) {
      await client.query("ROLLBACK");
      return { error: "no_driver" };
    }

    await client.query("UPDATE drivers SET status = 'on_trip' WHERE id = $1", [driver.id]);

    const insertResult = await client.query(
      `INSERT INTO bookings(
        id, user_id, driver_id, pickup, drop_location, cargo_size, slot_date, slot_label, scheduled_at,
        is_priority, priority_fee, distance_km, price, needs_helpers, fragile_items, status
      ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
      [
        booking.id,
        booking.user_id,
        driver.id,
        booking.pickup,
        booking.drop_location,
        booking.cargo_size,
        booking.slot_date,
        booking.slot_label,
        booking.scheduled_at,
        booking.is_priority,
        booking.priority_fee,
        booking.distance_km,
        booking.price,
        booking.needs_helpers,
        booking.fragile_items,
        booking.status,
      ]
    );

    await client.query("COMMIT");
    return { booking: insertResult.rows[0], driver };
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackErr) {
      /* ignore */
    }
    throw error;
  } finally {
    client.release();
  }
};

const createPayment = async ({ bookingId, amount, status }) => {
  const result = await pool.query(
    "INSERT INTO payments(booking_id, amount, status) VALUES($1, $2, $3) RETURNING *",
    [bookingId, amount, status]
  );
  return result.rows[0];
};

const getBookingsByUser = async (userId) => {
  const result = await pool.query(
    `SELECT b.*, d.name AS driver_name, d.phone AS driver_phone, d.vehicle_type
     FROM bookings b
     LEFT JOIN drivers d ON b.driver_id = d.id
     WHERE b.user_id = $1
     ORDER BY b.created_at DESC`,
    [userId]
  );
  return result.rows;
};

const getBookedSlotCount = async ({ slotDate, slotLabel, cargoSize }) => {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM bookings
     WHERE slot_date = $1
       AND slot_label = $2
       AND cargo_size = $3
       AND status IN ('pending', 'accepted', 'in_transit')`,
    [slotDate, slotLabel, cargoSize]
  );
  return result.rows[0].count;
};

const getPaymentsByUser = async (userId) => {
  const result = await pool.query(
    `SELECT p.*, b.id AS booking_id_ref, b.created_at AS booking_time
     FROM payments p
     JOIN bookings b ON b.id = p.booking_id
     WHERE b.user_id = $1
     ORDER BY p.id DESC`,
    [userId]
  );
  return result.rows;
};

const getBookingById = async (bookingId) => {
  const result = await pool.query("SELECT * FROM bookings WHERE id = $1", [bookingId]);
  return result.rows[0];
};

const updateBookingStatus = async (bookingId, status) => {
  const result = await pool.query(
    "UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *",
    [status, bookingId]
  );
  return result.rows[0];
};

module.exports = {
  createBookingWithSlotAndDriver,
  createPayment,
  getBookingsByUser,
  getPaymentsByUser,
  getBookedSlotCount,
  getBookingById,
  updateBookingStatus,
};
