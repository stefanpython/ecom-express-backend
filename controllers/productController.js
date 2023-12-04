const { body, validationResult } = require("express-validator");
const Product = require("../models/Product");

// Create new product
exports.create_product = async (req, res, next) => {
  // Validation middleware using express-validator
  const validationMiddleware = [
    body("name").trim().isLength({ min: 1 }).withMessage("Name is required"),
    body("description")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Description is required"),
    body("price").isNumeric().withMessage("Price must be a number"),
    body("quantity").isInt().withMessage("Quantity must be an integer"),
    body("category")
      .isMongoId()
      .withMessage("Category must be a valid ObjectId"),
    body("image")
      .optional()
      .trim()
      .isURL()
      .withMessage("Image URL is required"),
  ];

  // Check for validation errors
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

    res.status(201).json(savedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get a list of products
exports.product_list = async (req, res) => {
  try {
    // Retrieve all products from the database
    const products = await Product.find();

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
