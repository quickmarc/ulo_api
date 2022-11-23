const mongoose = require('mongoose')

// TODO: change default status to pending on prod
// Define the model schema
const schema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: mongoose.Types.ObjectId, ref: 'JobType', required: true },
  description: String,
  price: { type: Number, min: 0 },
  image: String,
  priority: { type: Number, min: 0, default: 0 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
}, { timestamps: true })

module.exports = mongoose.model('Service', schema)