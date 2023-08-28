const jwt = require("jsonwebtoken");
require("dotenv").config();
const BlacklistedToken = require("../models/BlacklistedToken");

const authenticate = async (req, res, next) => {
  // On prends le tooken du header "x-auth-token"
  const token = req.header("x-auth-token");

  // On vérifie si le token exists
  if (!token) {
    return res.status(401).json({ msg: "No token , authorization denied" });
  }

  try {
    // Check if the token is blacklisted
    const isBlacklisted = await BlacklistedToken.exists({ token });

    if (isBlacklisted) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // On le verifie avec jwt.token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // On attach l'objet user a la requete
    req.user = decoded.user;

    // pour avancer a la prochaine route
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

module.exports = authenticate;
