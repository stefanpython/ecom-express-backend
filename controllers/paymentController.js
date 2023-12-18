const { body, param, validationResult } = require("express-validator");
const Payment = require("../models/Payment");
const Order = require("../models/Order");

// Make a payment for an order
exports.make_payment = [
  // Validate order ID
  param("orderId").isMongoId().withMessage("Invalid Order ID"),

  // Check for validation errors
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ errors: validationErrors.array() });
    }

    try {
      // Extract the order ID from the request parameters
      const { orderId } = req.params;

      // Find the order by ID in the database
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Use authenticated user ID from req.user
      const user = req.user._id;

      // Check if the order belongs to the authenticated user
      if (order.user.toString() !== user.toString()) {
        return res
          .status(403)
          .json({ message: "Unauthorized access to the order" });
      }

      // Check if the order is already paid
      if (order.status === "Paid") {
        return res.status(400).json({ message: "Order is already paid" });
      }

      // Explicitly convert totalAmount to a JavaScript number
      const totalAmount = Number(order.totalAmount);

      // Check if totalAmount is a valid number
      if (isNaN(totalAmount)) {
        return res.status(400).json({ message: "Invalid total amount" });
      }

      // Create a new payment
      const newPayment = new Payment({
        user,
        order: orderId,
        amount: totalAmount,
        paymentMethod: req.body.paymentMethod,
        status: "Paid",
      });

      // Save the new payment to the database
      const savedPayment = await newPayment.save();

      // Update the order status to "Paid"
      order.status = "Paid";
      await order.save();

      res.status(201).json({
        message: "Payment made successfully",
        payment: savedPayment,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

// Get a list of all payments by a user
exports.get_user_payments = [
  // Validate user ID
  param("userId").isMongoId().withMessage("Invalid User ID"),

  // Check for validation errors
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ errors: validationErrors.array() });
    }

    try {
      // Extract the user ID from the request parameters
      const { userId } = req.params;

      // Find all payments by the user ID in the database
      const userPayments = await Payment.find({ user: userId });

      res.status(200).json({
        message: "Get request is a success",
        payments: userPayments,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];
