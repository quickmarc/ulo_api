const mongoose = require('mongoose')

// Define the model schema
const schema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  categories: [{ type: String, required: true }],
  price: { type: Number, min: 0 }, 
  hero: { type: String, required: true },
  user: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  business: { type: mongoose.Types.ObjectId, ref: 'Business', required: true },
  images: [String],
  priority: { type: Number, min: 0, default: 0 },
  options: [{ category: String, label: String, price: Number }],
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
}, { timestamps: true })

module.exports = mongoose.model('Product', schema)