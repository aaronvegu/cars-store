const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  carID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Car',
  },
  quantity: {
    type: Number,
    required: false,
  },
  location: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model('Inventory', inventorySchema); // name, schema
