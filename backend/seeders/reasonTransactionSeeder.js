/**
 * Seeder para Reason Transactions
 * 
 * Este script inserta los motivos de transacción esenciales en la base de datos.
 * Ejecutar con: node backend/seeders/reasonTransactionSeeder.js
 * 
 * IMPORTANTE: Requiere que exista al menos un usuario en la base de datos
 * para asignar como createdBy.
 */

const mongoose = require('mongoose');
const colors = require('colors');
require('dotenv').config();

// Modelos
const ReasonTransaction = require('../models/reasonTransactionModel');
const User = require('../models/userModel');

// Conectar a MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
  } catch (error) {
    console.log(`Error: ${error.message}`.red);
    process.exit(1);
  }
};

// Motivos de transacción predefinidos
const reasonTransactions = [
  {
    code: 'INITIAL',
    name: 'Inventario Inicial',
    description: 'Inventario inicial del producto al crear el registro',
    transactionType: 'ENTRADA',
    affectsCost: true, // El inventario inicial establece el costo base
    requiresDocument: false,
    enabled: true
  },
  {
    code: 'PURCHASE',
    name: 'Compra a Proveedor',
    description: 'Entrada de mercancía por compra a proveedor',
    transactionType: 'ENTRADA',
    affectsCost: true, // Las compras recalculan el costo promedio
    requiresDocument: true, // Requiere factura o documento
    enabled: true
  },
  {
    code: 'SALE',
    name: 'Venta',
    description: 'Salida de mercancía por venta a cliente',
    transactionType: 'SALIDA',
    affectsCost: false, // Las ventas no afectan el costo
    requiresDocument: false,
    enabled: true
  },
  {
    code: 'ADJUSTMENT_IN',
    name: 'Ajuste de Inventario (Entrada)',
    description: 'Incremento de stock por ajuste o corrección',
    transactionType: 'ENTRADA',
    affectsCost: false, // Los ajustes no recalculan costo promedio
    requiresDocument: false,
    enabled: true
  },
  {
    code: 'ADJUSTMENT_OUT',
    name: 'Ajuste de Inventario (Salida)',
    description: 'Reducción de stock por ajuste, merma o corrección',
    transactionType: 'SALIDA',
    affectsCost: false,
    requiresDocument: false,
    enabled: true
  },
  {
    code: 'RETURN_CUSTOMER',
    name: 'Devolución de Cliente',
    description: 'Entrada de mercancía por devolución de cliente',
    transactionType: 'ENTRADA',
    affectsCost: false, // Las devoluciones no recalculan costo
    requiresDocument: false,
    enabled: true
  },
  {
    code: 'RETURN_SUPPLIER',
    name: 'Devolución a Proveedor',
    description: 'Salida de mercancía por devolución a proveedor',
    transactionType: 'SALIDA',
    affectsCost: false,
    requiresDocument: true, // Requiere nota de crédito o documento
    enabled: true
  },
  {
    code: 'TRANSFER_IN',
    name: 'Transferencia (Entrada)',
    description: 'Entrada de mercancía por transferencia entre tiendas',
    transactionType: 'ENTRADA',
    affectsCost: false, // Las transferencias no cambian el costo
    requiresDocument: false,
    enabled: true
  },
  {
    code: 'TRANSFER_OUT',
    name: 'Transferencia (Salida)',
    description: 'Salida de mercancía por transferencia entre tiendas',
    transactionType: 'SALIDA',
    affectsCost: false,
    requiresDocument: false,
    enabled: true
  },
  {
    code: 'DAMAGED',
    name: 'Mercancía Dañada',
    description: 'Salida de stock por mercancía dañada o vencida',
    transactionType: 'SALIDA',
    affectsCost: false,
    requiresDocument: false,
    enabled: true
  },
  {
    code: 'LOST',
    name: 'Pérdida o Robo',
    description: 'Salida de stock por pérdida o robo',
    transactionType: 'SALIDA',
    affectsCost: false,
    requiresDocument: false,
    enabled: true
  }
];

const seedReasonTransactions = async () => {
  try {
    await connectDB();

    // Buscar un usuario administrador para asignar como createdBy
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('No se encontró un usuario administrador. Por favor, crea un usuario primero.'.red);
      process.exit(1);
    }

    console.log(`Usuario administrador encontrado: ${adminUser.name} (${adminUser.email})`.green);

    // Verificar si ya existen reason transactions
    const existingCount = await ReasonTransaction.countDocuments();
    
    if (existingCount > 0) {
      console.log(`Ya existen ${existingCount} motivos de transacción en la base de datos.`.yellow);
      console.log('¿Desea eliminarlos y crear nuevos? (Ctrl+C para cancelar)'.yellow);
      
      // Esperar 3 segundos antes de continuar
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      await ReasonTransaction.deleteMany({});
      console.log('Motivos de transacción existentes eliminados.'.yellow);
    }

    // Insertar motivos de transacción con el usuario como createdBy
    const reasonsToInsert = reasonTransactions.map(reason => ({
      ...reason,
      createdBy: adminUser._id
    }));

    const insertedReasons = await ReasonTransaction.insertMany(reasonsToInsert);
    
    console.log(`${insertedReasons.length} motivos de transacción insertados exitosamente:`.green);
    insertedReasons.forEach(reason => {
      console.log(`  - ${reason.code}: ${reason.name} (${reason.transactionType})`.cyan);
    });

    process.exit(0);

  } catch (error) {
    console.error(`Error al ejecutar el seeder: ${error.message}`.red);
    console.error(error);
    process.exit(1);
  }
};

// Ejecutar el seeder
seedReasonTransactions();
