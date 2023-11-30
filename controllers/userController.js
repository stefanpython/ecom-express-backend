const bycrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { body } = require("express-validator");

// Signup
exports.signup = [
  // Sanitize inputs
  body("firstName").trim().escape(),
  body("lastName").trim().escape(),
  body("email").trim().escape().isEmail(),
  body("password").trim().escape().isLength({ min: 3 }),

  // Validate and create user in db
  async (req, res) => {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    console.log(password, confirmPassword);

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    try {
      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Encrypt password
      const hashedPassword = await bycrypt.hash(password, 10);

      // Create new user
      const newUser = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
      });

      // Save new user
      const savedUser = await newUser.save();

      res.status(200).json({ message: "User created succesfully", savedUser });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];
