const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Builds the HTTP response shape shared by login/register/getMe (role + permission codes, no password)
// keeps both `id` (used by auth/session state) and `_id` (used by the Usuarios admin list/edit screen)
const buildUserResponse = (user, token) => ({
  id: user._id,
  _id: user._id,
  name: user.name,
  email: user.email,
  isAdmin: user.isAdmin,
  role: user.role && {
    id: user.role._id,
    name: user.role.name,
    permissions: (user.role.permissions || []).map((permission) => permission.code)
  },
  stores: (user.stores || []).map((store) => ({
    id: store._id,
    name: store.name
  })),
  token
});

const populateUser = (query) => query
  .populate({ path: 'role', populate: { path: 'permissions' } })
  .populate('stores');

// @desc Register a new user
// @route /api/users
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  const { payload: {
    name,
    email,
    password,
    role,
    stores
  } } = req.body;

  if (!name || !email || !password || !role) {
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
    role,
    stores: stores || []
  });
  console.log('userCreate');

  if (user) {
    const populatedUser = await populateUser(User.findById(user._id));
    res.status(201).json(buildUserResponse(populatedUser, generateToken(user._id)));
  } else {
    res.status(400);
    throw Error('Invalid user data');
  }

});

const updateUser = asyncHandler(async (req, res) => {
  const { payload: {
    name,
    password,
    role,
    stores
  } } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const updateData = { name, role };
  if (stores) {
    updateData.stores = stores;
  }
  if (password) {
    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(password, salt);
  }

  const updatedUser = await populateUser(
    User.findByIdAndUpdate(req.params.id, updateData, { new: true })
  );

  console.log('updatedUser ..:', updatedUser);
  res.status(200).json(buildUserResponse(updatedUser));

});

const loginUser = asyncHandler(async (req, res) => {

  console.log('loginUser...');

  const { payload: { email, password } } = req.body;
  const user = await populateUser(User.findOne({ email }));

  console.log('user...');

  if (!user) {
    res.status(401);
    throw new Error('User not found!');
  }

  //Check user and password match
  if (await bcrypt.compare(password, user.password)) {
    res.status(200).json(buildUserResponse(user, generateToken(user._id)));
  } else {
    res.status(401);
    throw new Error('Invalid credentials!');
  }

});

const getMe = asyncHandler(async (req, res) => {

  const user = await populateUser(User.findById(req.id));

  res.status(200).json(buildUserResponse(user));
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
    users = await populateUser(User.find({ name: new RegExp(name, 'i') }));
  } else {
    users = await populateUser(User.find({}));
  }

  console.log('users ..:', users);
  res.status(200).json(users.map((u) => buildUserResponse(u)));
});

module.exports = {
  registerUser,
  loginUser,
  getMe,
  getUsers,
  updateUser
}