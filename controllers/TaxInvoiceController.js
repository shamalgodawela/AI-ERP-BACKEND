const TaxInvoices= require('../models/TaxInvoice')


const getAllInvoices = async (req, res) => {
    try {
      const invoices = await TaxInvoices.find().sort({ invoiceDate: -1 }); 
      res.status(200).json(invoices);
    } catch (error) {
      console.error('Error fetching all invoices:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

const getInvoiceByNumber = async (req, res) => {
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

  module.exports = { 
    getAllInvoices,
    getInvoiceByNumber


  }