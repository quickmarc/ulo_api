const mongoose = require('mongoose')

// TODO: change default status to pending on prod
// Define the model schema
const schema = new mongoose.Schema({
  value: { type: Number, required: true },
}, { timestamps: true })

module.exports = mongoose.model('Percentage', schema)