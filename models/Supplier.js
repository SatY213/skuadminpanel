const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    first_name: { type: String },
    last_name: { type: String },
    address: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    shop_ref: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
  },
  { timestamps: true }
);

const Supplier = mongoose.model("Supplier", supplierSchema);

module.exports = Supplier;
