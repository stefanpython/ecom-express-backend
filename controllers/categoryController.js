const { body, param, validationResult } = require("express-validator");
const Category = require("../models/Category");

// CREATE new category
exports.create_category = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if the category with the given name already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res
        .status(400)
        .json({ message: "Category with this name already exists" });
    }

    // Create a new category
    const newCategory = new Category({
      name,
      description,
    });

    // Save the category to the database
    const savedCategory = await newCategory.save();

    res.status(201).json({
      message: "Category created successfully",
      category: savedCategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET list with all categories
exports.category_list = async (req, res) => {
  try {
    // Retrieve all categories from the database
    const categories = await Category.find();

    res
      .status(200)
      .json({ message: "List retrieved successfully", categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET details of a specific category
exports.get_category_details = [
  // Validate category ID
  param("categoryId").isMongoId().withMessage("Invalid Category ID"),

  // Check for validation errors
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ errors: validationErrors.array() });
    }

    try {
      // Extract the category ID from the request parameters
      const { categoryId } = req.params;

      // Find the category by ID in the database
      const category = await Category.findById(categoryId);

      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      // Send the category details as a response
      res.status(200).json({ message: "Get request is a success", category });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

// UPDATE details of a specific category
exports.update_category = [
  // Validate category ID
  param("categoryId").isMongoId().withMessage("Invalid Category ID"),

  // Validation middleware for request body fields
  body("name").trim().isLength({ min: 1 }).withMessage("Name is required"),
  body("description")
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Description is required"),

  // Check for validation errors
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ errors: validationErrors.array() });
    }

    try {
      // Extract the category ID from the request parameters
      const { categoryId } = req.params;

      // Destructure fields from the request body
      const { name, description } = req.body;

      // Find the category by ID in the database
      const category = await Category.findById(categoryId);

      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      // Update category fields
      category.name = name || category.name;
      category.description = description || category.description;

      // Save the updated category to the database
      const updatedCategory = await category.save();

      // Send the updated category details as a response
      res
        .status(200)
        .json({ message: "Category updated succesfully", updatedCategory });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];
