const Invoice = require('../models/invoice');
const Product = require("../models/productModel");


const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
};
const addInvoice = async (req, res) => {
  try {
    const { products, ...invoiceData } = req.body;

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
    const invoices = await Invoice.find().sort({ invoiceDate: -1 }); // Sort by invoiceDate descending
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

const checkOrderNumberExists = async (req, res) => {
  try {
    const orderNumber = req.params.orderNumber;
    const existingOrder = await Invoice.findOne({ orderNumber });

    if (existingOrder) {
      // Order number already exists
      return res.json({ exists: true });
    } else {
      // Order number does not exist
      return res.json({ exists: false });
    }
  } catch (error) {
    console.error('Error checking order number:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const searchInvoices = async (req, res) => {
  try {
    // Destructure parameters from request query
    const { searchQuery, startDate, endDate, exe } = req.query;

    // Construct the query object based on provided parameters
    const query = {};

    // Search by invoiceNumber or customer (case-insensitive)
    if (searchQuery) {
      query.$or = [
        { invoiceNumber: { $regex: searchQuery, $options: 'i' } },
        { customer: { $regex: searchQuery, $options: 'i' } },
      ];
    }

    // Filter by exe (optional)
    if (exe) {
      query.exe = exe;
    }

    // Filter by invoiceDate within the specified range (validated)
    if (startDate && endDate) {
      try {
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);
        // Adjust the endDate to include the entire end day
        parsedEndDate.setHours(23, 59, 59, 999);

        // Add a condition to check if invoiceDate falls within the specified range
        query.invoiceDate = { $gte: parsedStartDate, $lte: parsedEndDate };
      } catch (error) {
        console.error('Error parsing dates:', error);
        return res.status(400).json({ error: 'Invalid startDate or endDate format.' });
      }
    }

    // Fetch invoices based on the constructed query
    const invoices = await Invoice.find(query);

    // Send the response with the filtered invoices
    res.json(invoices);
  } catch (error) {
    // Handle other errors
    console.error('Failed to search invoices:', error);
    res.status(500).json({ error: 'Failed to search invoices' });
  }
};

const updateInvoice = async (req, res) => {
  const { invoiceNumber } = req.params;
  const updateData = req.body;

  try {
    const invoice = await Invoice.findOneAndUpdate(
      { invoiceNumber: invoiceNumber },
      updateData,
      { new: true, runValidators: true }
    );

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.status(200).json({ message: 'Invoice updated successfully', invoice });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
const getInvoiceByNumber = async (req, res) => {
  const { invoiceNumber } = req.params;

  try {
    const invoice = await Invoice.findOne({ invoiceNumber: invoiceNumber });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};



const getSumByGatePassNo = async (req, res) => {
  try {
    const result = await Invoice.aggregate([
      { $match: { GatePassNo: 'Printed' } }, // Match invoices with GatePassNo 'Printed'
      { $unwind: '$products' }, // Deconstruct the products array
      { 
        $group: { 
          _id: '$_id', 
          invoiceTotal: { 
            $sum: { 
              $multiply: [
                '$products.labelPrice',
                { $subtract: [1, { $divide: ['$products.discount', 100] }] },
                '$products.quantity'
              ]
            }
          } 
        }
      }, // Group and sum the product totals for each invoice
      { $group: { _id: null, totalSum: { $sum: '$invoiceTotal' } } } // Group and sum all invoice totals
    ]);

    const sum = result.length > 0 ? result[0].totalSum : 0; // Handle case where no documents are found

    res.json({ sum });
  } catch (error) {
    console.error('Error calculating sum:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getMonthlySales = async (req, res) => {
  try {
    const result = await Invoice.aggregate([
      { $match: { GatePassNo: 'Printed' } }, // Match invoices with GatePassNo 'Printed'
      { $unwind: '$products' }, // Deconstruct the products array
      {
        $addFields: {
          invoiceDate: { $toDate: '$invoiceDate' }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$invoiceDate' },
            month: { $month: '$invoiceDate' },
            invoiceId: '$_id'
          },
          invoiceTotal: {
            $sum: {
              $multiply: [
                '$products.labelPrice',
                { $subtract: [1, { $divide: ['$products.discount', 100] }] },
                '$products.quantity'
              ]
            }
          }
        }
      }, // Group and sum the product totals for each invoice
      {
        $group: {
          _id: {
            year: '$_id.year',
            month: '$_id.month'
          },
          totalSales: { $sum: '$invoiceTotal' }
        }
      }, // Group and sum the invoice totals for each month
      { $sort: { '_id.year': 1, '_id.month': 1 } } // Sort by year and month
    ]);

    const formattedResult = result.map(item => ({
      year: item._id.year,
      month: item._id.month,
      totalSales: item.totalSales
    }));

    res.json(formattedResult);
  } catch (error) {
    console.error('Error fetching monthly sales:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getMonthlySalesbyExe = async (req, res) => {
  try {
    const { exe } = req.query; // Extract 'exe' parameter from the request query
    const matchStage = { GatePassNo: 'Printed' }; // Match invoices with GatePassNo 'Printed'

    // Optionally, add the 'exe' field to the match stage if provided in the query
    if (exe) {
      matchStage.exe = exe;
    }

    const result = await Invoice.aggregate([
      { $match: matchStage }, // Match invoices with specified criteria
      { $unwind: '$products' }, // Deconstruct the products array
      {
        $addFields: {
          invoiceDate: { $toDate: '$invoiceDate' }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$invoiceDate' },
            month: { $month: '$invoiceDate' },
            exe: '$exe' // Group by 'exe' field as well
          },
          invoiceTotal: {
            $sum: {
              $multiply: [
                '$products.labelPrice',
                { $subtract: [1, { $divide: ['$products.discount', 100] }] },
                '$products.quantity'
              ]
            }
          }
        }
      }, // Group and sum the product totals for each invoice
      {
        $group: {
          _id: {
            year: '$_id.year',
            month: '$_id.month',
            exe: '$_id.exe'
          },
          totalSales: { $sum: '$invoiceTotal' }
        }
      }, // Group and sum the invoice totals for each month and exe
      { $sort: { '_id.year': 1, '_id.month': 1 } } // Sort by year and month
    ]);

    const formattedResult = result.map(item => ({
      year: item._id.year,
      month: item._id.month,
      exe: item._id.exe,
      totalSales: item.totalSales
    }));

    res.json(formattedResult);
  } catch (error) {
    console.error('Error fetching monthly sales:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const getSalesByExe = async (req, res) => {
  try {
    const { exe } = req.query; // Extract 'exe' parameter from the request query
    const matchStage = { GatePassNo: 'Printed' }; // Match invoices with GatePassNo 'Printed'

    // Optionally, add the 'exe' field to the match stage if provided in the query
    if (exe) {
      matchStage.exe = exe;
    }

    const result = await Invoice.aggregate([
      { $match: matchStage }, // Match invoices with specified criteria
      { $unwind: '$products' }, // Deconstruct the products array
      {
        $group: {
          _id: '$exe', // Group by 'exe' field
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
      } // Group and sum the product totals for each executive
    ]);

    res.json(result);
  } catch (error) {
    console.error('Error fetching sales by executive:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};





module.exports = {
  getSumByGatePassNo,
};

module.exports = { 
  addInvoice,
  getAllInvoices, 
  getInvoiceById, 
  checkPassword, 
  deleteInvoice,
  getTotalInvoiceValueByCode,
  getMonthlyTotalInvoice,
  getLastInvoiceNumber,
  checkOrderNumberExists,
  searchInvoices,
  updateInvoice,
  getInvoiceByNumber,
  getSumByGatePassNo,
  getMonthlySales,
  getMonthlySalesbyExe,
  getSalesByExe
  
  
};




