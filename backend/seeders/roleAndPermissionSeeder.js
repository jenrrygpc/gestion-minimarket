/**
 * Seeder para Roles y Permisos
 *
 * Crea el catálogo base de permisos (API + MENU), los 4 roles iniciales
 * (ADMIN, GERENTE, ALMACENERO, CAJERO) con sus permisos asignados, y migra
 * los usuarios existentes que aún tengan el campo `role` como string legado,
 * asignándoles el Role equivalente y las tiendas que ya poseían.
 *
 * Ejecutar con: node backend/seeders/roleAndPermissionSeeder.js
 *
 * IMPORTANTE: Ejecutar una sola vez. Si ya existen roles/permisos, el script
 * los reutiliza (upsert) en vez de duplicarlos.
 */

const mongoose = require('mongoose');
const colors = require('colors');
require('dotenv').config();

const Permission = require('../models/permissionModel');
const Role = require('../models/roleModel');
const User = require('../models/userModel');
const Store = require('../models/storeModel');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
  } catch (error) {
    console.log(`Error: ${error.message}`.red);
    process.exit(1);
  }
};

// Módulos de API con sus acciones disponibles (deben coincidir con los authorize() de cada ruta)
const apiModules = {
  USUARIOS: ['VER', 'CREAR', 'EDITAR'],
  TIENDAS: ['VER', 'CREAR', 'EDITAR'],
  ROLES: ['VER', 'CREAR', 'EDITAR'],
  PERMISOS: ['VER', 'CREAR'],
  PRODUCTOS: ['VER', 'CREAR', 'EDITAR'],
  CATEGORIAS: ['VER', 'CREAR', 'EDITAR'],
  MEDIDAS: ['VER', 'CREAR'],
  MAESTROS: ['VER', 'CREAR', 'EDITAR'],
  CLIENTES: ['VER', 'CREAR', 'EDITAR'],
  INVENTARIO: ['CREAR'],
  MOTIVOS_TRANSACCION: ['VER', 'CREAR', 'EDITAR'],
  POS: ['VER', 'CREAR', 'EDITAR'],
  TURNOS: ['VER', 'CREAR', 'EDITAR'],
  VENTAS: ['CREAR', 'EDITAR']
};

// Ítems de menú (deben coincidir con las entradas de SidebarData.jsx)
const menuCodes = [
  'MENU_VENTAS',
  'MENU_PRODUCTOS',
  'MENU_INVENTARIO',
  'MENU_MAESTROS',
  'MENU_USUARIOS',
  'MENU_ROLES',
  'MENU_PRUEBA'
];

const buildPermissionCatalog = () => {
  const catalog = [];

  Object.entries(apiModules).forEach(([module, actions]) => {
    actions.forEach((action) => {
      catalog.push({
        code: `${module}_${action}`,
        module,
        type: 'API',
        description: `${action} - ${module}`,
        enabled: true
      });
    });
  });

  menuCodes.forEach((code) => {
    const module = code.replace('MENU_', '');
    catalog.push({
      code,
      module,
      type: 'MENU',
      description: `Ver el menú de ${module}`,
      enabled: true
    });
  });

  return catalog;
};

// Permisos por rol, replicando el filtrado actual de SidebarData.jsx
const rolePermissionCodes = {
  ADMIN: 'ALL',
  GERENTE: [
    'MENU_VENTAS', 'MENU_PRODUCTOS', 'MENU_INVENTARIO', 'MENU_MAESTROS', 'MENU_USUARIOS', 'MENU_PRUEBA',
    'VENTAS_CREAR', 'VENTAS_EDITAR',
    'PRODUCTOS_VER', 'PRODUCTOS_CREAR', 'PRODUCTOS_EDITAR',
    'CATEGORIAS_VER', 'CATEGORIAS_CREAR', 'CATEGORIAS_EDITAR',
    'MEDIDAS_VER', 'MEDIDAS_CREAR',
    'MAESTROS_VER', 'MAESTROS_CREAR', 'MAESTROS_EDITAR',
    'TIENDAS_VER', 'TIENDAS_CREAR', 'TIENDAS_EDITAR',
    'CLIENTES_VER', 'CLIENTES_CREAR', 'CLIENTES_EDITAR',
    'MOTIVOS_TRANSACCION_VER', 'MOTIVOS_TRANSACCION_CREAR', 'MOTIVOS_TRANSACCION_EDITAR',
    'POS_VER', 'POS_CREAR', 'POS_EDITAR',
    'INVENTARIO_CREAR',
    'USUARIOS_VER', 'USUARIOS_CREAR', 'USUARIOS_EDITAR',
    'TURNOS_VER', 'TURNOS_CREAR', 'TURNOS_EDITAR'
  ],
  ALMACENERO: [
    'MENU_INVENTARIO', 'TIENDAS_VER',
    'INVENTARIO_CREAR',
    'PRODUCTOS_VER',
    'MAESTROS_VER'
  ],
  CAJERO: [
    'MENU_VENTAS', 'TIENDAS_VER',
    'VENTAS_CREAR',
    'TURNOS_VER', 'TURNOS_CREAR', 'TURNOS_EDITAR',
    'PRODUCTOS_VER',
    'CLIENTES_VER'
  ]
};

const seedPermissions = async () => {
  const catalog = buildPermissionCatalog();
  const permissionsByCode = {};

  for (const permissionData of catalog) {
    const permission = await Permission.findOneAndUpdate(
      { code: permissionData.code },
      permissionData,
      { upsert: true, new: true }
    );
    permissionsByCode[permission.code] = permission;
  }

  console.log(`${catalog.length} permisos sincronizados.`.green);
  return permissionsByCode;
};

const seedRoles = async (permissionsByCode) => {
  const allPermissionIds = Object.values(permissionsByCode).map((p) => p._id);
  const rolesByName = {};

  for (const [roleName, codes] of Object.entries(rolePermissionCodes)) {
    const permissionIds = codes === 'ALL'
      ? allPermissionIds
      : codes.map((code) => permissionsByCode[code]._id).filter(Boolean);

    const role = await Role.findOneAndUpdate(
      { name: roleName },
      {
        name: roleName,
        description: `Rol ${roleName}`,
        enabled: true,
        permissions: permissionIds
      },
      { upsert: true, new: true }
    );
    rolesByName[roleName] = role;
    console.log(`Rol ${roleName} sincronizado con ${permissionIds.length} permisos.`.green);
  }

  return rolesByName;
};

const migrateUsers = async (rolesByName) => {
  // .lean() reads the raw stored value so legacy string roles don't fail Mongoose's ObjectId cast
  const users = await User.find({}).lean();
  let migratedCount = 0;

  for (const user of users) {
    // El campo `role` legado era un string (ADMIN/GERENTE/ALMACENERO/CAJERO)
    if (typeof user.role !== 'string') {
      continue;
    }

    const legacyRoleName = user.role.toUpperCase();
    const role = rolesByName[legacyRoleName] || rolesByName.CAJERO;

    const ownedStores = await Store.find({ user: user._id }).select('_id').lean();
    const storeIds = ownedStores.map((store) => store._id);

    await User.updateOne(
      { _id: user._id },
      { $set: { role: role._id, stores: storeIds } }
    );

    migratedCount += 1;
    console.log(
      `Usuario ${user.email} migrado a rol ${role.name} con ${storeIds.length} tienda(s) asignada(s).`.cyan
    );

    if (storeIds.length === 0) {
      console.log(
        `  -> Advertencia: ${user.email} no tiene tiendas asignadas. Asignar manualmente desde el módulo de Usuarios.`.yellow
      );
    }
  }

  console.log(`${migratedCount} usuario(s) migrado(s).`.green);
};

const run = async () => {
  try {
    await connectDB();

    const permissionsByCode = await seedPermissions();
    const rolesByName = await seedRoles(permissionsByCode);
    await migrateUsers(rolesByName);

    console.log('Seeder de roles y permisos finalizado.'.green.bold);
    process.exit(0);
  } catch (error) {
    console.error(`Error al ejecutar el seeder: ${error.message}`.red);
    console.error(error);
    process.exit(1);
  }
};

run();
