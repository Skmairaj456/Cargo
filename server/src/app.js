const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const driverRoutes = require("./routes/driverRoutes");
const pricingRoutes = require("./routes/pricingRoutes");
const { getAvailableSlots } = require("./controllers/bookingController");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "QuickCargo API" });
});

app.use("/auth", authRoutes);
// Public slot availability (mounted on app so it always matches before nested router quirks)
app.get("/bookings/slots", getAvailableSlots);
app.use("/bookings", bookingRoutes);
app.use("/drivers", driverRoutes);
app.use("/pricing", pricingRoutes);

app.use(errorMiddleware);

module.exports = app;
