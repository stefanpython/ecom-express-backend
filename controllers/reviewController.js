const { body, param, validationResult } = require("express-validator");
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

// GET reviews of a product
exports.get_product_reviews = [
  // Validate review ID
  param("productId").isMongoId().withMessage("Invalid Product ID"),

  // Check for validation errors
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ errors: validationErrors.array() });
    }

    try {
      const { productId } = req.params;

      // Fetch reviews for the specified product
      const reviews = await Review.find({ product: productId });

      res
        .status(200)
        .json({ message: "Reviews retrieved successfully", reviews });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

// GET reviews for a specific user
exports.get_user_reviews = [
  // Validate review ID
  param("userId").isMongoId().withMessage("Invalid User ID"),

  // Check for validation errors
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ errors: validationErrors.array() });
    }

    try {
      const { userId } = req.params;

      // Fetch reviews for the specified product
      const reviews = await Review.find({ user: userId });

      res
        .status(200)
        .json({ message: "Reviews retrieved successfully", reviews });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

// UPDATE a review
exports.update_review = [
  // Validate review ID
  param("reviewId").isMongoId().withMessage("Invalid Review ID"),

  // Validation middleware using express-validator
  body("rating")
    .optional({ nullable: true }) // Make the rating field optional
    .isNumeric()
    .withMessage("Rating must be a number"),
  body("comment").optional({ nullable: true }), // Make the comment field optional

  // Check for validation errors
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ errors: validationErrors.array() });
    }

    try {
      const { reviewId } = req.params;

      // Destructure fields from the request body
      const { rating, comment } = req.body;

      // Find the review by ID in the database
      const review = await Review.findById(reviewId);

      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      // Update review fields
      // Modify the fields based on your requirements
      review.rating = rating || review.rating;
      review.comment = comment || review.comment;

      // Save the updated review to the database
      const updatedReview = await review.save();

      // Send the updated review details as a response
      res
        .status(200)
        .json({ message: "Review updated successfully", updatedReview });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];
