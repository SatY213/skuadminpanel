const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema(
  {
    shop_name: { type: String },
    banner: { type: String },
    logo: { type: String },
  },
  { timestamps: true }
);

const Shop = mongoose.model("Shop", shopSchema);

module.exports = Shop;
