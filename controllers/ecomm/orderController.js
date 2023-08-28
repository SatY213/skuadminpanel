const Order = require("../../models/ecomm/order");

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const order = new Order(req.body);
    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create the order." });
  }
};

// Update an order by ID
exports.updateOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const updatedOrder = await Order.findByIdAndUpdate(orderId, req.body, {
      new: true,
    });
    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found." });
    }
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: "Failed to update the order." });
  }
};

// Delete an order by ID
exports.deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const deletedOrder = await Order.findByIdAndDelete(orderId);
    if (!deletedOrder) {
      return res.status(404).json({ error: "Order not found." });
    }
    res.json({ message: "Order deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete the order." });
  }
};

// Find an order by ID
exports.findOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId)
      .populate("clientId", "firstname lastname") // Populate client details in the order response
      .populate("products", "title price"); // Populate product details in the order response

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to find the order." });
  }
};

// Find all orders with pagination and search
exports.findAllOrders = async (req, res) => {
  try {
    const perPage = parseInt(req.query.perPage) || 10;
    const page = parseInt(req.query.page) || 1;
    const searchQuery = req.query.q || "";

    const query = {};
    if (searchQuery) {
      query.deliveryStatus = { $regex: searchQuery, $options: "i" };
    }

    const totalCount = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalCount / perPage);
    const orders = await Order.find(query)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    res.json({
      data: orders,
      totalItems: totalCount,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders." });
  }
};
