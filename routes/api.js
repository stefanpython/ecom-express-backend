var express = require("express");
var router = express.Router();
const passport = require("passport");
const user_controller = require("../controllers/userController");
const product_controller = require("../controllers/productController");
const order_controller = require("../controllers/orderController");
const cart_controller = require("../controllers/cartController");
const category_controller = require("../controllers/categoryController");
const review_controller = require("../controllers/reviewController");
const address_controller = require("../controllers/addressController");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

// USER ROUTES
router.post("/sign-up", user_controller.signup);
router.post("/login", user_controller.login);

//------------------ PRODUCT ROUTES --------------------

// -- Create product --
router.post(
  "/create_product",
  passport.authenticate("jwt", { session: false }),
  product_controller.create_product
);

// -- Get list of all products --
router.get("/product_list", product_controller.product_list);

// -- Get details of a product --
router.get("/product/:productId", product_controller.get_product_details);

// -- Update details of a product --
router.put(
  "/update_product/:productId",
  passport.authenticate("jwt", { session: false }),
  product_controller.update_product_details
);

// -- Delete a product --
router.delete(
  "/delete_product/:productId",
  passport.authenticate("jwt", { session: false }),
  product_controller.delete_product
);

// ----------------- ORDER ROUTES -------------------

// -- Create a new order --
router.post(
  "/create_order",
  passport.authenticate("jwt", { session: false }),
  order_controller.order_create
);

// -- Get list of all orders
router.get(
  "/order_list",
  passport.authenticate("jwt", { session: false }),
  order_controller.order_list
);

// -- Get details of a specific order
router.get(
  "/order/:orderId",
  passport.authenticate("jwt", { session: false }),
  order_controller.get_order_details
);

// -- Update the status of a specific order
router.put(
  "/update_order/:orderId",
  passport.authenticate("jwt", { session: false }),
  order_controller.update_order_details
);

// -- Delete an order
router.delete(
  "/delete_order/:orderId",
  passport.authenticate("jwt", { session: false }),
  order_controller.delete_order
);

// ------------------- CART ROUTES ---------------------

// -- Add a product to the user's cart --
router.post("/add_cart_guest", cart_controller.add_product_to_cart);
router.post(
  "/add_cart_auth",
  passport.authenticate("jwt", { session: false }),
  cart_controller.add_product_to_cart
);

//                    -------------
// Get the user's cart contents for a guest
router.get("/cart_guest", cart_controller.get_cart_content);

// Get the user's cart contents for an authenticated user
router.get(
  "/cart_user",
  passport.authenticate("jwt", { session: false }),
  cart_controller.get_cart_content
);

//                   --------------
// Update the quantity of a product in the authenticated user`s cart
router.put(
  "/cart/update_auth/:productId",
  passport.authenticate("jwt", { session: false }),
  cart_controller.update_cart_quantity
);

// Update the quantity of a product in the guest's cart
router.put(
  "/cart/update_guest/:productId",
  cart_controller.update_cart_quantity
);

//                   --------------
// Remove a product from the authenticated user's cart
router.delete(
  "/cart/remove_auth/:productId",
  passport.authenticate("jwt", { session: false }),
  cart_controller.remove_product_cart
);

// Remove a product from the guest user's cart
router.delete(
  "/cart/remove_guest/:productId",
  cart_controller.remove_product_cart
);

//                   --------------
// Clear the entire cart for the authenticated user
router.delete(
  "/cart/clear_auth",
  passport.authenticate("jwt", { session: false }),
  cart_controller.clear_cart
);

// Clear the entire cart for the guest user
router.delete("/cart/clear_guest", cart_controller.clear_cart);

// ------------------- CATEGORY ROUTES ---------------------

// Create a new category
router.post("/categories", category_controller.create_category);

// Get list with all categories
router.get("/category_list", category_controller.category_list);

// Get details of a category
router.get("/category/:categoryId", category_controller.get_category_details);

// Update a specific category
router.put(
  "/update_category/:categoryId",
  passport.authenticate("jwt", { session: false }),
  category_controller.update_category
);

// Delete a category and update associated products
router.delete(
  "/category/:categoryId",
  passport.authenticate("jwt", { session: false }),
  category_controller.delete_category
);

// ------------------- REVIEW ROUTES ---------------------

// Create a new review for a product
router.post(
  "/review/create/:productId",
  passport.authenticate("jwt", { session: false }),
  review_controller.create_review
);

// Get reviews for a product
router.get("/review/product/:productId", review_controller.get_product_reviews);

// Get reviews by a specific user
router.get("/review/user/:userId", review_controller.get_user_reviews);

// Update a review
router.put(
  "/update_review/:reviewId",
  passport.authenticate("jwt", { session: false }),
  review_controller.update_review
);

// Delete a review
router.delete("/review/:reviewId", review_controller.delete_review);

// ------------------- ADDRESS ROUTES ---------------------

// Create a new address for a user
router.post(
  "/address/",
  passport.authenticate("jwt", { session: false }),
  address_controller.create_user_address
);

// Get a list of all user addresses
router.get(
  "/address_list",
  passport.authenticate("jwt", { session: false }),
  address_controller.address_list
);

// Get details of a specific address
router.get("/address/:addressId", address_controller.get_address_details);

// Update details of a specific address
router.put(
  "/update_address/:addressId",
  passport.authenticate("jwt", { session: false }),
  address_controller.update_address_details
);

// Delete an address
router.delete("/address/:addressId", address_controller.delete_address);

module.exports = router;

// TODO:
// Address Routes:
//     Create a new address for a user - DONE
//     Get a list of all user addresses - DONE
//     Get details of a specific address - DONE
//     Update details of a specific address - DONE
//     Delete an address
