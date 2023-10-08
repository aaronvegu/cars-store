const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  relatedSale: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Sale',
  },
  comment: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model('Comment', commentSchema); // name, schema
