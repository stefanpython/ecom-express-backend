const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = {
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
};

module.exports = mongoose.model("Cart", cartSchema);
