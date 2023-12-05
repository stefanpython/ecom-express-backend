const { body, validationResult } = require("express-validator");
const Cart = require("../models/Cart");

// ADD a product to the user's cart
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
      // Use authenticated user data from req.user
      const { _id: user } = req.user;
      const { product, quantity } = req.body;

      // Find the user's cart or create a new one if it doesn't exist
      let userCart = await Cart.findOne({ user });

      if (!userCart) {
        userCart = new Cart({ user, items: [] });
      }

      // Check if the product is already in the cart
      const existingItem = userCart.items.find((item) =>
        item.product.equals(product)
      );

      // If the product is already in the cart, update the quantity
      // Otherwise, add a new item to the cart
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        userCart.items.push({ product, quantity });
      }

      // Save the updated or new cart to the database
      const savedCart = await userCart.save();

      res
        .status(200)
        .json({ message: "Product added to the cart successfully", savedCart });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];
