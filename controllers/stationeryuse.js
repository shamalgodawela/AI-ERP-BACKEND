const StationeryUse = require('../models/stationeryUse'); 
const Stationery = require('../models/stationery'); 

const addStationery = async (req, res) => {
    const { codeuse, name, usedBy, quantity } = req.body; 

    try {
        // Find existing product by codeuse
        const existingProduct = await Stationery.findOne({
            code: { $regex: new RegExp(codeuse, "i") }
        });

        if (existingProduct) {
            existingProduct.quantity -= quantity;
            await existingProduct.save();
            

            const newStationeryUse = new StationeryUse({
                codeuse: codeuse,
                name: name, 
                usedBy: usedBy,
                quantity: quantity 
            });

            // Save the new stationery use data to the database
            const savedStationeryUse = await newStationeryUse.save();

            // Respond with the saved stationery use data
            res.status(201).json({ 
                savedStationeryUse: savedStationeryUse
            });
        } else {
            console.error('No matching product found');
            res.status(404).json({ message: 'No matching product found' });
        }
    } catch (error) {
        // Handle errors
        console.error('Error adding stationery:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
const getAllStationeryUse = async (req, res) => {
    try {
        // Fetch all stationary usage data from the database
        const allStationeryUse = await StationeryUse.find();
        
        // Respond with the fetched data
        res.status(200).json(allStationeryUse);
    } catch (error) {
        // Handle errors
        console.error('Error fetching stationary usage data:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
     addStationery,
     getAllStationeryUse
     };
