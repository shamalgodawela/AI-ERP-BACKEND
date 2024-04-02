const mongoose = require("mongoose");

const stationerySchema = new mongoose.Schema({
  codeuse: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  usedBy: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  }
});

const Stationeryuse = mongoose.model("Stationeryuse", stationerySchema);

module.exports = Stationeryuse;
