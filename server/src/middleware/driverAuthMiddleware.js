const jwt = require("jsonwebtoken");

const driverAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== "driver" || !payload.driverId) {
      return res.status(403).json({ message: "Driver access only" });
    }
    req.driver = { driverId: payload.driverId };
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = driverAuthMiddleware;
