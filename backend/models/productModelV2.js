const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  code: {
    type: Number,
    required: [true, 'Please enter a code'],
    unique: true
  },
  measure: {
    type: String,
    required: [true, 'Please enter a measure']
  },
  description: {
    type: String,
    required: [true, 'Please enter a description'],
    index: 'text'
  },
  display: {
    type: String,
    required: [true, 'Please enter a display']
  },
  category: {
    type: String,
    required: [true, 'Please enter a category']
  },
  basePrice: {
    type: Number,
    //required: [true, 'Please enter a price']
  },
  baseCost: {
    type: Number
  },
  taxFree: { // not implemented yet
    type: Boolean,
    default: false
  },
  discount: { // not implemented yet
    type: Number,
    default: 0
  },
  requiresParameter: { // not implemented yet
    type: Boolean,
    default: false
  },
  enabled: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

productSchema.index({ updatedAt: 1 });


module.exports = mongoose.model('ProductsV2', productSchema);
