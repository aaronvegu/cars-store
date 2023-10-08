const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  linkURL: {
    type: String,
    required: true,
  },
  carID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Car',
  },
});

module.exports = mongoose.model('Image', imageSchema); // name, schema
