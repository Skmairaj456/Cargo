const {
  PRICING_BY_CARGO_SIZE,
  OPTIONAL_SERVICES_COST,
  PRIORITY_FEE,
  BASE_FARE,
  VEHICLE_BY_CARGO_SIZE,
} = require("../config/constants");

const calculateFare = (distanceKm, cargoSize, helpers, fragile, priority) => {
  const perKmRate = PRICING_BY_CARGO_SIZE[cargoSize];
  if (!perKmRate) return null;

  let total = BASE_FARE + Number(distanceKm) * perKmRate;
  if (helpers) total += OPTIONAL_SERVICES_COST.helpers;
  if (fragile) total += OPTIONAL_SERVICES_COST.fragile;
  if (priority) total += PRIORITY_FEE;

  return {
    baseFare: BASE_FARE,
    distanceKm: Number(distanceKm),
    perKmRate,
    optionalCharges:
      (helpers ? OPTIONAL_SERVICES_COST.helpers : 0) +
      (fragile ? OPTIONAL_SERVICES_COST.fragile : 0),
    priorityFee: priority ? PRIORITY_FEE : 0,
    total: Number(total.toFixed(2)),
    vehicleType: VEHICLE_BY_CARGO_SIZE[cargoSize],
  };
};

const getPriceEstimate = async (req, res) => {
  const {
    distanceKm,
    cargoSize,
    helpers = false,
    fragile = false,
    priority = false,
  } = req.body;
  if (!distanceKm || !cargoSize) {
    return res.status(400).json({ message: "distanceKm and cargoSize are required" });
  }

  const fare = calculateFare(distanceKm, cargoSize, helpers, fragile, priority);
  if (!fare) {
    return res.status(400).json({ message: "Invalid cargo size" });
  }

  return res.json(fare);
};

module.exports = { getPriceEstimate, calculateFare };
