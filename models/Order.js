const mongoose = require("mongoose");
const ItemSchema = new mongoose.Schema(
  {
    product_ref: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    order_reference: {
      type: String,
      required: true,
    },
    user_ref: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shop_ref: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    items: {
      type: [ItemSchema],
      default: [],
    },
    total: {
      type: Number,
      required: true,
      default: 0,
    },
    recipient: {
      first_name: {
        type: String,
        required: true,
      },
      last_name: {
        type: String,
        required: true,
      },
      ville: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      phone_number: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
    order_status: {
      type: String,
      required: true,
      enum: ["En attente", "Expédié", "Retourné", "Livré", "Annulé"],
      default: "En attente",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
