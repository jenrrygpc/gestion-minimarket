const mongoose = require('mongoose');

const reasonTransactionSchema = mongoose.Schema({
  code: {
    type: String,
    required: [true, 'El código es requerido'],
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    unique: true, // Asegura que no haya dos motivos con el mismo nombre.
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  // REGLA 1: Define si el movimiento es de ENTRADA o SALIDA.
  // Permite filtrar los motivos en el frontend.
  transactionType: {
    type: String,
    required: [true, 'El tipo de transacción es requerido'],
    enum: ['ENTRADA', 'SALIDA', 'AMBOS'],
    index: true
  },
  // REGLA 2: Define si este motivo debe recalcular el costo promedio.
  // Típicamente, solo las compras ('PURCHASE') lo harán.
  affectsCost: {
    type: Boolean,
    default: false
  },
  // REGLA 3: Define si es obligatorio adjuntar un número de documento.
  // Útil para compras, devoluciones a proveedor o transferencias.
  requiresDocument: {
    type: Boolean,
    default: false
  },
  enabled: {
    type: Boolean,
    default: true,
    index: true
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

reasonTransactionSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('ReasonTransaction', reasonTransactionSchema);
