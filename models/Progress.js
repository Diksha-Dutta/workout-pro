const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  weeklyProgress: { 
    type: [Boolean], 
    default: [false, false, false, false, false, false, false],
    validate: {
      validator: function (array) {
        return array.length === 7; 
      },
      message: "weeklyProgress must contain exactly 7 days."
    }
  },
  weekStart: { type: Date, default: () => getWeekStart() } 
}, { timestamps: true });


function getWeekStart() {
  const today = new Date();
  const dayOfWeek = today.getDay(); 
  const daysSinceSunday = dayOfWeek; 
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - daysSinceSunday); 
  weekStart.setHours(0, 0, 0, 0); 
  return weekStart;
}

module.exports = mongoose.model("Progress", progressSchema);