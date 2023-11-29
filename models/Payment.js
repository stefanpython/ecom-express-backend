const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const paymentSchema = {
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  amount: { type: Number, required: true },
  paymentMethod: String,
  status: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now },
};

module.exports = mongoose.model("Payment", paymentSchema);
