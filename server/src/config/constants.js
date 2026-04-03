const PRICING_BY_CARGO_SIZE = {
  Small: 10,
  Medium: 15,
  Large: 20,
  XL: 25,
};

const OPTIONAL_SERVICES_COST = {
  helpers: 200,
  fragile: 100,
};

const PRIORITY_FEE = 180;
const BASE_FARE = 120;

const VEHICLE_BY_CARGO_SIZE = {
  Small: "bike",
  Medium: "pickup",
  Large: "mini truck",
  XL: "lorry",
};

module.exports = {
  PRICING_BY_CARGO_SIZE,
  OPTIONAL_SERVICES_COST,
  PRIORITY_FEE,
  BASE_FARE,
  VEHICLE_BY_CARGO_SIZE,
};
