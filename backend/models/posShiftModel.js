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
    type: Date
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
  },
  updaterUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('PosShift', posShiftSchema);
