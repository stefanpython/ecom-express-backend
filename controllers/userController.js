const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Cart = require("../models/Cart");
const { body, param, validationResult } = require("express-validator");
const passport = require("passport");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

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

    res.cookie("token", token, {
      // httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      // credentials: true,
    });

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

// Get user details
exports.get_user_details = [
  // Validate user ID
  param("userId").isMongoId().withMessage("Invalid User ID"),

  // Check for validation errors
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ errors: validationErrors.array() });
    }

    try {
      // Extract the user ID from the request parameters
      const { userId } = req.params;

      // Find the user by ID in the database, excluding the password field
      const user = await User.findById(userId).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Send the user details as a response
      res.status(200).json({ message: "Get user details success", user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

// Implement reset password

// Generate a random token
const generateToken = () => crypto.randomBytes(20).toString("hex");

// Nodemailer setup for testing with Ethereal
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "lesley.cummings@ethereal.email",
    pass: "qvauTa9mHhDZAKuyyc",
  },
});

// Forgot Password
exports.forgotPassword = [
  // Validate email
  body("email").isEmail().withMessage("Invalid email"),

  // Process the password reset request
  async (req, res) => {
    const { email } = req.body;

    try {
      // Find user by email
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate and save a password reset token
      const resetToken = generateToken();
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; // Token valid for 1 hour
      await user.save();

      // Send the password reset link to the user's email
      const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
      const mailOptions = {
        from: "noreply@example.com", // Replace with your sender email
        to: email,
        subject: "Password Reset",
        html: `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset your password.</p>`,
      };

      // Use transporter to send the email
      await transporter.sendMail(mailOptions);

      res.status(200).json({ message: "Password reset email sent" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

// UPDATE details of a specific user
exports.update_user_details = [
  // Validate user ID
  param("userId").isMongoId().withMessage("Invalid User ID"),

  // Validation middleware using express-validator
  body("firstName").notEmpty().withMessage("First name cannot be empty"),
  body("lastName").notEmpty().withMessage("Last name cannot be empty"),

  // Check for validation errors
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ errors: validationErrors.array() });
    }

    try {
      // Extract the user ID from the request parameters
      const { userId } = req.params;

      // Destructure fields from the request body
      const { firstName, lastName } = req.body;

      // Find the user by ID in the database
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update user fields
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;

      // Save the updated user to the database
      const updatedUser = await user.save();

      // Send the updated user details as a response
      res
        .status(200)
        .json({ message: "User updated successfully", updatedUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];
