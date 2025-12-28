const mongoose = require('mongoose');

const posShiftSchema = mongoose.Schema({
  status: {
    type: String,
    required: [true, 'Ingresar estado de la caja.'],
    enum: ['ABIERTO', 'CERRADO']
  },
  shiftStart: {
    type: Date,
    required: [true, 'Ingresar fecha de inicio de turno.'],
    //default: Date.now
  },
  shiftEnd: {
    type: Date,
    required: [false, 'Ingresar fecha de fin de turno.']
  },
  initialAmount: {
    type: Number,
    required: [true, 'Ingresar monto inicial.'],
    min: [0, 'El monto inicial debe ser un número positivo.']
  },
  finalAmount: {
    type: Number,
    min: [0, 'El monto final debe ser un número positivo.']
  },
  totalSalesAmount: {
    type: Number,
    min: [0, 'El monto final debe ser un número positivo.']
  },
  totalSalesCount: {
    type: Number,
    default: 0,
    min: [0, 'El número de ventas debe ser positivo.']
  },
  totalChangeAmount: {
    type: Number,
    default: 0,
    min: [0, 'El monto de vueltos debe ser positivo.']
  },
  cashAmount: {
    type: Number,
    default: 0,
    comment: 'Total en efectivo'
  },
  digitalWalletAmount: {
    type: Number,
    default: 0,
    comment: 'Total en billeteras digitales: Yape, Plin, etc.'
  },
  cardAmount: {
    type: Number,
    default: 0,
    comment: 'Total en tarjetas'
  },
  transferAmount: {
    type: Number,
    default: 0,
    comment: 'Total en transferencias'
  },
  otherPaymentsAmount: {
    type: Number,
    default: 0,
    comment: 'Otros métodos de pago'
  },
  
  // ========== ARQUEO DE CAJA ==========
  // Montos REALES contados físicamente por el cajero
  realCashAmount: {
    type: Number,
    default: 0,
    comment: 'Efectivo real contado al cierre'
  },
  realCardAmount: {
    type: Number,
    default: 0,
    comment: 'Vouchers de tarjetas reales al cierre'
  },
  realDigitalWalletAmount: {
    type: Number,
    default: 0,
    comment: 'Billeteras digitales reales al cierre (Yape, Plin, etc.)'
  },
  realTransferAmount: {
    type: Number,
    default: 0,
    comment: 'Transferencias reales al cierre'
  },
  realOtherAmount: {
    type: Number,
    default: 0,
    comment: 'Otros pagos reales al cierre'
  },
  // Diferencias calculadas (real - esperado)
  cashDifference: {
    type: Number,
    default: 0,
    comment: 'Diferencia en efectivo (positivo = sobrante, negativo = faltante)'
  },
  cardDifference: {
    type: Number,
    default: 0,
    comment: 'Diferencia en tarjetas'
  },
  digitalWalletDifference: {
    type: Number,
    default: 0,
    comment: 'Diferencia en billeteras digitales'
  },
  transferDifference: {
    type: Number,
    default: 0,
    comment: 'Diferencia en transferencias'
  },
  totalDifference: {
    type: Number,
    default: 0,
    comment: 'Diferencia total en caja'
  },
  arqueoNotes: {
    type: String,
    trim: true,
    comment: 'Observaciones del arqueo de caja'
  },
  closedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    comment: 'Usuario que cerró la caja'
  },

  enabled: {
    type: Boolean,
    default: true
  },
  posId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Pos'
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Store'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PosShift', posShiftSchema);
