const mongoose = require('mongoose');

const productStockSchema = mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductsV2',
    required: true
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, 'El stock debe ser un número positivo.']
  },
  minimumStock: {
    type: Number,
    default: 0,
    min: [0, 'El stock mínimo debe ser un número positivo.']
  },
  price: {
    type: Number,
    min: [0, 'El precio debe ser un número positivo.']
  },
  averageCost: {
    type: Number,
    default: 0,
    min: 0
  },
  lastCost: {
    type: Number,
    default: 0,
    min: 0
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

//productStockSchema.index({ updatedAt: 1 });
productStockSchema.index({ productId: 1, storeId: 1 }, { unique: true });


module.exports = mongoose.model('ProductStock', productStockSchema);
