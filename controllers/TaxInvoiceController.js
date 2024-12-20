const TaxInvoices= require('../models/TaxInvoice')


const getAllTaxInvoices = async (req, res) => {
  try {
      // Use aggregation to convert TaxNo to a number and sort
      const invoices = await TaxInvoices.aggregate([
          { $addFields: { TaxNoAsNumber: { $toInt: "$TaxNo" } } },
          { $sort: { TaxNoAsNumber: 1 } }
      ]);

      res.status(200).json(invoices);
  } catch (error) {
      console.error('Error fetching all invoices:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};



const getTaxInvoiceByNumber = async (req, res) => {
    const { invoiceNumber } = req.params;
  
    try {
      const invoice = await TaxInvoices.findOne({ invoiceNumber: invoiceNumber });
  
      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }
  
      res.status(200).json(invoice);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

  const searchTaxInvoices = async (req, res) => {
    try {
      
      const { searchQuery, startDate, endDate, exe } = req.query;
  
      
      const query = {};
  
      
      if (searchQuery) {
        query.$or = [
          { invoiceNumber: { $regex: searchQuery, $options: 'i' } },
          { customer: { $regex: searchQuery, $options: 'i' } },
        ];
      }
  
      
      if (exe) {
        query.exe = exe;
      }
  
      
      if (startDate && endDate) {
        try {
          const parsedStartDate = new Date(startDate);
          const parsedEndDate = new Date(endDate);
          
          parsedEndDate.setHours(23, 59, 59, 999);
  
          
          query.invoiceDate = { $gte: parsedStartDate, $lte: parsedEndDate };
        } catch (error) {
          console.error('Error parsing dates:', error);
          return res.status(400).json({ error: 'Invalid startDate or endDate format.' });
        }
      }
  
      
      const invoices = await TaxInvoices.find(query);
  
      
      res.json(invoices);
    } catch (error) {
      
      console.error('Failed to search invoices:', error);
      res.status(500).json({ error: 'Failed to search invoices' });
    }
  };

  module.exports = { 
    getAllTaxInvoices,
    getTaxInvoiceByNumber,
    searchTaxInvoices,


  }