const crypto = require("crypto");
const { calculateFare } = require("./pricingController");
const {
  createPayment,
  getBookingsByUser,
  getPaymentsByUser,
  getBookedSlotCount,
  createBookingWithSlotAndDriver,
} = require("../models/bookingModel");
const {
  SLOT_CAPACITY_BY_SIZE,
  buildDailySlots,
  isValidSlotLabel,
} = require("../config/slots");

const parseScheduledTimestamp = (slotDate, slotLabel) => {
  const start = slotLabel.split("-")[0];
  return new Date(`${slotDate}T${start}:00.000Z`);
};

/** Reject past calendar dates (YYYY-MM-DD) for slot booking */
const isSlotDateValid = (slotDate) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(slotDate)) return false;
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  return slotDate >= todayStr;
};

const createNewBooking = async (req, res, next) => {
  try {
    const {
      pickup,
      drop,
      cargoSize,
      distanceKm,
      helpers = false,
      fragile = false,
      priority = false,
      slotDate,
      slotLabel,
    } = req.body;

    if (!pickup || !drop || !cargoSize || !distanceKm || !slotDate || !slotLabel) {
      return res.status(400).json({ message: "Missing booking fields" });
    }

    if (!isValidSlotLabel(slotLabel)) {
      return res.status(400).json({ message: "Invalid time slot" });
    }

    if (!isSlotDateValid(slotDate)) {
      return res.status(400).json({ message: "Booking date must be today or in the future" });
    }

    const fare = calculateFare(distanceKm, cargoSize, helpers, fragile, priority);
    if (!fare) {
      return res.status(400).json({ message: "Invalid cargo size" });
    }

    const slotCapacity = SLOT_CAPACITY_BY_SIZE[cargoSize] || 2;

    const bookingId = `QC-${crypto.randomUUID().split("-")[0].toUpperCase()}`;
    const bookingPayload = {
      id: bookingId,
      user_id: req.user.userId,
      pickup,
      drop_location: drop,
      cargo_size: cargoSize,
      slot_date: slotDate,
      slot_label: slotLabel,
      scheduled_at: parseScheduledTimestamp(slotDate, slotLabel),
      is_priority: priority,
      priority_fee: fare.priorityFee,
      distance_km: distanceKm,
      price: fare.total,
      needs_helpers: helpers,
      fragile_items: fragile,
      status: "accepted",
    };

    const result = await createBookingWithSlotAndDriver(
      bookingPayload,
      slotCapacity,
      fare.vehicleType
    );

    if (result.error === "slot_full") {
      return res.status(409).json({ message: "Selected slot is no longer available" });
    }
    if (result.error === "no_driver") {
      return res.status(409).json({ message: "No available drivers right now" });
    }

    const { booking, driver: assignedDriver } = result;

    const payment = await createPayment({
      bookingId,
      amount: fare.total,
      status: "pending",
    });

    return res.status(201).json({
      booking,
      driver: assignedDriver,
      payment,
      fareBreakdown: fare,
    });
  } catch (error) {
    return next(error);
  }
};

const getAvailableSlots = async (req, res, next) => {
  try {
    const { date, cargoSize } = req.query;
    if (!date || !cargoSize || !SLOT_CAPACITY_BY_SIZE[cargoSize]) {
      return res.status(400).json({ message: "date and valid cargoSize are required" });
    }

    const slotCapacity = SLOT_CAPACITY_BY_SIZE[cargoSize];
    const slots = buildDailySlots();
    const availability = [];

    for (const slotLabel of slots) {
      // eslint-disable-next-line no-await-in-loop
      const booked = await getBookedSlotCount({
        slotDate: date,
        slotLabel,
        cargoSize,
      });
      availability.push({
        slotLabel,
        capacity: slotCapacity,
        booked,
        available: Math.max(slotCapacity - booked, 0),
        isAvailable: booked < slotCapacity,
      });
    }

    return res.json({
      date,
      cargoSize,
      slots: availability,
    });
  } catch (error) {
    return next(error);
  }
};

const getUserDashboard = async (req, res, next) => {
  try {
    const bookings = await getBookingsByUser(req.user.userId);
    const payments = await getPaymentsByUser(req.user.userId);

    const activeBookings = bookings.filter((booking) =>
      ["accepted", "in_transit"].includes(booking.status)
    );
    const pastBookings = bookings.filter((booking) =>
      ["completed", "cancelled"].includes(booking.status)
    );

    return res.json({ activeBookings, pastBookings, payments });
  } catch (error) {
    return next(error);
  }
};

const getTrackingMock = async (req, res) => {
  const progress = Number(req.query.progress || 0);
  const nextProgress = Math.min(progress + 12, 100);

  return res.json({
    progress: nextProgress,
    driverPosition: {
      lat: 12.97 + nextProgress / 1000,
      lng: 77.59 + nextProgress / 1000,
    },
    etaMinutes: Math.max(2, Math.round((100 - nextProgress) / 8)),
    status: nextProgress >= 100 ? "arrived" : "in_transit",
  });
};

module.exports = {
  createNewBooking,
  getUserDashboard,
  getTrackingMock,
  getAvailableSlots,
};
