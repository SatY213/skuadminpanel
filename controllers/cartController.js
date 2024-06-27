const Cart = require("../models/Cart");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const Order = require("../models/Order");
const { v4: uuidv4 } = require("uuid");

exports.createCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("shop_ref");
    if (user.shop_ref == req.shop_ref) {
      const cart = new Cart(req.body);

      const savedCart = await cart.save();
      res.status(201).json({ success: "Enregistrement réussi." });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Échec de la création du cart." });
  }
};

exports.updateCart = async (req, res) => {
  try {
    const cartId = req.params.id;
    const { action, productId, quantity } = req.body;
    console.log(req.body);

    // Fetch user information
    const user = await User.findById(req.user.id).select("shop_ref");

    // Check if the user is authorized to update this cart
    if (user.shop_ref.toString() !== req.shop_ref.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    let updatedCart;

    // Perform action based on request
    switch (action) {
      case "add":
        updatedCart = await Cart.findByIdAndUpdate(
          cartId,
          { $push: { items: { product_ref: productId, quantity: quantity } } },
          { new: true }
        ).populate("items.product_ref");
        break;
      case "remove":
        updatedCart = await Cart.findByIdAndUpdate(
          cartId,
          { $pull: { items: { product_ref: productId } } },
          { new: true }
        ).populate("items.product_ref");
        break;
      case "updateQuantity":
        updatedCart = await Cart.findOneAndUpdate(
          { _id: cartId, "items.product_ref": productId },
          { $set: { "items.$.quantity": quantity } },
          { new: true }
        ).populate("items.product_ref");
        break;
      default:
        return res.status(400).json({ error: "Invalid action" });
    }

    if (!updatedCart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // Calculate total price
    updatedCart.total = (updatedCart.items || []).reduce((acc, item) => {
      if (!item.product_ref.sell_price || isNaN(item.product_ref.sell_price)) {
        throw new Error(
          `Product with ID ${item.product_ref._id} has an invalid price.`
        );
      }
      return acc + item.quantity * item.product_ref.sell_price;
    }, 0);

    await updatedCart.save();

    res
      .status(200)
      .json({ success: "Cart updated successfully", data: updatedCart });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ error: "Failed to update cart" });
  }
};

exports.findLastCart = async (req, res) => {
  try {
    const shopId = req.params.id;

    const lastCart = await Cart.findOne({
      shop_ref: shopId,
      user_ref: req.user.id,
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "items.product_ref",
        select: "sell_price title description picture",
      })
      .exec();
    if (!lastCart) {
      return res
        .status(404)
        .json({ error: "Il y a eu un probleme Contactez Nous" });
    }
    console.log("this is cart ", lastCart);
    res.json(lastCart);
  } catch (error) {
    res.status(500).json({ error: "Échec de la récupération du Panier" });
  }
};
exports.placeOrder = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("shop_ref");
    if (user.shop_ref == req.shop_ref) {
      req.body.shop_ref = req.shop_ref;
      req.body.order_reference = uuidv4().substring(0, 7);
      if (req.body.items == []) {
        return res.status(404).json({ error: "Veuillez ajoutez des produits" });
      }
      const order = new Order(req.body);
      const savedOrder = await order.save();
      const cart = new Cart({
        user_ref: user._id,
        shop_ref: req.shop_ref,
      });
      const savedCart = new Cart({
        user_ref: user._id,
        shop_ref: req.shop_ref,
      });
      await cart.save();
      res.status(201).json({ success: "Enregistrement réussi." });
    }
  } catch (error) {
    res.status(500).json({ error: "Échec de la création de la commande" });
  }
};
