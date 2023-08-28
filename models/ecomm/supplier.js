const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const supplierSchema = new Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  address: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
});

const Supplier = mongoose.model("Supplier", supplierSchema);
module.exports = Supplier;
