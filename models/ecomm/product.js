const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  bought_price: { type: Number },
  sell_price: { type: Number },
  totalSoldQuantity: { type: Number },
  soldDates: [
    {
      date: { type: Date, default: Date.now },
      soldQuantity: Number,
      client: { type: Schema.Types.ObjectId, ref: "Client" }, // Reference to the Client model
    },
  ],
  returnDates: [
    {
      date: { type: Date, default: Date.now },
      returnedQuantity: Number,
      client: { type: Schema.Types.ObjectId, ref: "Client" }, // Reference to the Client model
    },
  ],
  category: { type: Schema.Types.ObjectId, ref: "Category" },
  color: { type: String },
  quantity: { type: Number },
  barcode: { type: String },
  pictures: [String],
  supplier: { type: Schema.Types.ObjectId, ref: "Supplier" },
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
