const express = require("express");
const { getPriceEstimate } = require("../controllers/pricingController");

const router = express.Router();

router.post("/estimate", getPriceEstimate);

module.exports = router;
