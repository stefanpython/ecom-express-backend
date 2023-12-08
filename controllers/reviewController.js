const { body, validationResult } = require("express-validator");
const Review = require("../models/Review");
const Product = require("../models/Product");

// Create a new review for a product
exports.create_review = [
  // Validation middleware using express-validator
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("comment").optional().isString(),

  // Check for validation errors
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ errors: validationErrors.array() });
    }

    try {
      // Use authenticated user ID from req.user
      const user = req.user._id;

      // Destructure fields from the request body
      const { rating, comment } = req.body;

      // Include :productId in the route to associate the review with a product
      const productId = req.params.productId;

      // Check if the product exists
      const existingProduct = await Product.findById(productId);
      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Create a new review
      const newReview = new Review({
        user,
        product: productId,
        rating,
        comment,
      });

      // Save the new review to the database
      const savedReview = await newReview.save();

      res.status(201).json({
        message: "Review added successfully",
        review: savedReview,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];
