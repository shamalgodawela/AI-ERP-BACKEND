const Outstanding = require('../models/outStanding');
const Invoice=require('../models/invoice')

const outstandingController = {
    createOutstanding: async (req, res) => {
        try {
            const { invoiceNumber, date,backName,depositedate,CHnumber, amount, outstanding } = req.body;
            const newOutstanding = new Outstanding({ invoiceNumber,date,backName,depositedate,CHnumber, amount, outstanding});
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
            let lastOutstanding = await Outstanding.findOne({ invoiceNumber }).sort({ date: -1 }).limit(1);
            
            if (lastOutstanding === null || lastOutstanding === undefined) {
                
                lastOutstanding = -1;
            } else {
                lastOutstanding = lastOutstanding.outstanding; 
            }
    
            res.status(200).json({ outstanding: lastOutstanding });
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
    getExecutiveCollection: async (req, res) => {
        try {
            const executives = await Invoice.distinct('exe');
    
            const collections = await Promise.all(executives.map(async (exe) => {
                const invoices = await Invoice.find({ exe: { $regex: new RegExp(exe, 'i') } });
                const invoiceNumbers = invoices.map(invoice => invoice.invoiceNumber);
                const outstandingRecords = await Outstanding.find({ invoiceNumber: { $in: invoiceNumbers } });
                const totalCollection = outstandingRecords.reduce((acc, record) => acc + record.amount, 0);
                return { exe, totalCollection };
            }));
    
            res.json(collections);
        } catch (error) {
            console.error('Failed to fetch executive collections', error);
            res.status(500).json({ message: 'Failed to fetch executive collections' });
        }
    },
    getMonthlyCollection: async (req, res) => {
        try {

            const result= await Outstanding.aggregate([
                {
                    $addFields:{
                        date:{$toDate:'$date'}
                    }
                },
                {
                    $group:{
                        _id:{
                            year:{$year:'$date'},
                            month:{$month:'$date'},
                        },
                        totalOutstanding:{$sum:'$amount'}
                    }
                },
                {$sort:{'_id.year':1, '_id.month':1}}

            ])

            const formatresult= result.map(item=>({
                year:item._id.year,
                month:item._id.month,
                totalOutstanding:item.totalOutstanding

            }))

            res.json(formatresult)
            
        } catch (error) {
            console.error('error fetching monthly collection', error)
            
        }
    },


//-----------------------------------------Dealer wise total sales-------------------------------------------------//

    getTotalSalesAndCollections: async (req, res) => {

        try {
            // Aggregate total sales from the Invoice collection
            const totalSales = await Invoice.aggregate([
                { $match: { GatePassNo: 'Printed' } },
                { $unwind: '$products' },
                {
                    $group: {
                        _id: "$code",
                        totalSales: {
                            $sum: {
                                $multiply: [
                                    '$products.labelPrice',
                                    { $subtract: [1, { $divide: ['$products.discount', 100] }] },
                                    '$products.quantity'
                                ]
                            }
                        }
                    }
                }
            ]);
    
            // Calculate total collection for each dealer
            const collectionsPromises = totalSales.map(async (dealer) => {
                const invoices = await Invoice.find({ code: dealer._id }).select('invoiceNumber');
                const invoiceNumbers = invoices.map(inv => inv.invoiceNumber);
    
                const totalCollection = await Outstanding.aggregate([
                    { $match: { invoiceNumber: { $in: invoiceNumbers } } },
                    {
                        $group: {
                            _id: null,
                            totalCollection: { $sum: "$amount" }
                        }
                    }
                ]);
    
                return {
                    code: dealer._id,
                    totalSales: dealer.totalSales,
                    totalCollection: totalCollection.length > 0 ? totalCollection[0].totalCollection : 0
                };
            });
    
            const results = await Promise.all(collectionsPromises);
    
            console.log('Results:', results);
            res.status(200).json(results);
        } catch (error) {
            console.error('Error fetching total sales and collections:', error);
            res.status(500).json({ error: 'Internal server error' });
        }

    }
       
    
    
};





module.exports =outstandingController;



