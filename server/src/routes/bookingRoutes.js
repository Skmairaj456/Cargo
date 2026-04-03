const express = require("express");
const {
  createNewBooking,
  getUserDashboard,
  getTrackingMock,
} = require("../controllers/bookingController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createNewBooking);
router.get("/dashboard", authMiddleware, getUserDashboard);
router.get("/tracking", authMiddleware, getTrackingMock);

module.exports = router;
