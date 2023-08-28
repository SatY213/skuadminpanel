// On importe le module mongoose
const mongoose = require("mongoose");

//On Crée le Schema de l'utilisateur
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  money: { type: Number },
  transactions: [
    {
      date: { type: Date, default: Date.now },
      transactionQuantity: Number,
    },
  ],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
