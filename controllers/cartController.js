const { body, validationResult } = require("express-validator");
const Cart = require("../models/Cart");

// Add a product to the user's cart (supports guest cart)
exports.add_product_to_cart = [
  body("product").isMongoId().withMessage("Invalid product ID"),
  body("quantity").isInt().withMessage("Quantity must be an integer"),

  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ errors: validationErrors.array() });
    }

    try {
      const userId = req.user ? req.user._id : null;
      const { product, quantity } = req.body;

      let userCart;

      if (userId) {
        // For authenticated users, use only the user ID
        userCart = await Cart.findOne({ user: userId });
      } else {
        // For guest users, use the user ID as null
        userCart = await Cart.findOne({ user: null });
      }

      if (!userCart) {
        // If the cart doesn't exist, create a new one
        userCart = new Cart({ user: userId, items: [] });
      }

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

// Update the quantity of a product in the guest's cart
exports.update_cart_quantity = async (req, res) => {
  try {
    const productId = req.params.productId;
    const newQuantity = req.body.quantity;

    if (!Number.isInteger(newQuantity) || newQuantity <= 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    // Check if the request is from an authenticated user
    if (req.user) {
      // Authenticated user logic
      const userId = req.user._id;
      let userCart = await Cart.findOne({ user: userId });

      if (!userCart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      const productIndex = userCart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (productIndex === -1) {
        return res.status(404).json({
          message: "Product not found in the authenticated user's cart",
        });
      }

      userCart.items[productIndex].quantity = newQuantity;

      const updatedCart = await userCart.save();

      return res.json({
        message:
          "Product quantity updated successfully for the authenticated user",
        cart: updatedCart,
      });
    } else {
      // Guest user logic
      let guestCart = await Cart.findOne({ user: null });

      if (!guestCart) {
        guestCart = new Cart({ user: null, items: [] });
      }

      const productIndex = guestCart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (productIndex === -1) {
        return res.status(404).json({
          message: "Product not found in the guest user's cart",
        });
      }

      guestCart.items[productIndex].quantity = newQuantity;

      const updatedGuestCart = await guestCart.save();

      return res.json({
        message: "Product quantity updated successfully for the guest user",
        cart: updatedGuestCart,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Remove a product from the user's cart (supports guest cart)
exports.remove_product_cart = async (req, res) => {
  try {
    const productId = req.params.productId;

    // Check if the request is from an authenticated user
    if (req.user) {
      // Authenticated user logic
      const userId = req.user._id;
      const userCart = await Cart.findOne({ user: userId });

      if (!userCart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      // Find the index of the product in the cart items
      const productIndex = userCart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (productIndex === -1) {
        return res.status(404).json({
          message: "Product not found in the authenticated user's cart",
        });
      }

      // Remove the product from the cart
      userCart.items.splice(productIndex, 1);

      // Save the updated cart
      const updatedCart = await userCart.save();

      return res.json({
        message:
          "Product removed successfully from the authenticated user's cart",
        cart: updatedCart,
      });
    } else {
      // Guest user logic
      // Retrieve or create a guest cart based on a session identifier
      let guestCart = await Cart.findOne({ user: null });

      if (!guestCart) {
        return res
          .status(404)
          .json({ message: "Product not found in the guest user's cart" });
      }

      // Find the index of the product in the guest cart items
      const productIndex = guestCart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (productIndex === -1) {
        return res.status(404).json({
          message: "Product not found in the guest user's cart",
        });
      }

      // Remove the product from the guest cart
      guestCart.items.splice(productIndex, 1);

      // Save the updated guest cart
      const updatedGuestCart = await guestCart.save();

      return res.json({
        message: "Product removed successfully from the guest user's cart",
        cart: updatedGuestCart,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
