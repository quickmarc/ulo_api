const mongoose = require('mongoose')

// Define the model schema
const schema = new mongoose.Schema({
  code: String,
  first_name: { type: String, required: true },
  last_name: String,
  phone: { type: String, required: true, unique: true },
  email: { type: String, unique: true },
  country: { type: String, default: 'cameroon' },
  city: String,
  address: String,
  password: { type: String, required: true },
  photo: String,
  admin: { type: Boolean, default: false },
  active: { type: Boolean, default: true }, // TODO: sets default to false in prod
  visible: { type: Boolean, default: true },
}, { timestamps: true })

module.exports = mongoose.model('User', schema)