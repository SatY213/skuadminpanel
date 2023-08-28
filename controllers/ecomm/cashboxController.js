const Cashbox = require("../../models/cashbox"); // Assuming you have a Cashbox model

// Create a new cashbox
exports.createCashbox = async (req, res) => {
  try {
    const cashbox = new Cashbox(req.body);
    const savedCashbox = await cashbox.save();
    res.status(201).json(savedCashbox);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create the cashbox." });
  }
};

// Update a cashbox by ID
exports.updateCashbox = async (req, res) => {
  try {
    const cashboxId = req.params.id;
    const updatedCashbox = await Cashbox.findByIdAndUpdate(
      cashboxId,
      req.body,
      {
        new: true,
      }
    );
    if (!updatedCashbox) {
      return res.status(404).json({ error: "Cashbox not found." });
    }
    res.json(updatedCashbox);
  } catch (error) {
    res.status(500).json({ error: "Failed to update the cashbox." });
  }
};

// Delete a cashbox by ID
exports.deleteCashbox = async (req, res) => {
  try {
    const cashboxId = req.params.id;
    const deletedCashbox = await Cashbox.findByIdAndDelete(cashboxId);
    if (!deletedCashbox) {
      return res.status(404).json({ error: "Cashbox not found." });
    }
    res.json({ message: "Cashbox deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete the cashbox." });
  }
};

// Find a cashbox by ID
exports.findCashboxById = async (req, res) => {
  try {
    const cashboxId = req.params.id;
    const cashbox = await Cashbox.findById(cashboxId);
    if (!cashbox) {
      return res.status(404).json({ error: "Cashbox not found." });
    }
    res.json(cashbox);
  } catch (error) {
    res.status(500).json({ error: "Failed to find the cashbox." });
  }
};

exports.findAllCashboxes = async (req, res) => {
  try {
    // Similar logic for pagination and querying as in the previous controller
    // Replace Client with Cashbox and adjust query conditions as needed

    res.json({
      data: cashboxes,
      totalItems: totalCount,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cashboxes." });
  }
};
