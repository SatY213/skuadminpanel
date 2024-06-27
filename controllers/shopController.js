const Shop = require("../models/Shop");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const Cart = require("../models/Cart");

exports.createShop = async (req, res) => {
  try {
    if (req.file) {
      console.log("File uploaded:", req.file);
      req.body.logo = `${req.file.filename}`;
    }

    const shop = new Shop(req.body);
    const savedShop = await shop.save();

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { shop_ref: savedShop._id },
      { new: true }
    );

    res
      .status(201)
      .json({ success: "Enregistrement réussi.", shop: savedShop });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Échec de la création du Magasin." });
  }
};

exports.updateShop = async (req, res) => {
  try {
    console.log("hey I am trying to update shops");
    const shopId = req.params.id;

    // Check if files were uploaded
    if (req.files) {
      if (req.files.logo) {
        console.log("Logo uploaded:", req.files.logo[0]);
        req.body.logo = `${req.files.logo[0].filename}`;
      }
      if (req.files.banner) {
        console.log("Banner uploaded:", req.files.banner[0]);
        req.body.banner = `${req.files.banner[0].filename}`;
      }
    }

    const updatedFields = {
      ...req.body,
    };

    const updatedShop = await Shop.findByIdAndUpdate(shopId, updatedFields, {
      new: true,
    });

    if (!updatedShop) {
      return res.status(404).json({ error: "Magasin non trouvé." });
    }

    res.status(201).json({ success: "Mise à jour réussie.", updatedShop });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Échec de la mise à jour." });
  }
};

exports.deleteShop = async (req, res) => {
  try {
    const shopId = req.params.id;
    const deletedShop = await Shop.findByIdAndDelete(shopId);

    if (!deletedShop) {
      return res.status(404).json({ error: "Magasin non trouvé." });
    }
    res.status(201).json({ success: "Magasin est supprimé." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Échec de la suppression du magasin." });
  }
};

exports.findShopById = async (req, res) => {
  try {
    const shopId = req.params.id;
    const shop = await Shop.findById(shopId);

    if (!shop) {
      return res.status(404).json({ error: "Magasin non trouvé." });
    }

    res.json(shop);
  } catch (error) {
    res.status(500).json({ error: "Échec de la récupération du magasin." });
  }
};

exports.findAllShops = async (req, res) => {
  try {
    const perPage = parseInt(req.query.perPage) || 12;
    const page = parseInt(req.query.page) || 1;
    const searchQuery = req.query.q || "";

    const query = {};
    if (searchQuery) {
      query.$or = [
        { name: { $regex: searchQuery, $options: "i" } },
        { abbreviation: { $regex: searchQuery, $options: "i" } },
      ];
    }

    const totalCount = await Shop.countDocuments(query);
    const totalPages = Math.ceil(totalCount / perPage);
    const shops = await Shop.find(query)
      .skip((page - 1) * perPage)
      .sort({ createdAt: -1 })
      .limit(perPage)
      .exec();

    res.json({
      data: shops,
      totalItems: totalCount,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: "Échec de la récupération des magasins." });
  }
};
