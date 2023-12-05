var express = require("express");
var router = express.Router();
const passport = require("passport");
const user_controller = require("../controllers/userController");
const product_controller = require("../controllers/productController");
const order_controller = require("../controllers/orderController");
const cart_controller = require("../controllers/cartController");

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

router.post(
  "/add_to_cart",
  passport.authenticate("jwt", { session: false }),
  cart_controller.add_product_to_cart
);

module.exports = router;

// TODO:      Cart Routes:
//              Add a product to the user's cart
//              Get the user's cart contents
//              Update the quantity of a product in the cart
//              Remove a product from the cart
//              Clear the entire cart
