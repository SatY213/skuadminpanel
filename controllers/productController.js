const Product = require("../models/Product");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
exports.createProduct = async (req, res) => {
  try {
    if (req.file) {
      console.log("File uploaded:", req.file);
      req.body.picture = `${req.file.filename}`;
    }
    const user = await User.findById(req.user.id).select("shop_ref");
    if (user.shop_ref == req.shop_ref && req.role == "Commercant") {
      req.body.shop_ref = req.shop_ref;
      const product = new Product(req.body);
      const savedProduct = await product.save();
      res.status(201).json({ success: "Enregistrement réussi." });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Échec de la création de produit." });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    console.log("hey iam trying to update products");
    const productId = req.params.id;
    if (req.file) {
      console.log("File uploaded:", req.file);
      req.body.picture = `${req.file.filename}`;
    }
    const user = await User.findById(req.user.id).select("shop_ref");
    if (user.shop_ref == req.shop_ref && req.role == "Commercant") {
      req.body.shop_ref = req.shop_ref;
      const updatedFields = {
        ...req.body,
      };
      console.log(updatedFields);
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        updatedFields,
        {
          new: true,
        }
      );

      if (!updatedProduct) {
        return res.status(404).json({ error: "Produit non trouvé." });
      }

      res.status(201).json({ success: "Mise à jour réussie." });
    } else {
      res.status(550).json({ error: "You are not allowed !" });
    }
  } catch (error) {
    res.status(500).json({ error: "Échec de la mise à jour." });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const user = await User.findById(req.user.id).select("shop_ref");
    if (user.shop_ref == req.shop_ref && req.role == "Commercant") {
      const deletedProduct = await Product.findByIdAndDelete(productId);

      if (!deletedProduct) {
        return res.status(404).json({ error: "Produit non trouvé." });
      }
      res.status(201).json({ success: "Produit est supprimé" });
    } else {
      res.status(550).json({ error: "You are not allowed !" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Échec de la suppression du produit" });
  }
};

exports.findProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const user = await User.findById(req.user.id).select("shop_ref");
    if (user.shop_ref == req.shop_ref && req.role == "Commercant") {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: "Produit non trouvé." });
      }
      res.json(product);
    } else {
      res.status(550).json({ error: "You are not allowed !" });
    }
  } catch (error) {
    res.status(500).json({ error: "Échec de la récupération du produit" });
  }
};

exports.findAllShopProducts = async (req, res) => {
  try {
    const perPage = parseInt(req.query.perPage) || 12;
    const page = parseInt(req.query.page) || 1;
    const searchQuery = req.query.q || "";

    const query = { shop_ref: req.shop_ref };
    if (searchQuery) {
      query.$or = [{ title: { $regex: searchQuery, $options: "i" } }];
    }
    const user = await User.findById(req.user.id).select("shop_ref");
    if (user.shop_ref == req.shop_ref && req.role == "Commercant") {
      const totalCount = await Product.countDocuments(query);
      const totalPages = Math.ceil(totalCount / perPage);
      const products = await Product.find(query)
        .skip((page - 1) * perPage)
        .sort({ createdAt: -1 })
        .limit(perPage)
        .exec();

      res.json({
        data: products,
        totalItems: totalCount,
        totalPages: totalPages,
        currentPage: page,
      });
    } else {
      res.status(550).json({ error: "You are not allowed !" });
    }
  } catch (error) {
    console.error(error);

    res
      .status(500)
      .json({ error: "Échec de la récupération des produits" + error });
  }
};

exports.findAllViewProducts = async (req, res) => {
  try {
    const perPage = parseInt(req.query.perPage) || 12;
    const page = parseInt(req.query.page) || 1;
    const searchQuery = req.query.q || "";
    const CollectionQuery = req.query.collection || "";
    const shopId = req.params.id;
    const query = {
      shop_ref: shopId,
      $or: [
        { title: { $regex: searchQuery, $options: "i" } },
        // Add more conditions here if needed
      ],
    };
    if (CollectionQuery != "") {
      query.collection_ref = new ObjectId(CollectionQuery);
    }
    const totalCount = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalCount / perPage);
    const products = await Product.find(query)
      .select("title sell_price picture")
      .skip((page - 1) * perPage)
      .sort({ createdAt: -1 })
      .limit(perPage)
      .exec();

    res.json({
      data: products,
      totalItems: totalCount,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: "Échec de la récupération des produits" });
    console.log(error);
  }
};

exports.findProductByIdReduced = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId).select(
      "title description sell_price picture"
    );
    if (!product) {
      return res.status(404).json({ error: "Produit non trouvé." });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Échec de la récupération du produit" });
  }
};
