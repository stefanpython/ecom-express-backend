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
