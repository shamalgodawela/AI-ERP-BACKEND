const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Executives= require('../models/executive');
const dotenv = require("dotenv").config();


login = async (req, res) => {
    const { email, password, latitude, longitude } = req.body;

    try {
        // Check if user exists
        let user = await Executives.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'User does not exist' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid password' });
        }

        // Track user's location
        user.latitude = latitude;
        user.longitude = longitude;
        await user.save();

        // Generate JWT token
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
            if (err) {
                console.error('Token generation error:', err);
                return res.status(500).send('Server Error');
            }
            // Log login details
            console.log(`User ${user.email} logged in successfully.`);
            // Send the token in the response
            res.json({ token });
        });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).send('Server Error');
    }
};


const register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        let user = await Executives.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Create new user
        user = new Executives({ name, email, password });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Save user to database
        await user.save();

        // Generate JWT token
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = { register,login };
