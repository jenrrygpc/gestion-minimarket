const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product'
  },
  // used to set barcode
  code: {
    type: Number,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Please enter a description']
  },
  measure: {
    type: String,
    required: true,
    default: 'UN'
  },
  price: {
    type: Number,
    required: [true, 'Please enter a price']
  },
  stock: {
    type: Number,
    default: 0
  },
  minimumStock: {
    type: Number,
    default: 0
  },
  taxExempt: {
    type: Boolean,
    default: false
  },
  discount: {
    type: Number,
    default: 0
  },
  requiresParameter: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});


module.exports = mongoose.model('ProductSale', productSchema);
