const mongoose = require('mongoose');

const inventorySchema = mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductsV2'
  },
  // CAMPO "REPETIDO" INTENCIONALMENTE:
  // Se guarda para optimizar consultas y garantizar la integridad histórica.
  transactionType: {
    type: String,
    required: [true, 'Ingresar tipo de transacción.'],
    enum: ['ENTRADA', 'SALIDA'],
    index: true
  },
  reasonTransactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReasonTransaction',
    required: [true, 'Ingresar motivo de la transacción.'],
    index: true
  },
  quantity: {
    type: Number,
    required: [true, 'Ingresar cantidad de productos.'],
    min: [0, 'La cantidad debe ser un número positivo.']
  },
  price: {
    type: Number,
    min: [0, 'El precio debe ser un número positivo.']
  },
  cost: {
    type: Number,
    min: [0, 'El costo debe ser un número positivo.']
  },
  // SNAPSHOT DE AUDITORÍA:
  // Guarda el estado del stock antes y después del movimiento.
  previousStock: {
    type: Number,
    required: true
  },
  newStock: {
    type: Number,
    required: true
  },
  document: {
    type: String,
    trim: true
  },
  // REFERENCIAS A DOCUMENTOS ORIGEN:
  // `saleId` es un caso específico. `referenceId` es más genérico.
  saleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sale',
    index: true
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'referenceType',
    index: true
  },
  // ✅ CAMBIO: El enum ha sido eliminado. Ahora es un simple String.
  referenceType: {
    type: String,
    trim: true
    // El enum: ['Sale', 'Purchase', 'Transfer', 'Adjustment', null] se elimina.
  },
  notes: {
    type: String,
    trim: true
  },
  transactionDate: {
    type: Date,
    default: Date.now,
    index: true
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

// MIDDLEWARE DE VALIDACIÓN:
// El "guardián" que asegura la integridad de los datos antes de guardarlos.
inventorySchema.pre('save', async function(next) {
  if (this.isNew) { // Solo ejecutar en la creación de un nuevo documento
    try {
      // --- VALIDACIÓN 1: Coherencia del Motivo de la Transacción ---
      const Reason = mongoose.model('ReasonTransaction');
      const reason = await Reason.findById(this.reasonTransactionId);

      if (!reason) {
        return next(new Error('El motivo de la transacción no existe.'));
      }
      if (reason.transactionType !== 'AMBOS' && reason.transactionType !== this.transactionType) {
        return next(new Error(`El motivo "${reason.name}" no es válido para transacciones de tipo ${this.transactionType}.`));
      }
      if (reason.requiresDocument && !this.document) {
        return next(new Error(`El motivo "${reason.name}" requiere un número de documento.`));
      }

      // --- VALIDACIÓN 2: Coherencia del Tipo de Documento de Referencia ---
      if (this.referenceType) {
        const DocumentType = mongoose.model('DocumentType');
        const docType = await DocumentType.findOne({ modelName: this.referenceType, enabled: true });

        if (!docType) {
          return next(new Error(`El tipo de referencia "${this.referenceType}" no es válido o no está habilitado.`));
        }
      }

      // --- VALIDACIÓN 3: Coherencia Matemática del Stock ---
      const expectedNewStock = this.transactionType === 'ENTRADA'
        ? this.previousStock + this.quantity
        : this.previousStock - this.quantity;

      if (Math.abs(this.newStock - expectedNewStock) > 0.001) { // Tolerancia para decimales
        return next(new Error(`Inconsistencia de stock. Esperado: ${expectedNewStock}, Recibido: ${this.newStock}.`));
      }

    } catch (error) {
      return next(error);
    }
  }
  next();
});

// ÍNDICES PARA OPTIMIZAR CONSULTAS
inventorySchema.index({ storeId: 1, productId: 1, transactionDate: -1 });
inventorySchema.index({ reasonTransactionId: 1, transactionDate: -1 });
inventorySchema.index({ referenceId: 1, referenceType: 1 });

module.exports = mongoose.model('Inventory', inventorySchema);
