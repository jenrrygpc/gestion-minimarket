const asyncHandler = require('express-async-handler');

const User = require('../models/userModel');
const PosShift = require('../models/posShiftModel');
const Pos = require('../models/posModel');
const Sale = require('../models/saleModel');

// @desc    Create pos shift
// @route   POST /api/pos-shift
// @access  Private
const createPosShift = asyncHandler(async (req, res) => {
    const {
        payload: {
            status,
            shiftStart,
            initialAmount,
            posId,
            storeId
        }
    } = req.body;

    console.log('req.body.payload ..:', req.body.payload);

    if (!status || !shiftStart || !initialAmount || !posId) {
        res.status(400);
        throw new Error('Incluir estado, hora inicio turno, monto inicial y punto de venta');
    }

    // Get user using the id  the JWT
    const user = await User.findById(req.id);
    if (!user) {
        res.status(401);
        throw new Error('Usuario no encontrado');
    }

    // Convertir shiftStart a UTC
    const now = new Date();
    const shiftStartUTC = new Date((new Date(shiftStart)).getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 19);
    console.log('shiftStartUTC ..:', shiftStartUTC);
    const shiftStartISO = new Date(shiftStartUTC).toISOString();
    console.log('shiftStartISO ..:', shiftStartISO);

    const shiftStartLocal = new Date(shiftStart).toLocaleString('es-ES', { timeZone: 'America/Lima' });
    console.log('Fecha local:', shiftStartLocal);

    const shiftStartUTC2 = new Date(shiftStart);
    console.log('shiftStartUTC2 ..:', shiftStartUTC2);

    const newPosShift = await PosShift.create({
        status,
        shiftStart: shiftStartUTC2,
        initialAmount,
        posId,
        storeId,
        user: req.id
    });


    if (!newPosShift) {
        res.status(400);
        throw new Error('Fallo la creación de turno');
    }

    console.log('newPosShift ..:', newPosShift);

    res.status(201).json(newPosShift);
});


// @desc    Get measures
// @route   GET /api/measures
// @access  Private
const getPosShift = asyncHandler(async (req, res) => {
    // Get user using the id  the JWT
    console.log('getPosShift ..:', req);
    const { status, shiftStart } = req.query;

    const user = await User.findById(req.id);
    console.log('user ..:', user);
    if (!user) {
        res.status(401);
        throw new Error('User not found');
    }

    console.log('req.id ..:', req.id);
    console.log('status ..:', status);
    const posShiftList = await PosShift.find({
        user: req.id,
        status: status,
    });

    console.log('posShiftList ..:', posShiftList);

    /*
    const posShiftListFinal = posShiftList.map((posShift) => ({
        ...posShift,
        shiftStart: posShift.shiftStart,
        initialAmount: posShift.initialAmount,
        idPos: posShift.idPos,
        posName: Pos.findById(posShift.idPos).name,
        userName: user.name
    }))

    
    
    res.status(200).json(posShiftList.map((posShift) => ({
        ...posShift,
        shiftStart: posShift.shiftStart,
        initialAmount: posShift.initialAmount,
        idPos: posShift.idPos,
        posName: Pos.findById(posShift.idPos).name,
        userName: user.name
    })));
    */

    res.status(200).json(posShiftList);
});

const updatePosShift = asyncHandler(async (req, res) => {
    console.log('request updatePos ...:', req);
    const { payload: {
        status,
        shiftEnd,
        finalAmount } } = req.body;


    const posShiftFound = await PosShift.findById(req.params.id);

    if (!posShiftFound) {
        res.status(404);
        throw new Error('Turno no encontrado');
    }


    const updatedPosShift = await posShiftFound.findByIdAndUpdate(req.params.id,
        {
            status,
            shiftEnd,
            finalAmount
        },
        { new: true });

    console.log('updatedPosShift ..:', updatedPosShift);

    res.status(200).json(updatedPosShift);

});

// @desc    Get valid pos shift
// @route   GET /api/pos-shift/valid
// @access  Private
const getValidPosShift = asyncHandler(async (req, res) => {
    // Get user using the id  the JWT
    console.log('getPosShift ..:', req);
    //const { status } = req.query;

    const user = await User.findById(req.id);
    console.log('user ..:', user);
    if (!user) {
        res.status(401);
        throw new Error('User not found');
    }

    const posShiftList = await PosShift.find({
        user: req.id,
        storeId: req.query.storeId,
        status: 'ABIERTO',
    });

    const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0);

    console.log('fechaActual ..:', fechaActual);

    const posShiftListMayorHoy = posShiftList.filter(posShift => {
        const shiftStart = new Date(posShift.shiftStart);
        return shiftStart >= fechaActual;
    });
    console.log('posShiftListMayorHoy ..:', posShiftListMayorHoy);

    const posShiftListMenorHoy = posShiftList.filter(posShift => {
        const shiftStart = new Date(posShift.shiftStart);
        return shiftStart < fechaActual;
    });

    console.log('posShiftListMenorHoy ..:', posShiftListMenorHoy);
    // cerrar turnos anteriores
    /*
    posShiftListMenorHoy.forEach(async (posShift) => {
        const updatedPosShift = await posShift.findByIdAndUpdate
            (posShift._id,
                {
                    status: 'CERRADO',
                    shiftEnd: new Date(),
                    finalAmount: 0  //obtener el monto final
                },
                { new: true });
    });
    */


    console.log('posShiftList ..:', posShiftList);

    res.status(200).json(posShiftListMayorHoy);
});

const closePosShift = asyncHandler(async (req, res) => {
    const { payload: { 
        posShiftId,
        // Montos reales del arqueo (ingresados por el cajero)
        realCashAmount = 0,
        realCardAmount = 0,
        realDigitalWalletAmount = 0,
        realTransferAmount = 0,
        realOtherAmount = 0,
        arqueoNotes = ''
    } } = req.body;
    
    console.log('closePosShift ..:', posShiftId);
    console.log('Arqueo recibido:', { realCashAmount, realCardAmount, realDigitalWalletAmount, realTransferAmount, realOtherAmount });
    
    const userId = req.id;
    const posShift = await PosShift.findById(posShiftId);
    if (!posShift) {
        res.status(404);
        throw new Error('Turno no encontrado');
    }
    if (posShift.status === 'CERRADO') {
        res.status(400);
        throw new Error('El turno ya está cerrado');
    }

    // 1. Calcular el total vendido en el turno
    const ventas = await Sale.find({ posShiftId, status: { $in: ['REGISTERED', 'COMPLETED'] } });
    const totalSalesAmount = ventas.reduce((sum, venta) => sum + (venta.totalAmount || 0), 0);
    const totalSalesCount = ventas.length;
    let totalChangeAmount = 0;

    // 2. Calcular montos por método de pago
    let cashAmount = 0;
    let cardAmount = 0;
    let transferAmount = 0;
    let digitalWalletAmount = 0;
    let otherPaymentsAmount = 0;


    ventas.forEach(venta => {
        if (venta.payments && venta.payments.length > 0) {
            venta.payments.forEach(payment => {
                const monto = payment.montoPago || 0;
                const metodo = payment.metodoPago
                    ? payment.metodoPago
                        .toUpperCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '') // Quita tildes 
                    : '';

                switch (metodo) {
                    case 'EFECTIVO':
                    case 'CASH':
                        cashAmount += monto;
                        break;
                    case 'TARJETA':
                    case 'TARJETA DE CREDITO':
                    case 'TARJETA CREDITO':
                    case 'TARJETA DE DEBITO':
                    case 'TARJETA DEBITO':
                    case 'CARD':
                        cardAmount += monto;
                        break;
                    case 'TRANSFERENCIA':
                    case 'TRANSFER':
                        transferAmount += monto;
                        break;
                    case 'YAPE':
                    case 'PLIN':
                    case 'LUKITA':
                    case 'AGORA':
                    case 'BILLETERA DIGITAL':
                        digitalWalletAmount += monto;
                        break;
                    default:
                        otherPaymentsAmount += monto;
                        break;
                }
            });
        }
        // Restar el vuelto solo del efectivo
        if (venta.changeAmount) {
            //cashAmount -= venta.changeAmount;
            totalChangeAmount += venta.changeAmount;
        }
    });

    // 3. Actualizar el turno/caja
    posShift.status = 'CERRADO';
    posShift.shiftEnd = new Date();
    posShift.closedBy = userId;
    posShift.totalSalesAmount = totalSalesAmount;
    posShift.finalAmount = posShift.initialAmount + totalSalesAmount; // Monto inicial + ventas
    posShift.totalSalesCount = totalSalesCount;
    posShift.totalChangeAmount = totalChangeAmount;


    // Actualizar montos por método de pago
    posShift.cashAmount = cashAmount;
    posShift.cardAmount = cardAmount;
    posShift.transferAmount = transferAmount;
    posShift.digitalWalletAmount = digitalWalletAmount;
    posShift.otherPaymentsAmount = otherPaymentsAmount;

    // ========== ARQUEO DE CAJA ==========
    // Calcular el efectivo esperado (monto inicial + ventas en efectivo - vueltos)
    const expectedCashAmount = posShift.initialAmount + cashAmount - totalChangeAmount;
    
    // Guardar montos reales ingresados por el cajero
    posShift.realCashAmount = Number(realCashAmount) || 0;
    posShift.realCardAmount = Number(realCardAmount) || 0;
    posShift.realDigitalWalletAmount = Number(realDigitalWalletAmount) || 0;
    posShift.realTransferAmount = Number(realTransferAmount) || 0;
    posShift.realOtherAmount = Number(realOtherAmount) || 0;
    
    // Calcular diferencias (positivo = sobrante, negativo = faltante)
    posShift.cashDifference = posShift.realCashAmount - expectedCashAmount;
    posShift.cardDifference = posShift.realCardAmount - cardAmount;
    posShift.digitalWalletDifference = posShift.realDigitalWalletAmount - digitalWalletAmount;
    posShift.transferDifference = posShift.realTransferAmount - transferAmount;
    
    // Diferencia total
    const totalRealAmount = posShift.realCashAmount + posShift.realCardAmount + 
                           posShift.realDigitalWalletAmount + posShift.realTransferAmount + 
                           posShift.realOtherAmount;
    const totalExpectedAmount = expectedCashAmount + cardAmount + digitalWalletAmount + 
                                transferAmount + otherPaymentsAmount;
    posShift.totalDifference = totalRealAmount - totalExpectedAmount;
    
    // Guardar observaciones del arqueo
    posShift.arqueoNotes = arqueoNotes;

    await posShift.save();

    res.json({
        message: 'Caja cerrada correctamente',
        posShift,
        summary: {
            totalSales: totalSalesCount,
            totalAmount: totalSalesAmount,
            initialAmount: posShift.initialAmount,
            finalAmount: posShift.finalAmount,
            totalChangeAmount: posShift.totalChangeAmount,
            paymentMethods: {
                cash: cashAmount,
                card: cardAmount,
                transfer: transferAmount,
                digitalWallet: digitalWalletAmount,
                others: otherPaymentsAmount
            },
            // Datos del arqueo
            arqueo: {
                expectedCash: expectedCashAmount,
                realCash: posShift.realCashAmount,
                cashDifference: posShift.cashDifference,
                totalDifference: posShift.totalDifference,
                notes: arqueoNotes
            }
        }
    });

});

// @desc    Get pre-closing summary for pos shift
// @route   GET /api/pos-shift/summary/:posShiftId
// @access  Private
const getPreClosingSummary = asyncHandler(async (req, res) => {
    const { posShiftId } = req.params;
    const userId = req.id;

    console.log('getPreClosingSummary for posShiftId:', posShiftId);

    // Verificar que el turno existe y pertenece al usuario
    const posShift = await PosShift.findById(posShiftId);
    if (!posShift) {
        res.status(404);
        throw new Error('Turno no encontrado');
    }

    if (posShift.user.toString() !== userId) {
        res.status(403);
        throw new Error('No tienes permisos para acceder a este turno');
    }

    if (posShift.status === 'CERRADO') {
        res.status(400);
        throw new Error('El turno ya está cerrado');
    }

    // 1. Obtener todas las ventas del turno
    const ventas = await Sale.find({
        posShiftId,
        status: { $in: ['REGISTERED', 'COMPLETED'] }
    });

    // 2. Calcular totales
    const totalSalesAmount = ventas.reduce((sum, venta) => sum + (venta.totalAmount || 0), 0);
    const totalSalesCount = ventas.length;
    let totalChangeAmount = 0;

    // 3. Calcular montos por método de pago
    let cashAmount = 0;
    let cardAmount = 0;
    let transferAmount = 0;
    let digitalWalletAmount = 0;
    let otherPaymentsAmount = 0;

    ventas.forEach(venta => {
        if (venta.payments && venta.payments.length > 0) {
            venta.payments.forEach(payment => {
                const monto = payment.montoPago || 0;
                const metodo = payment.metodoPago
                    ? payment.metodoPago
                        .toUpperCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '') // Quita tildes 
                    : '';

                switch (metodo) {
                    case 'EFECTIVO':
                    case 'CASH':
                        cashAmount += monto;
                        break;
                    case 'TARJETA':
                    case 'TARJETA DE CREDITO':
                    case 'TARJETA CREDITO':
                    case 'TARJETA DE DEBITO':
                    case 'TARJETA DEBITO':
                    case 'CARD':
                        cardAmount += monto;
                        break;
                    case 'TRANSFERENCIA':
                    case 'TRANSFER':
                        transferAmount += monto;
                        break;
                    case 'YAPE':
                    case 'PLIN':
                    case 'LUKITA':
                    case 'AGORA':
                    case 'BILLETERA DIGITAL':
                        digitalWalletAmount += monto;
                        break;
                    default:
                        otherPaymentsAmount += monto;
                        break;
                }
            });
        }

        // Sumar vueltos
        if (venta.changeAmount) {
            totalChangeAmount += venta.changeAmount;
        }
    });

    // 4. Calcular monto final esperado
    const expectedFinalAmount = posShift.initialAmount + totalSalesAmount;
    const expectedCashAmount = posShift.initialAmount + cashAmount - totalChangeAmount;

    // 5. Obtener información del POS
    const pos = await Pos.findById(posShift.posId);
    const posName = pos ? pos.name : 'POS Desconocido';

    // 6. Preparar resumen
    const summary = {
        posShiftId: posShift._id,
        posName,
        status: posShift.status,
        shiftStart: posShift.shiftStart,
        initialAmount: posShift.initialAmount,

        // Totales de ventas
        totalSales: totalSalesCount,
        totalAmount: totalSalesAmount,
        totalChangeAmount,

        // Montos esperados
        finalAmount: expectedFinalAmount,
        expectedCash: expectedCashAmount,

        // Desglose por método de pago
        paymentMethods: {
            cash: cashAmount,
            card: cardAmount,
            transfer: transferAmount,
            digitalWallet: digitalWalletAmount,
            others: otherPaymentsAmount
        },

        // Información adicional
        currentTime: new Date(),
        shiftDuration: Math.floor((new Date() - new Date(posShift.shiftStart)) / (1000 * 60)), // minutos

        // Detalles de ventas (opcional, para debugging)
        /*
        salesDetails: ventas.map(venta => ({
            saleId: venta._id,
            documentNumber: venta.documentNumber,
            totalAmount: venta.totalAmount,
            changeAmount: venta.changeAmount || 0,
            createdAt: venta.createdAt,
            paymentMethods: venta.payments?.map(p => ({
                method: p.metodoPago,
                amount: p.montoPago
            })) || []
        }))
        */
    };

    console.log('Pre-closing summary:', summary);

    res.status(200).json({
        message: 'Resumen del turno obtenido correctamente',
        summary
    });
});

// También crear una versión simplificada sin detalles de ventas
const getSimplePreClosingSummary = asyncHandler(async (req, res) => {
    const { posShiftId } = req.params;
    const userId = req.id;

    const posShift = await PosShift.findById(posShiftId);
    if (!posShift) {
        res.status(404);
        throw new Error('Turno no encontrado');
    }

    if (posShift.user.toString() !== userId) {
        res.status(403);
        throw new Error('No tienes permisos para acceder a este turno');
    }

    // Obtener solo los totales necesarios
    const ventas = await Sale.find({
        posShiftId,
        status: { $in: ['REGISTERED', 'COMPLETED'] }
    }).select('totalAmount changeAmount payments');

    const totalSalesAmount = ventas.reduce((sum, venta) => sum + (venta.totalAmount || 0), 0);
    const totalSalesCount = ventas.length;
    const totalChangeAmount = ventas.reduce((sum, venta) => sum + (venta.changeAmount || 0), 0);

    // Calcular efectivo aproximado
    let cashAmount = 0;
    ventas.forEach(venta => {
        if (venta.payments) {
            venta.payments.forEach(payment => {
                const metodo = payment.metodoPago?.toUpperCase() || '';
                if (metodo.includes('EFECTIVO') || metodo.includes('CASH')) {
                    cashAmount += payment.montoPago || 0;
                }
            });
        }
    });

    res.status(200).json({
        message: 'Resumen simple del turno',
        summary: {
            totalSales: totalSalesCount,
            totalAmount: totalSalesAmount,
            initialAmount: posShift.initialAmount,
            finalAmount: posShift.initialAmount + totalSalesAmount,
            totalChangeAmount,
            expectedCash: posShift.initialAmount + cashAmount - totalChangeAmount,
            shiftStart: posShift.shiftStart,
            currentTime: new Date()
        }
    });
});

module.exports = {
    createPosShift,
    getPosShift,
    updatePosShift,
    getValidPosShift,
    closePosShift,
    getPreClosingSummary,        // ✅ Nuevo método completo
    getSimplePreClosingSummary   // ✅ Nuevo método simplificado
};
