const Outstanding = require('../models/outStanding');
const Invoice=require('../models/invoice')

const outstandingController = {
    createOutstanding: async (req, res) => {
        try {
            const { invoiceNumber, date,backName,depositedate,CHnumber, amount, outstanding } = req.body;
            const newOutstanding = new Outstanding({ invoiceNumber , date,backName,depositedate,CHnumber, amount, outstanding });
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
            
            if (lastOutstanding === null || lastOutstanding === undefined) {
                
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
    
    searchOutstanding: async (req, res) => {
        try {
            
            const { exe } = req.query;
    
            
            const searchQuery = {};
    
            if (exe) {
                searchQuery.exe = exe;
            }
    
            
            const searchResults = await Invoice.find(searchQuery);
    
            
            res.json(searchResults);
        } catch (error) {
           
            console.error('Error during search:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    searchOutstandingBycus: async (req, res) => {
        try {
            
            const { code } = req.query;
    
           
            const searchQuery = {};
    
            if (code) { 
                searchQuery.code = code;
            }
    
            
            const searchResults = await Invoice.find(searchQuery);
    
            
            res.json(searchResults);
        } catch (error) {
            
            console.error('Error during search:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    searchOutstandingbyIncN :async(req,res)=>{
        try {
            const {invoiceNumber}= req.query;

            const searchQuery ={};

            if(invoiceNumber){
                searchQuery.invoiceNumber=invoiceNumber;
            }

            const searchResults = await Invoice.find(searchQuery);
            res.json(searchResults);
            
        } catch (error) {
            console.error('Error during search:', error);
            res.status(500).json({ error: 'Internal server error' });
            
        }

    },
    getSumOfOutstandingAmounts: async (req, res) => {
        try {
            const result = await Outstanding.aggregate([
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$amount' }
                    } 
                }
            ]);

            const sum = result.length > 0 ? result[0].totalAmount : 0;
            res.json({ sum });
        } catch (error) {
            console.error('Error calculating sum of outstanding amounts:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    
    
    
    
    
    
    
    
};


module.exports =outstandingController;


