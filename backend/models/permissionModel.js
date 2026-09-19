const mongoose = require('mongoose');

const permissionSchema = mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Please enter a code'],
    uppercase: true,
    trim: true
  },
  module: {
    type: String,
    required: [true, 'Please enter a module']
  },
  type: {
    type: String,
    enum: ['API', 'MENU'],
    default: 'API'
  },
  description: {
    type: String,
    default: ''
  },
  enabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

permissionSchema.index({ code: 1 }, { unique: true });

module.exports = mongoose.model('Permission', permissionSchema);
