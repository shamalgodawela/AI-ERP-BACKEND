// controllers/locationController.js

const Location = require('../models/Location');

// Controller function to handle saving location data
const saveLocation = async (req, res) => {
    const { latitude, longitude } = req.body;

    try {
        // Create a new location document
        const location = await Location.create({ latitude, longitude });

        // Send a success response
        res.status(200).json({ success: true, message: 'Location data saved successfully', location });
    } catch (error) {
        console.error('Error saving location data:', error);
        // Send an error response
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
const getLiveLocations = async (req, res) => {
    try {
        // Fetch live user locations from the database
        const liveLocations = await Location.find({});
        // Extract latitude and longitude from each location
        const locations = liveLocations.map(location => ({
            latitude: location.latitude,
            longitude: location.longitude
        }));
        // Send the live locations in the response
        res.status(200).json({ locations });
    } catch (error) {
        console.error('Error fetching live locations:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
module.exports = { saveLocation,getLiveLocations };
