const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const addressSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  addressLine1: String,
  postalCode: String,
  phone: Number,
});

module.exports = mongoose.model("Address", addressSchema);
