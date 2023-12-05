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