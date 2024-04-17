// models/User.js

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        
    },
    email: {
        type: String,
        
    },
    password: {
        type: String,
        
    },
    latitude: {
        type: Number
    },
    longitude: {
        type: Number
    }
});

module.exports = mongoose.model('Executives', UserSchema);
