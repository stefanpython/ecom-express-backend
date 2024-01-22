const { body, param, validationResult } = require("express-validator");
const Address = require("../models/Address");
const User = require("../models/User");

// CREATE a new address for a user
exports.create_user_address = [
  // Validation middleware using express-validator
  body("addressLine").notEmpty().withMessage("Address line cannot be empty"),
  body("postalCode")
    .isNumeric()
    .notEmpty()
    .withMessage("Postal code cannot be empty"),
  body("phone").isNumeric().withMessage("Phone must be a number"),

  // Check for validation errors
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ errors: validationErrors.array() });
    }

    try {
      // Destructure fields from the request body
      const { addressLine, postalCode, phone } = req.body;
      //   const { _id: user } = req.user;
      const user = req.user._id; // Use the authenticated user's ID

      // Create a new address
      const newAddress = new Address({ user, addressLine, postalCode, phone });

      // Save the new address to the database
      const savedAddress = await newAddress.save();

      // Update the user document to include the new address
      await User.findByIdAndUpdate(
        user,
        { $push: { address: savedAddress._id } },
        { new: true }
      );

      // Send the newly created address details as a response
      res.status(201).json({
        message: "Address created successfully",
        address: savedAddress,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

// GET a list of addresses
exports.address_list = async (req, res) => {
  try {
    // Retrieve all addresses from the database
    const addresses = await Address.find();

    res.status(200).json({ message: "List retrieved successfully", addresses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET details of a specific address
exports.get_address_details = [
  // Validate address ID
  param("addressId").isMongoId().withMessage("Invalid Address ID"),

  // Check for validation errors
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ errors: validationErrors.array() });
    }

    try {
      // Extract the address ID from the request parameters
      const { addressId } = req.params;

      // Find the address by ID in the database
      const address = await Address.findById(addressId);

      if (!address) {
        return res.status(404).json({ message: "Address not found" });
      }

      // Send the address details as a response
      res.status(200).json({ message: "Get request is a success", address });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

// UPDATE details of a specific address
exports.update_address_details = [
  // Validate address ID
  param("addressId").isMongoId().withMessage("Invalid Address ID"),

  // Validation middleware using express-validator
  body("addressLine").notEmpty().withMessage("Address line cannot be empty"),
  body("postalCode")
    .isNumeric()
    .notEmpty()
    .withMessage("Postal code cannot be empty"),
  body("phone").isNumeric().withMessage("Phone must be a number"),

  // Check for validation errors
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ errors: validationErrors.array() });
    }

    try {
      // Extract the address ID from the request parameters
      const { addressId } = req.params;

      // Destructure fields from the request body
      const { addressLine, postalCode, phone } = req.body;

      // Find the address by ID in the database
      const address = await Address.findById(addressId);

      if (!address) {
        return res.status(404).json({ message: "Address not found" });
      }

      // Update address fields
      address.addressLine = addressLine || address.addressLine;
      address.postalCode = postalCode || address.postalCode;
      address.phone = phone || address.phone;

      // Save the updated address to the database
      const updatedAddress = await address.save();

      // Send the updated address details as a response
      res
        .status(200)
        .json({ message: "Address updated successfully", updatedAddress });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

// DELETE an address
exports.delete_address = [
  // Validation middleware for addressId
  param("addressId").isMongoId().withMessage("Invalid addressId"),

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
      const { addressId } = req.params; // Extract addressId from the URL parameter

      // Find the product by addressId and delete it
      const result = await Address.deleteOne({ _id: addressId });

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Address not found" });
      }

      res.status(200).json({ message: "Address deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];
