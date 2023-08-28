const Product = require("../../models/ecomm/product");
const mongoose = require("mongoose");

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);

    // Check if files were uploaded
    if (req.files && req.files.length > 0) {
      // Assuming you want to store the uploaded picture filenames in the 'pictures' field
      product.pictures = req.files.map((file) => file.filename);
    }

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create the product." });
  }
};

// Update a product by ID
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const updatedFields = {
      ...req.body,
    };

    // Check if files were uploaded and update the 'pictures' field if necessary
    if (req.files && req.files.length > 0) {
      // Assuming you want to update the 'pictures' field with the new uploaded picture filenames
      updatedFields.pictures = req.files.map((file) => file.filename);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updatedFields,
      {
        new: true,
      }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found." });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: "Failed to update the product." });
  }
};

// Delete a product by ID
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found." });
    }
    res.json({ message: "Product deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete the product." });
  }
};

exports.findProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId)
      .populate("soldDates.client") // Populate the client field within soldDates
      .populate("category")
      .populate("supplier")
      .exec();

    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to find the product." });
  }
};

// Find all products with pagination and search
exports.findAllProducts = async (req, res) => {
  try {
    const perPage = parseInt(req.query.perPage) || 10;
    const page = parseInt(req.query.page) || 1;
    const searchQuery = req.query.q || "";
    const categoryQuery = req.query.category || "";
    const soldQuery = req.query.sold || "";

    const query = {};
    if (searchQuery) {
      query.title = { $regex: searchQuery, $options: "i" };
    } else if (categoryQuery) {
      query.category = categoryQuery; // Use exact match for category
    } else if (soldQuery) {
      query.sold = soldQuery;
    }

    const totalCount = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalCount / perPage);
    const products = await Product.find(query)
      .populate("category")
      .populate("supplier")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    res.json({
      data: products,
      totalItems: totalCount,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products." });
  }
};

exports.searchProductByBarcode = async (req, res) => {
  const barcode = req.params.barcode;
  console.log(barcode);
  try {
    const product = await Product.findOne({ barcode })
      .populate("category")
      .populate("supplier")
      .exec();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.generateTotalSoldHistogram = async (req, res) => {
  try {
    const { year, month, day, barcode } = req.query;

    const matchStage = {
      soldDates: { $exists: true, $ne: [] }, // Make sure there are soldDates
    };

    if (year) {
      matchStage["soldDates.date"] = {
        $gte: new Date(`${year}-01-01`),
        $lt: new Date(`${parseInt(year) + 1}-01-01`),
      };
    }

    if (month) {
      if (day) {
        matchStage["soldDates.date"] = {
          $gte: new Date(`${year}-${month}-${day}`),
          $lt: new Date(`${year}-${month}-${parseInt(day) + 1}`),
        };
      } else {
        matchStage["soldDates.date"] = {
          $gte: new Date(`${year}-${month}-01`),
          $lt: new Date(`${year}-${parseInt(month) + 1}-01`),
        };
      }
    } else if (day) {
      matchStage["soldDates.date"] = {
        $gte: new Date(`${year}-${month}-${day}`),
        $lt: new Date(`${year}-${month}-${parseInt(day) + 1}`),
      };
    }

    if (barcode) {
      matchStage.barcode = barcode;
    }

    const soldProductsByMonth = await Product.aggregate([
      { $match: matchStage },
      { $unwind: "$soldDates" }, // Unwind the soldDates array
      {
        $group: {
          _id: {
            year: { $year: "$soldDates.date" },
            month: { $month: "$soldDates.date" },
          },
          totalSold: { $sum: "$soldDates.soldQuantity" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }, // Sort by year and month in ascending order
    ]);

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const labels = months;
    const data = Array.from({ length: 12 }, (_, monthIndex) => {
      const matchingMonth = soldProductsByMonth.find(
        (item) => item._id.month === monthIndex + 1
      );
      return matchingMonth ? matchingMonth.totalSold : 0;
    });

    res.json({ labels, data });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.generateTotalGainHistogram = async (req, res) => {
  try {
    const { year, month, day, barcode } = req.query;

    const matchStage = {
      soldDates: { $exists: true, $ne: [] }, // Make sure there are soldDates
    };

    if (year) {
      matchStage["soldDates.date"] = {
        $gte: new Date(`${year}-01-01`),
        $lt: new Date(`${parseInt(year) + 1}-01-01`),
      };
    }

    if (month) {
      if (day) {
        matchStage["soldDates.date"] = {
          $gte: new Date(`${year}-${month}-${day}`),
          $lt: new Date(`${year}-${month}-${parseInt(day) + 1}`),
        };
      } else {
        matchStage["soldDates.date"] = {
          $gte: new Date(`${year}-${month}-01`),
          $lt: new Date(`${year}-${parseInt(month) + 1}-01`),
        };
      }
    } else if (day) {
      matchStage["soldDates.date"] = {
        $gte: new Date(`${year}-${month}-${day}`),
        $lt: new Date(`${year}-${month}-${parseInt(day) + 1}`),
      };
    }

    if (barcode) {
      matchStage.barcode = barcode;
    }

    const soldProducts = await Product.aggregate([
      { $match: matchStage },
      { $unwind: "$soldDates" }, // Unwind the soldDates array
      {
        $group: {
          _id: {
            year: { $year: "$soldDates.date" },
            month: { $month: "$soldDates.date" },
          },
          totalGain: {
            $sum: {
              $multiply: [
                "$soldDates.soldQuantity",
                { $subtract: ["$sell_price", "$bought_price"] },
              ],
            },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }, // Sort by year and month in ascending order
    ]);

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const labels = months;
    const data = Array.from({ length: 12 }, (_, monthIndex) => {
      const matchingMonth = soldProducts.find(
        (item) => item._id.month === monthIndex + 1
      );
      return matchingMonth ? matchingMonth.totalGain : 0;
    });

    res.json({ labels, data });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.generateReturnedProductsHistogram = async (req, res) => {
  try {
    const { year, month, day, barcode } = req.query;

    const matchStage = {
      returnDates: { $exists: true, $ne: [] }, // Make sure there are returnDates
    };

    if (year) {
      matchStage["returnDates.date"] = {
        $gte: new Date(`${year}-01-01`),
        $lt: new Date(`${parseInt(year) + 1}-01-01`),
      };
    }

    if (month) {
      if (day) {
        matchStage["returnDates.date"] = {
          $gte: new Date(`${year}-${month}-${day}`),
          $lt: new Date(`${year}-${month}-${parseInt(day) + 1}`),
        };
      } else {
        matchStage["returnDates.date"] = {
          $gte: new Date(`${year}-${month}-01`),
          $lt: new Date(`${year}-${parseInt(month) + 1}-01`),
        };
      }
    } else if (day) {
      matchStage["returnDates.date"] = {
        $gte: new Date(`${year}-${month}-${day}`),
        $lt: new Date(`${year}-${month}-${parseInt(day) + 1}`),
      };
    }

    if (barcode) {
      matchStage.barcode = barcode;
    }

    const returnedProducts = await Product.aggregate([
      { $match: matchStage },
      { $unwind: "$returnDates" }, // Unwind the returnDates array
      {
        $group: {
          _id: {
            year: { $year: "$returnDates.date" },
            month: { $month: "$returnDates.date" },
          },
          totalReturnedValue: { $sum: "$returnDates.returnedQuantity" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }, // Sort by year and month in ascending order
    ]);

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const labels = months;
    const data = Array.from({ length: 12 }, (_, monthIndex) => {
      const matchingMonth = returnedProducts.find(
        (item) => item._id.month === monthIndex + 1
      );
      return matchingMonth ? matchingMonth.totalReturnedValue : 0;
    });

    res.json({ labels, data });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.calculateTotalNotSoldProducts = async (req, res) => {
  try {
    const { category } = req.params;

    const query = {};

    if (category) {
      query.category = category;
    }

    const totalCount = await Product.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalCount: { $sum: "$quantity" }, // Calculate total not sold products based on quantity
        },
      },
    ]);

    res.json({
      totalCount: totalCount.length > 0 ? totalCount[0].totalCount : 0,
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.findProductsByClient = async (req, res) => {
  try {
    const clientId = req.params.clientId;

    console.log("Searching products for client ID:", clientId);

    const products = await Product.aggregate([
      {
        $unwind: "$soldDates",
      },
      {
        $match: {
          "soldDates.client": new mongoose.Types.ObjectId(clientId), // Use new with ObjectId
        },
      },
    ]);

    console.log("Found products:", products);

    res.json(products);
  } catch (error) {
    console.error("Error fetching products by client:", error);
    res.status(500).json({ error: "Failed to fetch products by client." });
  }
};
