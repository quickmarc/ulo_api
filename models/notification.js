const mongoose = require('mongoose')

// Define the model schema
const schema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: { type: String, enum: ['list', 'push'], default: 'list' },
  to: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  seen: { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model('Notification', schema)