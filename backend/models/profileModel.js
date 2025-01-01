const mongoose = require('mongoose');

const profileSchema = mongoose.Schema({
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

profileSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('Profile', profileSchema);
