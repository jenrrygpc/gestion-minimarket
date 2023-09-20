const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  description: {
    type: String,
    required: [true, 'Please enter a description']
  },
  presentation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Presentation'
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand'
  }
}, {
  timestamps: true
});


module.exports = mongoose.model('Product', productSchema);
