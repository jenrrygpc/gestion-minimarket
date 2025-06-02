const mongoose = require('mongoose');

const customerSchema = mongoose.Schema({
  documentNumber: {
    type: String,
    required: [true, 'Ingresar número de documento'],
    unique: true
  },
  names: {
    type: String,
    required: [true, 'Ingresar nombres y apellidos'],
  },
  email: {
    type: String,
  },
  address: {
    type: String,
  },
  cellphone: {
    type: String,
  },
  enabled: {
    type: Boolean,
    default: true
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

customerSchema.index({ documentNumber: 1 }, { unique: true });

module.exports = mongoose.model('Customer', customerSchema);
