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
