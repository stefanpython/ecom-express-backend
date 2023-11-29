const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstName: String,
  lastName: String,
  email: { type: String, required: true },
  password: { type: String, required: true },
  review: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  address: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }],
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
});

userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model("User", userSchema);
