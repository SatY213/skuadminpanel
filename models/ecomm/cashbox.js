const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cashboxSchema = new Schema({
  money: { type: number },
  transactions: [
    {
      date: { type: Date, default: Date.now },
      transactionQuantity: Number,
    },
  ], // email: {type: String}
});

const Cashbox = mongoose.model("Cashbox", cashboxSchema);
module.exports = Cashbox;
