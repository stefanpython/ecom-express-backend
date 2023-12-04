const { body, param, validationResult } = require("express-validator");
const Product = require("../models/Product");

// CREATE new product
exports.create_product = [
  // Validation middleware using express-validator
  body("name").trim().isLength({ min: 1 }).withMessage("Name is required"),
  body("description")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Description is required"),
  body("price").isNumeric().withMessage("Price must be a number"),
  body("quantity").isInt().withMessage("Quantity must be an integer"),
  body("category").isMongoId().withMessage("Category must be a valid ObjectId"),
  body("image").optional().trim().isURL().withMessage("Image URL is required"),

  // Check for validation errors
  async (req, res, next) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ errors: validationErrors.array() });
    }

    try {
      // Destructure fields from the request body
      const { name, description, price, quantity, category, image } = req.body;

      // Create a new product
      const newProduct = new Product({
        name,
        description,
        price,
        quantity,
        category,
        image,
      });

      // Save the new product to the database
      const savedProduct = await newProduct.save();

      res
        .status(201)
        .json({ message: "Product created successfully", savedProduct });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

// GET a list of products
exports.product_list = async (req, res) => {
  try {
    // Retrieve all products from the database
    const products = await Product.find();

    res.status(200).json({ message: "List retrieved successfully", products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET details of a specific product
exports.get_product_details = [
  // Validate product ID
  param("productId").isMongoId().withMessage("Invalid Product ID"),

  // Check for validation errors
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ errors: validationErrors.array() });
    }

    try {
      // Extract the product ID from the request parameters
      const { productId } = req.params;

      // Find the product by ID in the database
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Send the product details as a response
      res.status(200).json({ message: "Get request is a success", product });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

// UPDATE details of a specific product
exports.update_product_details = [
  // Validate product ID
  param("productId").isMongoId().withMessage("Invalid Product ID"),

  // Validation middleware for request body fields
  body("name").trim().isLength({ min: 1 }).withMessage("Name is required"),
  body("description")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Description is required"),
  body("price").isNumeric().withMessage("Price must be a number"),
  body("quantity").isInt().withMessage("Quantity must be an integer"),
  body("category").isMongoId().withMessage("Category must be a valid ObjectId"),
  body("image").optional().trim().isURL().withMessage("Image URL is required"),

  // Check for validation errors
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ errors: validationErrors.array() });
    }

    try {
      // Extract the product ID from the request parameters
      const { productId } = req.params;

      // Destructure fields from the request body
      const { name, description, price, quantity, category, image } = req.body;

      // Find the product by ID in the database
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Update product fields
      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price || product.price;
      product.quantity = quantity || product.quantity;
      product.category = category || product.category;
      product.image = image || product.image;

      // Save the updated product to the database
      const updatedProduct = await product.save();

      // Send the updated product details as a response
      res
        .status(200)
        .json({ message: "Product updated succesfully", updatedProduct });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

// DELETE a product
exports.delete_product = [
  // Validation middleware for productId
  param("productId").isMongoId().withMessage("Invalid productId"),

  // Check for validation errors
  (req, res, next) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ errors: validationErrors.array() });
    }
    next();
  },

  // Try deleting the product
  async (req, res) => {
    try {
      const { productId } = req.params; // Extract productId from the URL parameter

      // Find the product by productId and delete it
      const result = await Product.deleteOne({ _id: productId });

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];
