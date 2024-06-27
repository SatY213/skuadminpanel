const Supplier = require("../models/Supplier");
const { validationResult } = require("express-validator");
const User = require("../models/User");

exports.createSupplier = async (req, res) => {
  try {
    if (req.file) {
      console.log("File uploaded:", req.file);
      req.body.picture = `${req.file.filename}`;
    }
    const user = await User.findById(req.user.id).select("shop_ref");
    if (user.shop_ref == req.shop_ref && req.role == "Commercant") {
      req.body.shop_ref = req.shop_ref;
      const supplier = new Supplier(req.body);

      const savedSupplier = await supplier.save();
      res.status(201).json({ success: "Enregistrement réussi." });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Échec de la création du fournisseur." });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    console.log("hey iam trying to update suppliers");
    const supplierId = req.params.id;
    if (req.file) {
      console.log("File uploaded:", req.file);
      req.body.picture = `${req.file.filename}`;
    }
    const user = await User.findById(req.user.id).select("shop");
    if (user.shop_ref == req.shop_ref && req.role == "Commercant") {
      req.body.shop_ref = req.shop_ref;
      const updatedFields = {
        ...req.body,
      };

      const updatedSupplier = await Supplier.findByIdAndUpdate(
        supplierId,
        updatedFields,
        {
          new: true,
        }
      );

      if (!updatedSupplier) {
        return res.status(404).json({ error: "Fournisseur non trouvé." });
      }

      res.status(201).json({ success: "Mise à jour réussie." });
    } else {
      res.status(550).json({ error: "You are not allowed !" });
    }
  } catch (error) {
    res.status(500).json({ error: "Échec de la mise à jour." });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    const supplierId = req.params.id;
    const user = await User.findById(req.user.id).select("shop_ref");

    if (user.shop_ref == req.shop_ref && req.role == "Commercant") {
      const deletedSupplier = await Supplier.findByIdAndDelete(supplierId);

      if (!deletedSupplier) {
        return res.status(404).json({ error: "Fournisseur non trouvé." });
      }
      res.status(201).json({ success: "Fournisseur est supprimé." });
    } else {
      res.status(550).json({ error: "You are not allowed !" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Échec de la suppression du fournisseur." });
  }
};

exports.findSupplierById = async (req, res) => {
  try {
    const supplierId = req.params.id;
    const user = await User.findById(req.user.id).select("shop");
    if (user.shop_ref == req.shop_ref && req.role == "Commercant") {
      const supplier = await Supplier.findById(supplierId);

      if (!supplier) {
        return res.status(404).json({ error: "Fournisseur non trouvé." });
      }

      res.json(supplier);
    } else {
      res.status(550).json({ error: "You are not allowed !" });
    }
  } catch (error) {
    res.status(500).json({ error: "Échec de la récupération du fournisseur." });
  }
};

exports.findAllShopSuppliers = async (req, res) => {
  try {
    const perPage = parseInt(req.query.perPage) || 12;
    const page = parseInt(req.query.page) || 1;
    const searchQuery = req.query.q || "";

    const query = { shop_ref: req.shop_ref };
    if (searchQuery) {
      query.$or = [{ title: { $regex: searchQuery, $options: "i" } }];
    }
    const user = await User.findById(req.user.id).select("shop_ref");
    if (user.shop_ref == req.shop_ref && req.role == "Commercant") {
      const totalCount = await Supplier.countDocuments(query);
      const totalPages = Math.ceil(totalCount / perPage);
      const suppliers = await Supplier.find(query)
        .skip((page - 1) * perPage)
        .sort({ createdAt: -1 })
        .limit(perPage)
        .exec();

      res.json({
        data: suppliers,
        totalItems: totalCount,
        totalPages: totalPages,
        currentPage: page,
      });
    } else {
      res.status(550).json({ error: "You are not allowed !" });
    }
  } catch (error) {
    console.error(error);

    res
      .status(500)
      .json({ error: "Échec de la récupération des fournisseurs" });
  }
};
