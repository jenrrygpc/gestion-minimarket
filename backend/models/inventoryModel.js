const mongoose = require('mongoose');

const inventorySchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductsV2'
  },
  transactionType: {
    type: String,
    required: [true, 'Ingresar tipo de transacción.'],
    enum: ['ENTRADA', 'SALIDA']
  },
  reasonTransaction: {
    type: String,
    required: [true, 'Ingresar motivo de la transacción.']
  },
  quantity: {
    type: Number,
    required: [true, 'Ingresar cantidad de productos.'],
    min: [0, 'La cantidad debe ser un número positivo.']
  },
  price: {
    type: Number,
    min: [0, 'El precio debe ser un número positivo.']
  },
  cost: {
    type: Number,
    min: [0, 'El costo debe ser un número positivo.']
  },
  document: {
    type: String,
    required: false
  },
  transactionDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Inventory', inventorySchema);
