const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  date: {
    type: String, 
    required: true,
    unique: true,
  },
  task: {
    type: String,
    required: true,
  },
  completed: { type: Boolean, default: false },
  
},{ timestamps: true });

module.exports = mongoose.model("Schedule", scheduleSchema);
