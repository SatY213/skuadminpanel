// roleMiddleware.js

const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.role != requiredRole) {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  };
};

module.exports = roleMiddleware;
