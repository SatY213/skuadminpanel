const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
      default: "logo.png",
    },
    show: { type: Boolean, default: true },
    collection_ref: { type: mongoose.Schema.Types.ObjectId, ref: "Collection" },
    sub_collection: { type: mongoose.Schema.Types.ObjectId },
    supplier_ref: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
    shop_ref: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },

    bought_price: {
      type: String,
      required: true,
    },
    sell_price: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    sku: {
      type: String,
      required: false,
    },
    weight: {
      type: String,
      required: false,
    },
    quantity: {
      type: String,
      default: "",
    },

    dimensions: {
      width: {
        type: String,
        default: "",
      },
      height: {
        type: String,
        default: "",
      },
      length: {
        type: String,
        default: "",
      },
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
