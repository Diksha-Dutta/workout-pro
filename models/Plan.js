const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
  day: { type: String, required: true },
  workout: { type: String, required: true },
});

module.exports = mongoose.model("Plan", planSchema);
