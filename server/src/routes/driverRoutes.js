const express = require("express");
const {
  driverLogin,
  updateDriverRideStatus,
} = require("../controllers/driverController");
const driverAuthMiddleware = require("../middleware/driverAuthMiddleware");

const router = express.Router();

router.post("/login", driverLogin);
router.patch("/ride-status", driverAuthMiddleware, updateDriverRideStatus);

module.exports = router;
