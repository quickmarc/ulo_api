const mongoose = require('mongoose')

// TODO: change default status to pending on prod
// Define the model schema
const schema = new mongoose.Schema({
    code: { type: String, required: true },
    percentage: { type: Number },
    numberUsages: { type: Number },
    deadline: { type: Date }
}, { timestamps: true })

module.exports = mongoose.model('Code', schema)