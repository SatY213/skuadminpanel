const Client = require("../../models/ecomm/client");

// Create a new client
exports.createClient = async (req, res) => {
  try {
    const client = new Client(req.body);
    const savedClient = await client.save();
    res.status(201).json(savedClient);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create the client." });
  }
};

// Update a client by ID
exports.updateClient = async (req, res) => {
  try {
    const clientId = req.params.id;
    const updatedClient = await Client.findByIdAndUpdate(clientId, req.body, {
      new: true,
    });
    if (!updatedClient) {
      return res.status(404).json({ error: "Client not found." });
    }
    res.json(updatedClient);
  } catch (error) {
    res.status(500).json({ error: "Failed to update the client." });
  }
};

// Delete a client by ID
exports.deleteClient = async (req, res) => {
  try {
    const clientId = req.params.id;
    const deletedClient = await Client.findByIdAndDelete(clientId);
    if (!deletedClient) {
      return res.status(404).json({ error: "Client not found." });
    }
    res.json({ message: "Client deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete the client." });
  }
};

// Find a client by ID
exports.findClientById = async (req, res) => {
  try {
    const clientId = req.params.id;
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ error: "Client not found." });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: "Failed to find the client." });
  }
};
// Find a client
exports.findClientByPhoneNumber = async (req, res) => {
  try {
    const clientPhonenumber = req.params.phonenumber;
    const client = await Client.findOne({ phonenumber: clientPhonenumber }); // Corrected line
    if (!client) {
      console.log("Client not found");
    }
    res.json(client);
  } catch (error) {
    console.log("Failed to find client");
  }
};

exports.findAllClients = async (req, res) => {
  try {
    const perPage = parseInt(req.query.perPage) || 10;
    const page = parseInt(req.query.page) || 1;
    const searchQuery = req.query.q || "";
    const lastnameQuery = req.query.lastname || "";
    const phonenumberQuery = req.query.phonenumber || "";

    const query = {};
    if (searchQuery) {
      query.firstname = { $regex: searchQuery, $options: "i" };
    } else if (lastnameQuery) {
      query.lastname = lastnameQuery;
    } else if (phonenumberQuery) {
      query.phonenumber = phonenumberQuery;
    }

    const totalCount = await Client.countDocuments(query);
    const totalPages = Math.ceil(totalCount / perPage);
    const clients = await Client.find(query)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    res.json({
      data: clients,
      totalItems: totalCount,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch clients." });
  }
};
