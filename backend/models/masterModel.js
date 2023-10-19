const mongoose = require('mongoose');

const masterSchema = mongoose.Schema({  
  type: {
    type: String,
    required: [true, 'Please enter an type']
  },
  name: {
    type: String,
    required: [true, 'Please enter a name']
  },
  description: {
    type: String,
    default: ''
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
}, {
  timestamps: true
});

masterSchema.index({ type: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Master', masterSchema);
