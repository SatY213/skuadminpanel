const Subscription = require("../models/Subscription");
const { validationResult } = require("express-validator");

// Create a new subscription
exports.createSubscription = async (req, res) => {
  console.log(req.body);
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    const subscription = new Subscription(req.body);
    console.log(req.body);
    const savedSubscription = await subscription.save();
    res.status(201).json({ success: "Enregistrement réussi." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Échec de la création de l'abonnement." });
  }
};

// Update a subscription by ID
exports.updateSubscription = async (req, res) => {
  try {
    console.log("hey iam trying to update subscriptions");
    const subscriptionId = req.params.id;
    const updatedFields = {
      ...req.body,
    };

    const updatedSubscription = await Subscription.findByIdAndUpdate(
      subscriptionId,
      updatedFields,
      {
        new: true,
      }
    );

    if (!updatedSubscription) {
      return res.status(404).json({ error: "Abonnement non trouvé." });
    }

    res.status(201).json({ success: "Mise à jour réussie." });
  } catch (error) {
    res.status(500).json({ error: "Échec de la mise à jour." });
  }
};

// Delete a subscription by ID
exports.deleteSubscription = async (req, res) => {
  try {
    const subscriptionId = req.params.id;
    const deletedSubscription = await Subscription.findByIdAndDelete(
      subscriptionId
    );

    if (!deletedSubscription) {
      return res.status(404).json({ error: "Abonnement non trouvé." });
    }
    res.status(201).json({ success: "Abonnement est supprimé" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Échec de la suppression de l'abonnement" });
  }
};

exports.findSubscriptionById = async (req, res) => {
  try {
    const subscriptionId = req.params.id;
    const subscription = await Subscription.findById(subscriptionId);

    if (!subscription) {
      return res.status(404).json({ error: "Subscription non trouvé." });
    }

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: "Échec de la récupération de l'abonnement" });
  }
};

// Find all subscriptions with pagination and search
exports.findAllSubscriptions = async (req, res) => {
  try {
    const perPage = parseInt(req.query.perPage) || 8;
    const page = parseInt(req.query.page) || 1;
    const searchQuery = req.query.q || "";

    const query = {};
    if (searchQuery) {
      query.$or = [{ generated_code: { $regex: searchQuery, $options: "i" } }];
    }

    const totalCount = await Subscription.countDocuments(query);
    const totalPages = Math.ceil(totalCount / perPage);
    const subscriptions = await Subscription.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    res.json({
      data: subscriptions,
      totalItems: totalCount,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: "Échec de la récupération des Abonnements" });
  }
};
