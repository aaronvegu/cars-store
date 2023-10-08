const User = require('../models/User');
const Client = require('../models/Client');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select().lean();
  if (!users?.length) {
    return res.status(400).json({ message: 'No users found' });
  }
  res.json(users);
});

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
  const { username, email, password, roles, photoURL, active } = req.body;
  // confirm data
  if (
    !username ||
    !email ||
    !password ||
    !Array.isArray(roles) ||
    !roles.length ||
    !photoURL ||
    typeof active !== 'boolean'
  ) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // check for duplicates
  const duplicate = await User.findOne({ username }).lean().exec();
  if (duplicate) {
    return res.status(409).json({ message: 'Duplicate user' });
  }

  // hash password
  const hashedPwd = await bcrypt.hash(password, 10); // salt rounds

  // create user object
  const userObject = {
    username,
    email,
    password: hashedPwd,
    roles,
    photoURL,
    active: true,
  };

  // create and store new user
  const user = await User.create(userObject);

  if (user) {
    // created
    res.status(201).json({ message: `New user ${username} created` });
  } else {
    res.status(400).json({ message: 'Invalid user data received' });
  }
});

// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
  const { id, username, email, password, roles, photoURL, active } = req.body;
  // confirm data
  if (
    !id ||
    !username ||
    !email ||
    !Array.isArray(roles) ||
    !roles.length ||
    !photoURL ||
    typeof active !== 'boolean'
  ) {
    return res
      .status(400)
      .json({ message: 'All fields except password are required' });
  }

  // does user exists?
  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  // Check for duplicate
  const duplicate = await User.findOne({ username }).lean().exec();

  // Allow updates to the original user
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: 'Duplicate username' });
  }

  user.username = username;
  user.email = email;
  user.roles = roles;
  user.photoURL = photoURL;
  user.active = active;

  // if want to change password ; encrypt
  if (password) {
    // hash password
    user.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await user.save();

  res.json({ message: `${updatedUser.username} updated` });
});

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'User ID required' });
  }

  // Check for assigned clients or sales
  const client = await Client.findOne({ salesPerson: id }).lean().exec();
  //const sale = await Sale.findOne({ salesPerson: id }).lean().exec();
  if (client?.length) {
    return res
      .status(400)
      .json({ message: 'User has clients and or sales assigned' });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  const result = await user.deleteOne();

  const reply = `User ${result.username} with ID ${result.id} deleted`;

  res.json(reply);
});

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
