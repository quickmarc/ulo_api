const mongoose = require('mongoose')

// Define the model schema
const schema = new mongoose.Schema({
  name: String,
  description: String,
  country: { type: String, required: true },
  city: { type: String, required: true },
  street: { type: String, required: true },
  zipcode: { type: String, required: true },
  reasons: [String],
  amenities: [String],
  images: [String],
  bedrooms: { type: Number, min: 0 },
  bathrooms: { type: Number, min: 0 },
  kitchen: { type: Number, min: 0 },
  type: { type: String, required: true },
  built_at: Date,
  size: Number,
  price: Number,
  location: {
    lat: Number,
    long: Number,
  },
  owner: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  documents: [{ label: String, path: String }],
  active: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
  published: { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model('Property', schema)