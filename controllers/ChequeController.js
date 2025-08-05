const Cheque = require("../models/Cheque");
const Invoice = require("../models/invoice");

const AddChequeDetails = async (req, res) => {
    try {
        const { invoiceNumber, ChequeNumber, ChequeValue, DepositeDate,Bankdetails,BankBranch,status } = req.body;

      
        if (!invoiceNumber || !ChequeNumber || !ChequeValue) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const existingInvoice = await Invoice.findOne({ invoiceNumber });

        if (existingInvoice) {
            const newCheque = new Cheque({
                invoiceNumber,
                ChequeNumber,
                ChequeValue,
                DepositeDate,
                Bankdetails,
                BankBranch,
                status
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

const GetAllCheques = async (req, res) => {
    try {
        const cheques = await Cheque.find();

        if (cheques.length === 0) {
            return res.status(404).json({ error: 'No cheques found' });
        }

        return res.status(200).json({ cheques });
    } catch (error) {
        console.error('Error fetching all cheques:', error);
        res.status(500).json({ error: `Failed to fetch cheque details: ${error.message}` });
    }
};



module.exports = { 
    AddChequeDetails,
    GetAllCheques
    
};