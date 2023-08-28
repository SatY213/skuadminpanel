const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: "Client", default: null }, // Use null as default instead of empty string
  products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  deliveryStatus: {
    type: String,
    enum: ["Processing", "Shipped", "Delivered"],
    default: "Processing",
  },
  orderState: {
    type: String,
    enum: ["Accepted", "Rejected", "Pending"], // Add a "Pending" state for orders awaiting approval
    default: "Pending", // Set a default state for orders awaiting approval
  },
  supplierState: {
    type: String,
    enum: ["Accepted", "Rejected", "Pending"], // Add a "Pending" state for supplier response
    default: "Pending", // Set a default state for supplier response
  },
});

const Order = mongoose.model("Order", orderSchema); // Fix the model name from order to Order
module.exports = Order;
