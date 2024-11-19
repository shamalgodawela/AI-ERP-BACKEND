const Cheque = require("../models/Cheque");
const Invoice = require("../models/invoice");

const AddChequeDetails = async (req, res) => {
    try {
        const { invoiceNumber, ChequeNumber, ChequeValue, DepositeDate } = req.body;

        // Validate input
        if (!invoiceNumber || !ChequeNumber || !ChequeValue) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const existingInvoice = await Invoice.findOne({ invoiceNumber });

        if (existingInvoice) {
            const newCheque = new Cheque({
                invoiceNumber,
                ChequeNumber,
                ChequeValue,
                DepositeDate
            });

            await newCheque.save();
            return res.status(201).json({ message: 'Cheque Details Added', cheque: newCheque });
        } else {
            return res.status(404).json({ error: 'Invoice not found' });
        }
    } catch (error) {
        console.error('Error adding cheque details:', error);
        res.status(500).json({ error: `Failed to add cheque details: ${error.message}` });
    }
};

module.exports = { 
    AddChequeDetails
};
