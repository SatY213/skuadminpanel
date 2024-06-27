const jwt = require("jsonwebtoken");
require("dotenv").config();
const BlacklistedToken = require("../models/BlacklistedToken");

const authenticate = async (req, res, next) => {
  // On prends le token du header "x-auth-token"
  const token = req.header("x-auth-token");

  // On vérifie si le token existe
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    // Check if the token is blacklisted
    const isBlacklisted = await BlacklistedToken.exists({ token });

    if (isBlacklisted) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // On le vérifie avec jwt.verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // On attache l'objet user à la requête
    req.user = decoded.user;
    req.shop_ref = decoded.shop_ref;
    req.role = decoded.role;

    // Pour avancer à la prochaine route
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

module.exports = authenticate;
