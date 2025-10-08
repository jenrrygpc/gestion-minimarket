const mongoose = require('mongoose');


const customerSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  documentNumber: {
    type: String
  },
  names: {
    type: String
  }
}, { _id: false });

const productSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  code: { type: String, required: true },
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  measure: { type: String, required: true },
  subtotal: { type: Number, required: true }
}, { _id: false });

const paymentSchema = new mongoose.Schema({
  metodoPago: { type: String, required: true },
  montoPago: { type: Number, required: true },
  codigoOperacion: { type: String }
}, { _id: false });

const saleSchema = mongoose.Schema({
  documentType: {
    type: String,
    required: [true, 'Ingresar tipo de documento.'],
    enum: ['BOLETA', 'FACTURA', 'TICKET']
  },
  documentNumber: {
    type: String,
    required: [true, 'Ingresar número de documento.'],
    unique: true
  },
  serie: {
    type: String,
    required: [true, 'Ingresar serie de documento.']
  },
  correlativo: {
    type: Number,
    required: [true, 'Ingresar número correlativo.']
  },
  date: {
    type: Date,
    default: Date.now
  },
  posShiftId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PosShift',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  customer: customerSchema,
  products: [productSchema],
  subtotalAmount: {
    type: Number,
    required: [true, 'Ingresar monto subtotal.']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Ingresar monto total.']
  },
  taxAmount: {
    type: Number,
    required: [true, 'Ingresar monto de impuesto.']
  },
  changeAmount: {
    type: Number,
    default: 0
  },
  payments: [paymentSchema],
  status: {
    type: String,
    required: [true, 'Ingresar estado de la venta.'],
    enum: ['REGISTERED', 'INVENTORIED', 'COMPLETED', 'FAILED', 'CANCELED'],
    default: 'REGISTERED'
  },
  enabled: {
    type: Boolean,
    default: true
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
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

module.exports = mongoose.model('Sale', saleSchema);
