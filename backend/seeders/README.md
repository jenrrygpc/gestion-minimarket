# Seeders

Este directorio contiene scripts para poblar la base de datos con datos iniciales necesarios.

## reasonTransactionSeeder.js

Inserta los motivos de transacción predefinidos en la base de datos. Estos motivos son esenciales para el funcionamiento del sistema de inventario.

### Uso

```bash
# Desde la raíz del proyecto
node backend/seeders/reasonTransactionSeeder.js
```

### Requisitos

- Tener un usuario administrador creado en la base de datos
- Tener las variables de entorno configuradas (MONGO_URI)

### Motivos de Transacción Insertados

1. **INITIAL** - Inventario Inicial (afecta costo)
2. **PURCHASE** - Compra a Proveedor (afecta costo, requiere documento)
3. **SALE** - Venta
4. **ADJUSTMENT_IN** - Ajuste de Inventario (Entrada)
5. **ADJUSTMENT_OUT** - Ajuste de Inventario (Salida)
6. **RETURN_CUSTOMER** - Devolución de Cliente
7. **RETURN_SUPPLIER** - Devolución a Proveedor (requiere documento)
8. **TRANSFER_IN** - Transferencia (Entrada)
9. **TRANSFER_OUT** - Transferencia (Salida)
10. **DAMAGED** - Mercancía Dañada
11. **LOST** - Pérdida o Robo

### Notas

- Los motivos marcados con "afecta costo" recalcularán el costo promedio ponderado
- Los motivos que requieren documento validarán que se proporcione un número de documento
