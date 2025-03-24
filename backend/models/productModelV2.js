const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  },
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
    required: [true, 'Please enter a description']
  },
  display: {
    type: String,
    required: [true, 'Please enter a display']
  },
  category: {
    type: String,
    required: [true, 'Please enter a category']
  },
  price: {
    type: Number,
    required: [true, 'Please enter a price']
  },
  cost: {
    type: Number
  },
  stock: {
    type: Number,
    default: 0
  },
  minimumStock: {
    type: Number,
    default: 0
  },
  taxFree: {
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
  },
  enabled: {
    type: Boolean,
    default: true
  },
  updatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

productSchema.index({ updatedAt: 1 });


module.exports = mongoose.model('ProductsV2', productSchema);
