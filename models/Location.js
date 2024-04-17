const mongoose = require('mongoose');


const locationSchema = new mongoose.Schema({
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    }
});


const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
