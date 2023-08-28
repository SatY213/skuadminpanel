const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema({
  profilePicture: { type: String, default: "/default-profile-picture.jpg" },
  coverPhoto: { type: String, default: "/default-cover-photo.jpg" },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true, // Enforce unique constraint on the user field
  },
});

const userProfile = mongoose.model("UserProfile", userProfileSchema);

module.exports = userProfile;
