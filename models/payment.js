const mongoose = require('mongoose')

// Define the model schema
const schema = new mongoose.Schema({
  payment_id: { type: String, unique: true, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  status: { type: String, required: true },
  user: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  confirmed_with: { type: mongoose.Types.ObjectId, ref: 'PaymentMethod' },
}, { timestamps: true })

module.exports = mongoose.model('Payment', schema)