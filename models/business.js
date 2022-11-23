const mongoose = require('mongoose')

// Define the model schema
const schema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  country: { type: String, required: true },
  city: { type: String, required: true },
  street: { type: String, required: true },
  services: [{
    service: { type: mongoose.Types.ObjectId, ref: 'Service' },
    price: { type: Number, min: 0 },
    options: [{ label: String, price: Number }],
  }],
  products: [{ type: mongoose.Types.ObjectId, ref: 'Product' }],
  job_type: { type: mongoose.Types.ObjectId, ref: 'JobType', required: true },
  owner: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  logo: String,
  website: String,
  documents: [{ label: String, path: String }],
  active: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model('Business', schema)