const Invoice = require('../models/invoice');
const Product = require("../models/productModel");

const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
};
const addInvoice = async (req, res) => {
  try {
    const { products, invoiceNumber, ...invoiceData } = req.body;

    // Check if the invoice number already exists in the database
    const existingInvoice = await Invoice.findOne({ invoiceNumber });

    if (existingInvoice) {
      return res.status(400).json({ error: 'Invoice number already exists' });
    }

    // Calculate unitPrice and invoiceTotal for each product
    for (const product of products) {
      product.unitPrice = parseFloat(product.labelPrice) - (parseFloat(product.labelPrice) * parseFloat(product.discount) / 100);
      product.invoiceTotal = parseFloat(product.unitPrice) * parseFloat(product.quantity);

      // Find the corresponding product in the database based on product code (case-insensitive)
      const existingProduct = await Product.findOne({
        sku: { $regex: new RegExp(product.productCode, "i") },
        category: { $regex: new RegExp(product.category, "i") },
      });

      if (existingProduct) {
        // Update the quantity and amount in the database
        existingProduct.quantity -= parseFloat(product.quantity);
        existingProduct.amount -= parseFloat(product.invoiceTotal);

        // Save the updated product in the database
        await existingProduct.save();
      } else {
        // Handle the case where no matching product is found or category mismatch
        console.error(`No matching product found for product code ${product.productCode} or category mismatch.`);
        return res.status(400).json({ error: 'Invalid product code or category mismatch' });
      }
    }

    // Calculate totalUnitPrice and totalInvoiceTotal for the entire invoice
    const totalUnitPrice = products.reduce((total, product) => total + parseFloat(product.unitPrice || 0), 0);
    const totalInvoiceTotal = products.reduce((total, product) => total + parseFloat(product.invoiceTotal || 0), 0);

    // Set the calculated values in the main invoice data
    invoiceData.products = products;
    invoiceData.totalUnitPrice = totalUnitPrice;
    invoiceData.totalInvoiceTotal = totalInvoiceTotal;

    const newInvoice = new Invoice(invoiceData);
    const savedInvoice = await newInvoice.save();

    res.status(201).json(savedInvoice);
  } catch (error) {
    console.error('Error adding invoice:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// controllers/invoiceController.js

// ... Other imports

const getInvoiceById = async (req, res) => {
  const { id } = req.params;

  try {
    const invoice = await Invoice.findById(id);

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.status(200).json(invoice);
  } catch (error) {
    console.error(`Error fetching invoice with id ${id}:`, error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};






// Assuming you have a middleware to check the password
const checkPassword = (req, res, next) => {
  const { password } = req.body;
  if (password === 'Nihon@2458') {
    // Password is correct, proceed to the next middleware or logic
    next();
  } else {
    return res.status(403).json({ error: 'Incorrect password' });
  }
};

const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    // Wrap the deletion logic inside the checkPassword middleware
    checkPassword(req, res, async () => {
      try {
        const result = await Invoice.deleteOne({ _id: id });

        if (result.deletedCount === 0) {
          return res.status(404).json({ error: 'Invoice not found' });
        }

        res.status(200).json({ message: 'Invoice deleted successfully' });
      } catch (error) {
        console.error('Error deleting invoice:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
  } catch (error) {
    console.error('Error in deleteInvoice:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// controllers/invoiceController.js

const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find(); // Assuming your Invoice model is named "Invoice"
    res.status(200).json(invoices);
  } catch (error) {
    console.error('Error fetching all invoices:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const getTotalInvoiceValueByCode = async (req, res) => {
  const { code } = req.params;

  try {
    const invoices = await Invoice.find({ code: code });
    let totalInvoiceValue = 0;

    if (invoices.length > 0) {
      totalInvoiceValue = invoices.reduce((total, invoice) => {
        return total + calculateInvoiceTotal(invoice);
      }, 0);
    }

    res.status(200).json({ totalInvoiceValue });
  } catch (error) {
    console.error('Error fetching invoices by code:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Helper function to calculate invoice total
const calculateInvoiceTotal = (invoice) => {
  return invoice.products.reduce((total, product) => {
    return total + parseFloat(product.invoiceTotal || 0);
  }, 0);
};


// controllers/invoiceController.js

// controllers/invoiceController.js

const getMonthlyTotalInvoice = async (req, res) => {
  const { code } = req.params;

  try {
    const monthlyTotals = await Invoice.aggregate([
      {
        $match: {
          code: code,
          invoiceDate: { $ne: "" } // Filter out documents with empty invoiceDate
        }
      },
      {
        $group: {
          _id: {
            year: { $year: { $dateFromString: { dateString: "$invoiceDate" } } },
            month: { $month: { $dateFromString: { dateString: "$invoiceDate" } } }
          },
          totalInvoiceValue: { $sum: { $sum: "$products.invoiceTotal" } } // Sum up the invoiceTotal field for each invoice
        }
      }
    ]);

    res.status(200).json(monthlyTotals);
  } catch (error) {
    console.error(`Error fetching monthly total invoice for code ${code}:`, error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};





const getLastInvoiceNumber = async (req, res) => {
    try {
        // Find the last inserted invoice document and sort by descending order of invoiceDate
        const lastInvoice = await Invoice.findOne().sort({ invoiceDate: -1 });

        if (lastInvoice) {
            // Extract the invoiceNumber and orderNumber from the last invoice document
            const lastInvoiceNumber = lastInvoice.invoiceNumber;
            const lastOrderNumber = lastInvoice.orderNumber;

            res.status(200).json({ success: true, lastInvoiceNumber, lastOrderNumber });
        } else {
            // No invoices found in the database
            res.status(404).json({ success: false, message: 'No invoices found in the database' });
        }
    } catch (error) {
        // Handle database query errors
        console.error('Error fetching last numbers:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch last numbers', error: error.message });
    }
};





module.exports = { 
  addInvoice,
  getAllInvoices, 
  getInvoiceById, 
  checkPassword, 
  deleteInvoice,
  getTotalInvoiceValueByCode,
  getMonthlyTotalInvoice,
  getLastInvoiceNumber
};




