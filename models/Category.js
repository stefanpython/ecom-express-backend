const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = {
  name: { type: String, required: true },
  description: String,
};

module.exports = mongoose.model("Category", categorySchema);
