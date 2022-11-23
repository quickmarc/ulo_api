const mongoose = require('mongoose')

// Define the model schema
const schema = new mongoose.Schema({
  reference: { type: String, unique: true, max: 8 },
  code: { type: String, required: true, unique: true },
  business: { type: mongoose.Types.ObjectId, ref: 'Business', required: true },
  beneficiary: { type: mongoose.Types.ObjectId, ref: 'Beneficiary', required: true },
  client: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  items: [{
    type: { type: String, enum: ['service', 'product'], required: true },
    item: { type: mongoose.Types.ObjectId, required: true },
    amount: { type: Number, min: 1, required: true },
    price: { type: Number, min: 0, required: true },
    options: [{
      option: mongoose.Types.ObjectId,
      price: Number,
    }],
  }],
  price: { type: Number, min: 0, required: true },
  payment: { type: mongoose.Types.ObjectId, ref: 'Payment' },
  status: { type: String, enum: ['awaiting', 'placed', 'accepted', 'rejected', 'packaged', 'delivered', 'cancelled'], default: 'placed' },
  note: { type: String, default: '' },
}, { timestamps: true })

module.exports = mongoose.model('Order', schema)