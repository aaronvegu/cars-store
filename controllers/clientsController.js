const Client = require('../models/Client');
const User = require('../models/User');
const Sale = require('../models/Sale');
const asyncHandler = require('express-async-handler');

// @desc Get all clients
// @route GET /clients
// @access Private
const getAllClients = asyncHandler(async (req, res) => {
  const clients = await Client.find().select().lean();
  if (!clients?.length) {
    return res.status(400).json({ message: 'No clients found' });
  }
  res.json(clients);
});

// @desc Create new client
// @route POST /clients
// @access Private
const createNewClient = asyncHandler(async (req, res) => {
  const { name, email, contactInfo, address, salesPerson, photoURL, active } =
    req.body;
  // confirm data
  if (
    !name ||
    !email ||
    !contactInfo ||
    !address ||
    !salesPerson ||
    !photoURL ||
    typeof active !== 'boolean'
  ) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // check for duplicates
  const duplicate = await Client.findOne({ name }).lean().exec();
  if (duplicate) {
    return res.status(409).json({ message: 'Duplicate client' });
  }

  // create user object
  const clientObject = {
    name,
    email,
    contactInfo,
    address,
    salesPerson,
    photoURL,
    active: true,
  };

  // create and store new user
  const client = await Client.create(clientObject);

  if (client) {
    // created
    res.status(201).json({ message: `New client ${name} created` });
  } else {
    res.status(400).json({ message: 'Invalid client data received' });
  }
});

// @desc Update a client
// @route PATCH /clients
// @access Private
const updateClient = asyncHandler(async (req, res) => {
  const {
    id,
    name,
    email,
    contactInfo,
    address,
    salesPerson,
    photoURL,
    active,
  } = req.body;
  // confirm data
  if (
    !id ||
    !name ||
    !email ||
    !contactInfo ||
    !address ||
    !salesPerson ||
    !photoURL ||
    typeof active !== 'boolean'
  ) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // does client exists?
  const client = await Client.findById(id).exec();

  if (!client) {
    return res.status(400).json({ message: 'Client not found' });
  }

  // Check for duplicate
  const duplicate = await Client.findOne({ name }).lean().exec();

  // Allow updates to the original user
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: 'Duplicate client' });
  }

  client.name = name;
  client.email = email;
  client.contactInfo = contactInfo;
  client.address = address;
  client.salesPerson = salesPerson;
  client.photoURL = photoURL;
  client.active = active;

  const updatedClient = await client.save();

  res.json({ message: `${updatedClient.name} updated` });
});

// @desc Delete a client
// @route DELETE /clients
// @access Private
const deleteClient = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Client ID required' });
  }

  // Check for assigned sales
  const sale = await Sale.findOne({ buyer: id }).lean().exec();
  if (sale?.length) {
    return res.status(400).json({ message: 'Client has sales assigned' });
  }

  const client = await Client.findById(id).exec();

  if (!client) {
    return res.status(400).json({ message: 'Client not found' });
  }

  const result = await client.deleteOne();

  const reply = `Client ${result.name} with ID ${result.id} deleted`;

  res.json(reply);
});

module.exports = {
  getAllClients,
  createNewClient,
  updateClient,
  deleteClient,
};
