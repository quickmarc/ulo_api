const mongoose = require('mongoose')

// Define the model schema
const schema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  image: String,
}, { timestamps: true })

module.exports = mongoose.model('JobType', schema)