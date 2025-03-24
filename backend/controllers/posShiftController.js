const asyncHandler = require('express-async-handler');

const User = require('../models/userModel');
const PosShift = require('../models/posShiftModel');
const Pos = require('../models/posModel');

// @desc    Create pos shift
// @route   POST /api/pos-shift
// @access  Private
const createPosShift = asyncHandler(async (req, res) => {
    const {
        payload: {
            status,
            shiftStart,
            initialAmount,
            idPos
        }
    } = req.body;
    if (!status || !shiftStart || !initialAmount || !idPos) {
        res.status(400);
        throw new Error('Incluir estado, hora inicio turno, monto inicial y punto de venta');
    }

    // Get user using the id  the JWT
    const user = await User.findById(req.id);
    if (!user) {
        res.status(401);
        throw new Error('Usuario no encontrado');
    }

    const newPosShift = await PosShift.create({
        status,
        shiftStart,
        initialAmount,
        idPos,
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

module.exports = {
    createPosShift,
    getPosShift,
    updatePosShift,
    getValidPosShift
};
