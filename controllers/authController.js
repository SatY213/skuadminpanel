const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const BlacklistedToken = require("../models/BlacklistedToken");
const { createCart, findLastCart } = require("./cartController");
const Cart = require("../models/Cart");
// Authentication Registration Controllers

exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

exports.registerCommercant = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  // Destructure the validated inputs
  const { first_name, last_name, email, password, phone_number } = req.body;

  try {
    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "Utilisateur déja exist." });
    }

    user = new User({
      first_name,
      last_name,
      email,
      password,
      phone_number,
      role: "Commercant",
    });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save the user
    await user.save();

    // Generate a JWT
    const payload = {
      user: {
        id: user.id,
      },
      role: user.role,
      shop_ref: null,
    };

    let data = {
      user: user.id,
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

exports.registerClient = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  // Destructure the validated inputs
  const { first_name, last_name, email, password, shop_ref } = req.body;

  try {
    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "Utilisateur déja exist." });
    }

    user = new User({
      first_name,
      last_name,
      email,
      password,
      role: "Utilisateur",
      shop_ref,
    });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save the user
    await user.save();
    const cart = new Cart({ user_ref: user._id, shop_ref: user.shop_ref });

    const savedCart = await cart.save();
    // Generate a JWT
    const payload = {
      user: {
        id: user.id,
      },
      role: user.role,
      shop_ref: shop_ref,
      cart_ref: cart._id,
    };

    let data = {
      user: user.id,
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

// Authentication Controller Login

exports.loginClient = async (req, res) => {
  // Validate the inputs
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  // Destructure the validated inputs
  const { email, password, shop_ref } = req.body;

  try {
    // Check if the user exists
    let user = await User.findOne({ email, shop_ref });
    if (!user) {
      return res
        .status(400)
        .json({ error: "les informations d'identification invalides" });
    }

    // Validate the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ error: "les informations d'identification invalides" });
    }

    // Generate a JWT
    const payload = {
      user: {
        id: user.id,
      },

      shop_ref: user.shop_ref,
      role: user.role,
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "7h" },
      async (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};
exports.login = async (req, res) => {
  // Validate the inputs
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  // Destructure the validated inputs
  const { email, password } = req.body;

  try {
    // Check if the user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ error: "les informations d'identification invalides" });
    }

    // Validate the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ error: "les informations d'identification invalides" });
    }

    // Generate a JWT
    const payload = {
      user: {
        id: user.id,
      },

      shop_ref: user.shop_ref,
      role: user.role,
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "7h" },
      async (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

exports.logout = async (req, res) => {
  // Get the current token from the request headers
  const token = req.header("x-auth-token");

  // Create a new blacklisted token instance
  const blacklistedToken = new BlacklistedToken({
    token,
    expiresAt: new Date(), // Set an appropriate expiration time
  });

  try {
    // Save the blacklisted token in the database
    await blacklistedToken.save();
    res.json({ message: "Déconnexion réussie." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.tokenRefresh = async (req, res) => {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ error: "Token is required" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user information
    const user_info = await User.findOne({ _id: decoded.user.id }).select(
      "shop_ref role"
    );

    if (!user_info) {
      return res.status(404).json({ error: "User not found" });
    }

    const payload = {
      user: {
        id: decoded.user.id,
      },
      shop_ref: user_info.shop_ref,
      role: user_info.role,
    };

    // Sign a new token with the new payload
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "7h" },
      (err, newToken) => {
        if (err) throw err;
        res.json({ token: newToken });
      }
    );
  } catch (error) {
    console.error(error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }

    res.status(500).json({ error: "Server Error" });
  }
};
