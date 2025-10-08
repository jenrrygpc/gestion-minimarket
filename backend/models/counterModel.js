const mongoose = require('mongoose');

const counterSchema = mongoose.Schema({
  key: { type: String, required: true, unique: true }, // Ej: "BOLETA-B001"
  seq: { type: Number, default: 0 },  

},{
  timestamps: true
});


module.exports = mongoose.model('Counter', counterSchema);
