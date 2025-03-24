const mongoose = require('mongoose');

const posSchema = mongoose.Schema({  
  name: {
    type: String,
    required: [true, 'Por favor ingrese un nombre']
  },
  enabled: {
    type: Boolean,
    default: true
  },
  store: {
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

posSchema.index({ name: 1, store: 1 }, { unique: true });

module.exports = mongoose.model('Pos', posSchema);
