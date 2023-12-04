var express = require("express");
var router = express.Router();
const passport = require("passport");
const user_controller = require("../controllers/userController");
const product_controller = require("../controllers/productController");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

// USER ROUTES
router.post("/sign-up", user_controller.signup);
router.post("/login", user_controller.login);

// PRODUCT ROUTES

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

module.exports = router;

// TODO:  - Create a new product - DONE
//        - Get a list of all products - DONE
//        - Get details of a specific product - DONE
//        - Update details of a specific product - DONE
//        - Delete a product - DONE
