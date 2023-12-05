const { body, param, validationResult } = require("express-validator");
const Order = require("../models/Order");

// CREATE new order
exports.order_create = [
  // Validation middleware using express-validator
  body("items").isArray().withMessage("Items must be an array"),
  body("items.*.product").isMongoId().withMessage("Invalid product ID"),
  body("items.*.quantity").isInt().withMessage("Quantity must be an integer"),
  body("totalAmount").isNumeric().withMessage("Total amount must be a number"),
  body("status")
    .isIn(["Pending", "Shipped", "Delivered"])
    .withMessage("Invalid status"),

  // Check for validation errors
  (req, res, next) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ errors: validationErrors.array() });
    }
    next();
  },

  // Try creating the order
  async (req, res) => {
    try {
      // Use authenticated user data from req.user
      const { _id: user } = req.user;
      const { items, totalAmount, status } = req.body;

      // Create a new order
      const newOrder = new Order({
        user,
        items,
        totalAmount,
        status,
      });

      // Save the new order to the database
      const savedOrder = await newOrder.save();

      res
        .status(201)
        .json({ message: "Order created successfully", savedOrder });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

// GET list of all orders
exports.order_list = async (req, res) => {
  try {
    // Retrieve all orders from database
    const orders = await Order.find();

    res.status(200).json({ message: "List retrieved successfully", orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET details of a specific order
exports.get_order_details = [
  // Validate product ID
  param("orderId").isMongoId().withMessage("Invalid Product ID"),

  // Check for validation errors
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ errors: validationErrors.array() });
    }

    try {
      // Extract the product ID from the request parameters
      const { orderId } = req.params;

      // Find the product by ID in the database
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Send the product details as a response
      res.status(200).json({ message: "Get request is a success", order });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

// UPDATE details of a specific order
exports.update_order_details = [
  // Validate product ID
  param("orderId").isMongoId().withMessage("Invalid Order ID"),

  // Validation middleware using express-validator
  body("items").isArray().withMessage("Items must be an array"),
  body("items.*.product").isMongoId().withMessage("Invalid product ID"),
  body("items.*.quantity").isInt().withMessage("Quantity must be an integer"),
  body("totalAmount").isNumeric().withMessage("Total amount must be a number"),
  body("status")
    .isIn(["Pending", "Shipped", "Delivered"])
    .withMessage("Invalid status"),

  // Check for validation errors
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ errors: validationErrors.array() });
    }

    try {
      // Extract the order ID from the request parameters
      const { orderId } = req.params;

      // Destructure fields from the request body
      const { items, totalAmount, status } = req.body;

      // Find the order by ID in the database
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Update order fields
      order.items = items || order.items;
      order.totalAmount = totalAmount || order.totalAmount;
      order.status = status || order.status;

      // Save the updated order to the database
      const updatedOrder = await order.save();

      // Send the updated product details as a response
      res
        .status(200)
        .json({ message: "Order updated succesfully", updatedOrder });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];
