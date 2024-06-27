const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone_number: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    picture: { type: String, default: "logo.png" },
    shop_ref: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
    },
    role: {
      type: String,
      required: true,
      enum: ["Administrateur", "Utilisateur", "Commercant"],
      default: "Utilisateur",
    },
    actif: { type: Boolean },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
