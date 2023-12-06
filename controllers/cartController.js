const { body, validationResult } = require("express-validator");
const Cart = require("../models/Cart");

// Add a product to the user's cart (supports guest cart)
exports.add_product_to_cart = [
  // Validation middleware using express-validator
  body("product").isMongoId().withMessage("Invalid product ID"),
  body("quantity").isInt().withMessage("Quantity must be an integer"),

  // Check for validation errors
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ errors: validationErrors.array() });
    }

    try {
      // Use authenticated user data from req.user if available
      const userId = req.user ? req.user._id : null;

      // Destructure fields from the request body
      const { product, quantity } = req.body;

      // Find the user's cart or create a new one
      let userCart = await Cart.findOne({ user: userId });

      if (!userCart) {
        userCart = new Cart({ user: userId, items: [] });
      }

      // Check if the product is already in the cart
      const existingProductIndex = userCart.items.findIndex((item) =>
        item.product.equals(product)
      );

      if (existingProductIndex !== -1) {
        // If the product already exists, update the quantity
        userCart.items[existingProductIndex].quantity += quantity;
      } else {
        // If the product is not in the cart, add it
        userCart.items.push({ product, quantity });
      }

      // Save the updated cart to the database
      const savedCart = await userCart.save();

      res.status(201).json({
        message: "Product added to the cart successfully",
        cart: savedCart,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

// Get the user's cart contents (supports guest cart)
exports.get_cart_content = async (req, res) => {
  try {
    // Use authenticated user data from req.user if available
    const userId = req.user ? req.user._id : null;

    // Find the user's cart based on the user ID
    const userCart = await Cart.findOne({ user: userId }).populate(
      "items.product",
      "name price"
    );

    if (!userCart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.json({
      message: "User's cart contents retrieved successfully",
      cart: userCart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
