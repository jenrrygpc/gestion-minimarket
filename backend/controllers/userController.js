const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// @desc Register a new user
// @route /api/users
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  const { payload: {
    name,
    email,
    password,
    role
  } } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please include all fields');
  }

  // Find if user already exist
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  //Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  console.log('userCreate before');
  //Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role
  });
  console.log('userCreate');

  if (user) {
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    })
  } else {
    res.status(400);
    throw Error('Invalid user data');
  }

});

const updateUser = asyncHandler(async (req, res) => {
  const { payload: {
    name,
    password,
    role
  } } = req.body;

  //Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const updatedUser = await User.findByIdAndUpdate(req.params.id,
    {
      name,
      password: hashedPassword,
      role
    },
    { new: true });

  console.log('updatedUser ..:', updatedUser);
  res.status(200).json(updatedUser);

});

const loginUser = asyncHandler(async (req, res) => {

  console.log('loginUser...');

  const { payload: { email, password } } = req.body;
  const user = await User.findOne({ email });

  console.log('user...');

  if (!user) {
    res.status(401);
    throw new Error('User not found!');
  }

  //Check user and password match
  if (await bcrypt.compare(password, user.password)) {
    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } else {
    res.status(401);
    throw new Error('Invalid credentials!');
  }

});

const getMe = asyncHandler(async (req, res) => {

  const user = await User.findById(req.id);

  res.status(200).json({
    id: user._id,
    name: user.name,
    email: user.email
  });
});

//enviar a otro archivo de utilitarios o commons
//Generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });
};

// @desc    Get users
// @route   GET /api/users
// @access  Private
const getUsers = asyncHandler(async (req, res) => {
  // Get users
  console.log('getUsers ..:', req);
  const { name } = req.query;
  const user = await User.findById(req.id);
  console.log('user ..:', user);
  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }
  let users;
  if (name) {
    users = await User.find({ name: new RegExp(name, 'i') });
  } else {
    users = await User.find({
    });
  }

  console.log('users ..:', users);
  res.status(200).json(users);
});

module.exports = {
  registerUser,
  loginUser,
  getMe,
  getUsers,
  updateUser
}