const mongoose = require('mongoose')

// TODO: change default status to pending on prod
// Define the model schema
const schema = new mongoose.Schema({
    message: { type: String, required: true },
    country: { type: String, required: true, default: 'all'}
}, { timestamps: true })

module.exports = mongoose.model('Push', schema)