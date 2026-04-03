const jwt = require("jsonwebtoken");
const { getDriverByPhone, updateDriverStatus } = require("../models/driverModel");
const { updateBookingStatus, getBookingById } = require("../models/bookingModel");

const driverLogin = async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: "Phone is required" });
    }

    const driver = await getDriverByPhone(phone);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    const token = jwt.sign(
      { driverId: driver.id, role: "driver" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    return res.json({ driver, token });
  } catch (error) {
    return next(error);
  }
};

const updateDriverRideStatus = async (req, res, next) => {
  try {
    const { bookingId, status } = req.body;
    const allowed = ["accepted", "rejected", "in_transit", "completed"];
    if (!bookingId || !status || !allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status update request" });
    }

    const existing = await getBookingById(bookingId);
    if (!existing) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (existing.driver_id !== req.driver.driverId) {
      return res.status(403).json({ message: "This booking is not assigned to you" });
    }

    const updatedBooking = await updateBookingStatus(bookingId, status);
    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (status === "completed" || status === "rejected") {
      await updateDriverStatus(updatedBooking.driver_id, "available");
    } else {
      await updateDriverStatus(updatedBooking.driver_id, "on_trip");
    }

    return res.json({ booking: updatedBooking });
  } catch (error) {
    return next(error);
  }
};

module.exports = { driverLogin, updateDriverRideStatus };
