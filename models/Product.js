const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = {
  name: String,
  description: String,
  price: Number,
  quantity: Number,
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  image: String,
};

module.exports = mongoose.model("Product", productSchema);
