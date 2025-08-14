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

const GetSingleCheque = async (req, res) => {
    try {
        const { id } = req.params;

        const cheque = await Cheque.findById(id);

        if (!cheque) {
            return res.status(404).json({ error: "Cheque not found" });
        }

        return res.status(200).json({ cheque });
    } catch (error) {
        console.error("Error fetching cheque:", error);
        return res.status(500).json({ error: `Failed to fetch cheque: ${error.message}` });
    }
};

const EditChequeDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const { invoiceNumber, ChequeNumber, ChequeValue, DepositeDate, Bankdetails, BankBranch, status } = req.body;

        const cheque = await Cheque.findById(id);
        if (!cheque) {
            return res.status(404).json({ error: 'Cheque not found' });
        }

        // Optional: Validate invoiceNumber exists
        if (invoiceNumber) {
            const existingInvoice = await Invoice.findOne({ invoiceNumber });
            if (!existingInvoice) {
                return res.status(404).json({ error: 'Invoice not found' });
            }
        }

        cheque.invoiceNumber = invoiceNumber ?? cheque.invoiceNumber;
        cheque.ChequeNumber = ChequeNumber ?? cheque.ChequeNumber;
        cheque.ChequeValue = ChequeValue ?? cheque.ChequeValue;
        cheque.DepositeDate = DepositeDate ?? cheque.DepositeDate;
        cheque.Bankdetails = Bankdetails ?? cheque.Bankdetails;
        cheque.BankBranch = BankBranch ?? cheque.BankBranch;
        cheque.status = status ?? cheque.status;

        await cheque.save();

        return res.status(200).json({ message: 'Cheque updated successfully', cheque });
    } catch (error) {
        console.error('Error updating cheque details:', error);
        res.status(500).json({ error: `Failed to update cheque details: ${error.message}` });
    }
};




module.exports = { 
    AddChequeDetails,
    GetAllCheques,
    EditChequeDetails,
    GetSingleCheque
    
};