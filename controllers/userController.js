const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Cart = require("../models/Cart");
const { body } = require("express-validator");
const passport = require("passport");

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

    // Confirm password
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
      const hashedPassword = await bcrypt.hash(password, 10);

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

// LogIn
exports.login = async (req, res, next) => {
  passport.authenticate("login", async (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: "Internal server error" });
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token for successful authentication
    const token = jwt.sign(
      { userId: user.id, username: user.fullName },
      "tao",
      { expiresIn: "7days" }
    );

    // Check if there is a guest cart
    const guestCart = await Cart.findOne({ user: null });

    if (guestCart) {
      // Update the guest cart with the authenticated user's ID
      guestCart.user = user.id;
      await guestCart.save();
    }

    res.json({ message: "Login successful", token });
  })(req, res, next);
};
