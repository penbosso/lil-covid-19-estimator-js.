/* eslint-disable linebreak-style */
const mongoose = require('mongoose');

const { Schema } = mongoose;

const ResponseLogSchema = new Schema(
  {
    url: { type: String, required: true, max: 150 },
    time: { type: String, max: 55, required: true }
  }, { timestamps: true }
);


module.exports = mongoose.model('ResponseLog', ResponseLogSchema);
