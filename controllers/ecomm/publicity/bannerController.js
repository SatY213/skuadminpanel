const Banner = require("../../../models/ecomm/publicity/banner");

// Create a new banner
exports.createBanner = async (req, res) => {
  try {
    const banner = new Banner(req.body);
    const savedBanner = await banner.save();
    res.status(201).json(savedBanner);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create the banner." });
  }
};

// Update a banner by ID
exports.updateBanner = async (req, res) => {
  try {
    const bannerId = req.params.id;
    const updatedBanner = await Banner.findByIdAndUpdate(bannerId, req.body, {
      new: true,
    });
    if (!updatedBanner) {
      return res.status(404).json({ error: "Banner not found." });
    }
    res.json(updatedBanner);
  } catch (error) {
    res.status(500).json({ error: "Failed to update the banner." });
  }
};

// Delete a banner by ID
exports.deleteBanner = async (req, res) => {
  try {
    const bannerId = req.params.id;
    const deletedBanner = await Banner.findByIdAndDelete(bannerId);
    if (!deletedBanner) {
      return res.status(404).json({ error: "Banner not found." });
    }
    res.json({ message: "Banner deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete the banner." });
  }
};

// Find a banner by ID
exports.findBannerById = async (req, res) => {
  try {
    const bannerId = req.params.id;
    const banner = await Banner.findById(bannerId);
    if (!banner) {
      return res.status(404).json({ error: "Banner not found." });
    }
    res.json(banner);
  } catch (error) {
    res.status(500).json({ error: "Failed to find the banner." });
  }
};

// Find all banners with pagination and search
exports.findAllBanners = async (req, res) => {
  try {
    const perPage = parseInt(req.query.perPage) || 10;
    const page = parseInt(req.query.page) || 1;
    const searchQuery = req.query.q || "";

    const query = {};
    if (searchQuery) {
      query.name = { $regex: searchQuery, $options: "i" };
    }

    const totalCount = await Banner.countDocuments(query);
    const totalPages = Math.ceil(totalCount / perPage);
    const banners = await Banner.find(query)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    res.json({
      data: banners,
      totalItems: totalCount,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch banners." });
  }
};
