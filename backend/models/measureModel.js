const mongoose = require('mongoose');

const measureSchema = mongoose.Schema({  
  abbreviation: {
    type: String,
    required: [true, 'Please enter an abbreviation'],
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Please enter a description']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
}, {
  timestamps: true
});


module.exports = mongoose.model('Measure', measureSchema);
