const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ingresa el nombre de la categoría'],
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Ingresa una descripción de la categoría']
  },
  prefix: {
    type: String,
    required: [true, 'Ingresa un prefijo para la categoría'],
    unique: true
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

categorySchema.index({ name: 1 });

module.exports = mongoose.model('Category', categorySchema);
