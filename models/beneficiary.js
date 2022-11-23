const mongoose = require('mongoose')

// Define the model schema
const schema = new mongoose.Schema({
  full_name: { type: String, required: true },
  phone: { type: String, required: true },
  email: String,
  address: String,
}, { timestamps: true })

module.exports = mongoose.model('Beneficiary', schema)