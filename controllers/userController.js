const User = require("../models/User");
const bcrypt = require("bcrypt");

const { validationResult } = require("express-validator");
const Cart = require("../models/Cart");

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }
    const { email } = req.body;
    let { password } = req.body;

    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);
    req.body.password = password;
    let user_exist = await User.findOne({ email });
    if (user_exist) {
      console.log("iam here");
      return res.status(400).json({ error: "User already exists" });
    }
    if (req.file) {
      console.log("File uploaded:", req.file);
      req.body.picture = `${req.file.filename}`;
    }
    const user = new User(req.body);
    console.log(req.body);
    const savedUser = await user.save();
    res.status(201).json({ success: "Enregistrement réussi." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Échec de la création de l'utilisateur." });
  }
};

// Update a user by ID
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }
    if (req.file) {
      console.log("File uploaded:", req.file);
      req.body.picture = `${req.file.filename}`;
    }
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      let password = req.body.password;
      password = await bcrypt.hash(password, salt);
      req.body.password = password;
    }
    if (req.body.new_password && req.body.old_password) {
      const user = await User.findById(userId).select("password").lean().exec();
      let old_password = req.body.old_password;

      const isPasswordMatch = await bcrypt.compare(old_password, user.password);
      if (!isPasswordMatch) {
        return res
          .status(600)
          .json({ error: "L'ancient mot de passe est incorrect." });
      }
      const salt = await bcrypt.genSalt(10);
      let password = req.body.new_password;
      password = await bcrypt.hash(password, salt);
      req.body.password = password;
      console.log(req.body.password);
    }

    const updatedFields = {
      ...req.body,
    };
    console.log("hey iam trying to update users", req.body);
    const updatedUser = await User.findByIdAndUpdate(userId, updatedFields, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    res.status(201).json({ success: "Mise à jour réussie." });
  } catch (error) {
    res.status(500).json({ error: "Échec de la mise à jour." });
  }
};

// Delete a user by ID
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }
    res.status(201).json({ success: "Utilisateur est supprimé" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Échec de la suppression de l'utilisateur" });
  }
};

exports.findUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Échec de la récupération de l'utilisateur" });
  }
};

// Find all users with pagination and search
exports.findAllUsers = async (req, res) => {
  try {
    const perPage = parseInt(req.query.perPage) || 8;
    const page = parseInt(req.query.page) || 1;
    const searchQuery = req.query.q || "";

    const query = {};
    if (searchQuery) {
      query.$or = [
        { first_name: { $regex: searchQuery, $options: "i" } },
        { last_name: { $regex: searchQuery, $options: "i" } },
      ];
    }

    const totalCount = await User.countDocuments(query);
    const totalPages = Math.ceil(totalCount / perPage);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    res.json({
      data: users,
      totalItems: totalCount,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Échec de la récupération des utilisateurs" });
  }
};

exports.findAllShopUsers = async (req, res) => {
  try {
    const perPage = parseInt(req.query.perPage) || 8;
    const page = parseInt(req.query.page) || 1;
    const searchQuery = req.query.q || "";

    const query = { shop_ref: req.shop_ref };
    if (searchQuery) {
      query.$or = [
        { first_name: { $regex: searchQuery, $options: "i" } },
        { last_name: { $regex: searchQuery, $options: "i" } },
      ];
    }

    const totalCount = await User.countDocuments(query);
    const totalPages = Math.ceil(totalCount / perPage);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    res.json({
      data: users,
      totalItems: totalCount,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Échec de la récupération des utilisateurs" + error });
  }
};
