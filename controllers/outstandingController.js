const Outstanding = require('../models/outStanding');
const Invoice=require('../models/invoice')

const outstandingController = {
    createOutstanding: async (req, res) => {
        try {
            const { invoiceNumber, date,backName,depositedate,CHnumber, amount, outstanding } = req.body;
            const newOutstanding = new Outstanding({ invoiceNumber, date,backName,depositedate,CHnumber, amount, outstanding });
            await newOutstanding.save();
            res.status(201).json({ message: 'Outstanding data created successfully' });
        } catch (error) {
            console.error('Error creating outstanding data:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    getOutstandingByInvoiceNumber: async (req, res) => {
        try {
            const { invoiceNumber } = req.params;
            const outstandingDetails = await Outstanding.findOne({ invoiceNumber });
            if (!outstandingDetails) {
                return res.status(404).json({ error: 'Outstanding details not found' });
            }
            res.status(200).json(outstandingDetails);
        } catch (error) {
            console.error('Error fetching outstanding details:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    getAllOutstandingByInvoiceNumber: async (req, res) => {
        try {
            const { invoiceNumber } = req.params;
            const outstandingDetails = await Outstanding.find({ invoiceNumber });
            if (!outstandingDetails || outstandingDetails.length === 0) {
                return res.status(404).json({ error: 'No outstanding details found for this invoice number' });
            }
            res.status(200).json(outstandingDetails);
        } catch (error) {
            console.error('Error fetching all outstanding details:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    getLastOutstandingByInvoiceNumber: async (req, res) => {
        try {
            const { invoiceNumber } = req.params;
            const lastOutstanding = await Outstanding.findOne({ invoiceNumber }).sort({ date: -1 }).limit(1);
            // Check if lastOutstanding is null or undefined
            if (lastOutstanding === null || lastOutstanding === undefined) {
                // If no data is found, return a response indicating no outstanding data
                return res.status(404).json({ error: 'No outstanding data found for this invoice number', outstanding: null });
            }
            res.status(200).json(lastOutstanding);
        } catch (error) {
            console.error('Error fetching last outstanding value:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    getOutstandingStatuses: async (req, res) => {
        try {
            const { invoiceNumbers } = req.body;
            const statuses = {};
            
            for (const invoiceNumber of invoiceNumbers) {
                const lastOutstanding = await Invoice.findOne({ invoiceNumber }).sort({ date: -1 }).limit(1);
                if (lastOutstanding) {
                    statuses[invoiceNumber] = lastOutstanding.outstanding === 0 ? 'Paid' : 'Unpaid';
                } else {
                    statuses[invoiceNumber] = 'Unpaid';
                }
            }
            
            res.status(200).json(statuses);
        } catch (error) {
            console.error('Error fetching outstanding statuses:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    // New function to handle search
    searchOutstanding: async (req, res) => {
        try {
            // Extract search parameters from the request query
            const { exe } = req.query;
    
            // Build the search query based on the provided parameters
            const searchQuery = {};
    
            if (exe) {
                searchQuery.exe = exe;
            }
    
            // Perform the search using your model
            const searchResults = await Invoice.find(searchQuery);
    
            // Return the search results
            res.json(searchResults);
        } catch (error) {
            // Handle errors
            console.error('Error during search:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    searchOutstandingBycus: async (req, res) => {
        try {
            // Extract search parameters from the request query
            const { code } = req.query;
    
            // Build the search query based on the provided parameters
            const searchQuery = {};
    
            if (code) { // Check if code is provided
                searchQuery.code = code;
            }
    
            // Perform the search using your model
            const searchResults = await Invoice.find(searchQuery);
    
            // Return the search results
            res.json(searchResults);
        } catch (error) {
            // Handle errors
            console.error('Error during search:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    
    
    
    
    
    
    
};

module.exports = outstandingController;

