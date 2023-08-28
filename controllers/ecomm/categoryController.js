const Category = require("../../models/ecomm/category");

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const category = new Category(req.body);
    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create the category." });
  }
};

// Update a category by ID
exports.updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      req.body,
      {
        new: true,
      }
    );
    if (!updatedCategory) {
      return res.status(404).json({ error: "Category not found." });
    }
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ error: "Failed to update the category." });
  }
};

// Delete a category by ID
exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const deletedCategory = await Category.findByIdAndDelete(categoryId);
    if (!deletedCategory) {
      return res.status(404).json({ error: "Category not found." });
    }
    res.json({ message: "Category deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete the category." });
  }
};

// Find a category by ID
exports.findCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: "Category not found." });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: "Failed to find the category." });
  }
};

// Find all categories with pagination and search
exports.findAllCategories = async (req, res) => {
  try {
    const perPage = parseInt(req.query.perPage) || 10;
    const page = parseInt(req.query.page) || 1;
    const searchQuery = req.query.q || "";

    const query = {};
    if (searchQuery) {
      query.name = { $regex: searchQuery, $options: "i" };
    }

    const totalCount = await Category.countDocuments(query);
    const totalPages = Math.ceil(totalCount / perPage);
    const categories = await Category.find(query)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    res.json({
      data: categories,
      totalItems: totalCount,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories." });
  }
};
