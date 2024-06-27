const Order = require("../models/Order");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const { v4: uuidv4 } = require("uuid");
const ObjectId = mongoose.Types.ObjectId;
exports.createOrder = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("shop_ref");
    if (user.shop_ref == req.shop_ref && req.role == "Commercant") {
      req.body.order_reference = uuidv4().substring(0, 7);
      req.body.shop_ref = req.shop_ref;
      const order = new Order(req.body);
      const savedOrder = await order.save();
      res.status(201).json({ success: "Enregistrement réussi." });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Échec de la création de la commande" });
  }
};

exports.updateOrder = async (req, res) => {
  try {
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
      const updatedOrder = await Order.findByIdAndUpdate(
        productId,
        updatedFields,
        {
          new: true,
        }
      );

      if (!updatedOrder) {
        return res.status(404).json({ error: "Commande non trouvé." });
      }

      res.status(201).json({ success: "Mise à jour réussie." });
    } else {
      res.status(550).json({ error: "You are not allowed !" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Échec de la mise à jour." });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const productId = req.params.id;
    if (req.file) {
      console.log("File uploaded:", req.file);
      req.body.picture = `${req.file.filename}`;
    }
    const user = await User.findById(req.user.id).select("shop_ref");
    req.body.shop_ref = req.shop_ref;
    req.body.order_status = "Annulé";

    const updatedOrder = await Order.findByIdAndUpdate(
      productId,
      {
        $unset: { user_ref: 1 }, // Remove the 'user_ref' field
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Commande non trouvé." });
    }

    res.status(201).json({ success: "Mise à jour réussie." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Échec de la mise à jour." });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const user = await User.findById(req.user.id).select("shop_ref");
    if (user.shop_ref == req.shop_ref) {
      const deletedOrder = await Order.findByIdAndDelete(orderId);

      if (!deletedOrder) {
        return res.status(404).json({ error: "Commande non trouvé." });
      }
      res.status(201).json({ success: "Commande est supprimé" });
    } else {
      res.status(550).json({ error: "You are not allowed !" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Échec de la suppression de la commande" });
  }
};

exports.findOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const user = await User.findById(req.user.id).select("shop_ref");
    if (user.shop_ref == req.shop_ref && req.role == "Commercant") {
      const order = await Order.findById(orderId)
        .populate({
          path: "items.product_ref",
          select: "sell_price title description picture",
        })
        .exec();
      if (!order) {
        return res.status(404).json({ error: "Commande non trouvé." });
      }
      res.json(order);
    } else {
      res.status(550).json({ error: "You are not allowed !" });
    }
  } catch (error) {
    res.status(500).json({ error: "Échec de la récupération du produit" });
  }
};

exports.findAllShopOrders = async (req, res) => {
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
      const totalCount = await Order.countDocuments(query);
      const totalPages = Math.ceil(totalCount / perPage);
      const orders = await Order.find(query)
        .skip((page - 1) * perPage)
        .sort({ createdAt: -1 })
        .limit(perPage)
        .exec();

      res.json({
        data: orders,
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
      .json({ error: "Échec de la récupération des commandes" + error });
  }
};
exports.findAllUserOrders = async (req, res) => {
  try {
    const perPage = parseInt(req.query.perPage) || 12;
    const page = parseInt(req.query.page) || 1;
    const searchQuery = req.query.q || "";

    if (searchQuery) {
      query.$or = [{ title: { $regex: searchQuery, $options: "i" } }];
    }
    const user = await User.findById(req.user.id).select("shop_ref");
    const query = { shop_ref: req.shop_ref, user_ref: req.user.id };

    if (user.shop_ref == req.shop_ref) {
      const totalCount = await Order.countDocuments(query);
      const totalPages = Math.ceil(totalCount / perPage);
      const orders = await Order.find(query)
        .skip((page - 1) * perPage)
        .sort({ createdAt: -1 })
        .limit(perPage)
        .exec();

      res.json({
        data: orders,
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
      .json({ error: "Échec de la récupération des commandes" + error });
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
