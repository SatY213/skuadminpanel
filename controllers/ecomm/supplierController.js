const Supplier = require("../../models/ecomm/supplier");

// Create a new supplier
exports.createSupplier = async (req, res) => {
  try {
    const supplier = new Supplier(req.body);
    const savedSupplier = await supplier.save();
    res.status(201).json(savedSupplier);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create the supplier." });
  }
};

// Update a supplier by ID
exports.updateSupplier = async (req, res) => {
  try {
    const supplierId = req.params.id;
    const updatedSupplier = await Supplier.findByIdAndUpdate(
      supplierId,
      req.body,
      {
        new: true,
      }
    );
    if (!updatedSupplier) {
      return res.status(404).json({ error: "Supplier not found." });
    }
    res.json(updatedSupplier);
  } catch (error) {
    res.status(500).json({ error: "Failed to update the supplier." });
  }
};

// Delete a supplier by ID
exports.deleteSupplier = async (req, res) => {
  try {
    const supplierId = req.params.id;
    const deletedSupplier = await Supplier.findByIdAndDelete(supplierId);
    if (!deletedSupplier) {
      return res.status(404).json({ error: "Supplier not found." });
    }
    res.json({ message: "Supplier deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete the supplier." });
  }
};

// Find a supplier by ID
exports.findSupplierById = async (req, res) => {
  try {
    const supplierId = req.params.id;
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ error: "Supplier not found." });
    }
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: "Failed to find the supplier." });
  }
};

// Find all suppliers with pagination and search
exports.findAllSuppliers = async (req, res) => {
  try {
    const perPage = parseInt(req.query.perPage) || 10;
    const page = parseInt(req.query.page) || 1;
    const searchQuery = req.query.q || "";

    const query = {};
    if (searchQuery) {
      query.firstname = { $regex: searchQuery, $options: "i" };
    }

    const totalCount = await Supplier.countDocuments(query);
    const totalPages = Math.ceil(totalCount / perPage);
    const suppliers = await Supplier.find(query)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    res.json({
      data: suppliers,
      totalItems: totalCount,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch suppliers." });
  }
};
