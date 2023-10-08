const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence');

const invoiceSchema = new mongoose.Schema({
  salesPerson: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  dueDate: {
    type: Date,
    required: false,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  paid: {
    type: Boolean,
    required: true,
    default: false,
  },
});

invoiceSchema.plugin(AutoIncrement, {
  inc_field: 'receive',
  id: 'receivetNums',
  start_seq: 500,
});

module.exports = mongoose.model('Invoice', invoiceSchema); // name, schema
