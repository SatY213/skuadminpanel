const UserProfile = require("../models/UserProfile");
const User = require("../models/User");

// Create a new profile
exports.createProfile = async (data, res) => {
  try {
    const profile = await UserProfile.create(data);
  } catch (error) {
    console.log(error); // to edit
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const userProfile = await UserProfile.findOne({ user: req.params.id });
    if (!userProfile) {
      return res.status(404).json({ error: "User profile not found" });
    }
    res.json(userProfile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get the user profile." });
  }
};

exports.getUserProfileByUsername = async (req, res) => {
  try {
    const username = req.params.username; // Retrieve the username from the URL parameters

    // Find the user based on the username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch the user's products based on their ID
    const userProfile = await UserProfile.find({ user: user._id });
    res.json(userProfile);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

exports.uploadProfilePicture = async (req, res) => {
  try {
    // Check if req.file exists and contains the uploaded file
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const userProfile = await UserProfile.findOne({ user: req.user.id });

    // Check if the user profile exists
    if (!userProfile) {
      return res.status(404).json({ error: "User profile not found" });
    }

    // Update the profile picture field
    userProfile.profilePicture = req.file.path;
    const updatedProfile = await userProfile.save();

    res.json(updatedProfile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to upload profile picture." });
  }
};

exports.uploadCoverPhoto = async (req, res) => {
  try {
    // Check if req.file exists and contains the uploaded file
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const userProfile = await UserProfile.findOne({ user: req.user.id });

    // Check if the user profile exists
    if (!userProfile) {
      return res.status(404).json({ error: "User profile not found" });
    }

    // Update the cover photo field
    userProfile.coverPhoto = req.file.path;
    const updatedProfile = await userProfile.save();

    res.json(updatedProfile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to upload cover photo." });
  }
};
