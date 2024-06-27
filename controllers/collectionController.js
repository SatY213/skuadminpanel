const Collection = require("../models/Collection");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const Product = require("../models/Product");

exports.createCollection = async (req, res) => {
  try {
    if (req.file) {
      console.log("File uploaded:", req.file);
      req.body.picture = `${req.file.filename}`;
    }
    const user = await User.findById(req.user.id).select("shop_ref");
    if (user.shop_ref == req.shop_ref && req.role == "Commercant") {
      req.body.shop_ref = req.shop_ref;
      const collection = new Collection(req.body);

      const savedCollection = await collection.save();
      res.status(201).json({ success: "Enregistrement réussi." });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Échec de la création de la collection." });
  }
};

exports.updateCollection = async (req, res) => {
  try {
    console.log("hey iam trying to update collections");
    const collectionId = req.params.id;
    if (req.file) {
      console.log("File uploaded:", req.file);
      req.body.picture = `${req.file.filename}`;
    }
    const user = await User.findById(req.user.id).select("shop_ref");
    if (user.shop_ref == req.shop_ref && req.role == "Commercant") {
      req.body.shop_ref = req.shop_ref;
      const updatedFields = {
        ...req.body,
      };

      const updatedCollection = await Collection.findByIdAndUpdate(
        collectionId,
        updatedFields,
        {
          new: true,
        }
      );

      if (!updatedCollection) {
        return res.status(404).json({ error: "Collection non trouvé." });
      }

      res.status(201).json({ success: "Mise à jour réussie." });
    } else {
      res.status(550).json({ error: "You are not allowed !" });
    }
  } catch (error) {
    res.status(500).json({ error: "Échec de la mise à jour." });
  }
};

exports.deleteCollection = async (req, res) => {
  try {
    const collectionId = req.params.id;
    const user = await User.findById(req.user.id).select("shop_ref");
    if (user.shop_ref == req.shop_ref && req.role == "Commercant") {
      const deletedCollection = await Collection.findByIdAndDelete(
        collectionId
      );

      if (!deletedCollection) {
        return res.status(404).json({ error: "Collection non trouvé." });
      }
      const deletedProducts = await Product.deleteMany({
        collection_ref: collectionId,
      });
      res.status(201).json({ success: "Collection est supprimé" });
    } else {
      res.status(550).json({ error: "You are not allowed !" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Échec de la suppression de la collection" });
  }
};

exports.findCollectionById = async (req, res) => {
  try {
    const collectionId = req.params.id;
    const user = await User.findById(req.user.id).select("shop_ref");
    if (user.shop_ref == req.shop_ref && req.role == "Commercant") {
      const collection = await Collection.findById(collectionId);

      if (!collection) {
        return res.status(404).json({ error: "Collection non trouvé." });
      }

      res.json(collection);
    } else {
      res.status(550).json({ error: "You are not allowed !" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Échec de la récupération de la collection" });
  }
};
exports.findSubCollections = async (req, res) => {
  try {
    const collectionId = req.params.id;
    const searchQuery = req.query.q || "";

    const collection = await Collection.findById(collectionId).select(
      "sub_collections"
    );

    if (!collection) {
      return res.status(404).json({ error: "Collection non trouvé." });
    }

    let subCollections = collection.sub_collections;

    if (searchQuery) {
      const regex = new RegExp(searchQuery, "i");
      subCollections = subCollections.filter(
        (subCollection) =>
          regex.test(subCollection.title) ||
          regex.test(subCollection.abreviation)
      );
    }

    res.json(subCollections);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Échec de la récupération de la collection" });
  }
};

exports.findAllShopCollections = async (req, res) => {
  try {
    const perPage = parseInt(req.query.perPage) || 9;
    const page = parseInt(req.query.page) || 1;
    const searchQuery = req.query.q || "";
    const query = { shop_ref: req.shop_ref };
    if (searchQuery) {
      query.$or = [{ title: { $regex: searchQuery, $options: "i" } }];
    }
    const user = await User.findById(req.user.id).select("shop_ref");
    if (user.shop_ref == req.shop_ref && req.role == "Commercant") {
      const totalCount = await Collection.countDocuments(query);
      const totalPages = Math.ceil(totalCount / perPage);
      const collections = await Collection.find(query)
        .skip((page - 1) * perPage)
        .sort({ createdAt: -1 })
        .limit(perPage)
        .exec();

      res.json({
        data: collections,
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
      .json({ error: "Échec de la récupération des collections" + error });
  }
};
exports.findAllShopCollectionsReduced = async (req, res) => {
  try {
    const perPage = parseInt(req.query.perPage) || 12;
    const page = parseInt(req.query.page) || 1;
    const searchQuery = req.query.q || "";
    const query = { shop_ref: req.params.id };
    if (searchQuery) {
      query.$or = [{ title: { $regex: searchQuery, $options: "i" } }];
    }
    const totalCount = await Collection.countDocuments(query);
    const totalPages = Math.ceil(totalCount / perPage);
    const collections = await Collection.find(query)
      .skip((page - 1) * perPage)
      .sort({ createdAt: -1 })
      .select("title picture sub_collections")
      .limit(perPage)
      .exec();

    res.json({
      data: collections,
      totalItems: totalCount,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error(error);

    res
      .status(500)
      .json({ error: "Échec de la récupération des collections" + error });
  }
};
