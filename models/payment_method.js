const mongoose = require('mongoose')

// Define the model schema
const schema = new mongoose.Schema({
  method: { type: String, enum: ['card', 'paypal', 'apple'], default: 'card' },
  reference: { type: String, unique: true },
  last_digits: String,
  exp_month: Number,
  exp_year: Number,
  owner: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  active: { type: Boolean, default: true },
}, { timestamps: true })

module.exports = mongoose.model('PaymentMethod', schema)