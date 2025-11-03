const Invoice = require('../models/invoice');
const Product = require("../models/productModel");
const Inventory = require('../models/Inventory');
const Outstanding = require('../models/outStanding');
const Cheque = require('../models/Cheque');


const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
};
const addInvoice = async (req, res) => {
  try {
    const { products, ...invoiceData } = req.body;

    // Try to find inventory by owner matching StockName
    const inventoryOwner = invoiceData.StockName;
    const ownerKey = inventoryOwner
  ? String(inventoryOwner).trim().toLowerCase().replace(/^m\./, "mr.")
  : null;
    const inventoryDoc = ownerKey
  ? await Inventory.findOne({ ownerKey: ownerKey })
  : null;

    // Loop through each product in the invoice
    for (const product of products) {
      const quantity = parseFloat(product.quantity);
      const labelPrice = parseFloat(product.labelPrice);
      const discount = parseFloat(product.discount) || 0;

      // 🚫 1. Validate quantity
      if (!quantity || quantity <= 0) {
        return res.status(400).json({
          error: `Cannot add invoice. Quantity for product "${product.productCode}" must be greater than 0.`,
        });
      }

      // ✅ 2. Calculate unit price and invoice total
      product.unitPrice = labelPrice - (labelPrice * discount) / 100;
      product.invoiceTotal = product.unitPrice * quantity;

      // If StockName is 'MS', always use Product collection (do not use Inventory)
      const shouldUseInventory = inventoryDoc && ownerKey !== 'ms';

      if (shouldUseInventory) {
        // Use Inventory stock when StockName matches Inventory owner
        const matchByCode = (p) => p.productCode && product.productCode && p.productCode.trim().toLowerCase() === String(product.productCode).trim().toLowerCase();
        const matchByName = (p) => p.productName && product.productName && p.productName.trim().toLowerCase() === String(product.productName).trim().toLowerCase();
        const existingIndex = inventoryDoc.products.findIndex((p) => matchByCode(p) || matchByName(p));

        if (existingIndex === -1) {
          return res.status(400).json({
            error: `Cannot add invoice. Inventory for owner "${inventoryOwner}" does not contain product ${product.productCode || product.productName || ''}.`,
          });
        }

        const invProd = inventoryDoc.products[existingIndex];
        const availableQty = Number(invProd.quantity || 0);
        if (availableQty < quantity) {
          return res.status(400).json({
            error: `Cannot add invoice. Inventory product "${invProd.productCode || invProd.productName}" has insufficient quantity.`,
          });
        }

        // Deduct from inventory
        inventoryDoc.products[existingIndex].quantity = availableQty - quantity;
        await inventoryDoc.save();
      } else {
        // Fallback to Product collection as before
        const productQuery = {
          sku: { $regex: new RegExp(escapeRegExp(String(product.productCode || '')), 'i') },
        };
        if (product.category) {
          productQuery.category = { $regex: new RegExp(escapeRegExp(String(product.category)), 'i') };
        }

        const existingProduct = await Product.findOne(productQuery);

        if (!existingProduct) {
          console.error(
            `No matching product found for product code ${product.productCode} or category mismatch.`
          );
          return res.status(400).json({
            error: "Invalid product code or category mismatch",
          });
        }

        if (existingProduct.quantity < quantity) {
          return res.status(400).json({
            error: `Cannot add invoice. Product "${existingProduct.sku}" has insufficient quantity.`,
          });
        }

        existingProduct.quantity -= quantity;
        existingProduct.amount =
          (existingProduct.amount || 0) - product.invoiceTotal;

        await existingProduct.save();
      }
    }

    // ✅ 6. Calculate total prices for the invoice
    const totalUnitPrice = products.reduce(
      (total, p) => total + (parseFloat(p.unitPrice) || 0),
      0
    );
    const totalInvoiceTotal = products.reduce(
      (total, p) => total + (parseFloat(p.invoiceTotal) || 0),
      0
    );

    // ✅ 7. Prepare and save invoice
    invoiceData.products = products;
    invoiceData.totalUnitPrice = totalUnitPrice;
    invoiceData.totalInvoiceTotal = totalInvoiceTotal;

    const newInvoice = new Invoice(invoiceData);
    const savedInvoice = await newInvoice.save();

    // ✅ 8. Return success response
    res.status(201).json({
      message: "Invoice added successfully",
      invoice: savedInvoice,
    });
  } catch (error) {
    console.error("Error adding invoice:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
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







const checkPassword = (req, res, next) => {
  const { password } = req.body;
  if (password === 'Nihon@2458') {
    
    next();
  } else {
    return res.status(403).json({ error: 'Incorrect password' });
  }
};

const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;

   
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



const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ invoiceDate: -1 }); 
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


const calculateInvoiceTotal = (invoice) => {
  return invoice.products.reduce((total, product) => {
    return total + parseFloat(product.invoiceTotal || 0);
  }, 0);
};




const getMonthlyTotalInvoice = async (req, res) => {
  const { code } = req.params;

  try {
    const monthlyTotals = await Invoice.aggregate([
      {
        $match: {
          code: code,
          invoiceDate: { $ne: "" } 
        }
      },
      {
        $group: {
          _id: {
            year: { $year: { $dateFromString: { dateString: "$invoiceDate" } } },
            month: { $month: { $dateFromString: { dateString: "$invoiceDate" } } }
          },
          totalInvoiceValue: { $sum: { $sum: "$products.invoiceTotal" } } 
        }
      }
    ]);

    res.status(200).json(monthlyTotals);
  } catch (error) {
    console.error(`Error fetching monthly total invoice for code ${code}:`, error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



//fetch last invoice number starting with EA1

const getLastInvoiceNumberEA1 = async (req, res) => {
    try{
      const lastinvoiceNo = await Invoice.findOne({ invoiceNumber: /^EA1/ })
                .sort({ invoiceNumber: -1 })
                .limit(1);


                if (lastinvoiceNo) {
                  return res.status(200).json({ lastinvoice: lastinvoiceNo.invoiceNumber });
              } else {
                  return res.status(404).json({ error: 'No order with order number starting with "EA" found' });
              }
    }
    catch (error) {
            console.error('Error fetching last invoice number:', error);
            return res.status(500).json({ error: 'Internal server error' });
     }
};

//fecth last invoice number starting with PT1 puttalama

const getLastInvoiceNumberPT1 = async (req, res) => {
  try{
    const lastinvoiceNo = await Invoice.findOne({ invoiceNumber: /^PT1/ })
              .sort({ invoiceNumber: -1 })
              .limit(1);


              if (lastinvoiceNo) {
                return res.status(200).json({ lastinvoice: lastinvoiceNo.invoiceNumber });
            } else {
                return res.status(404).json({ error: 'No order with order number starting with "PT1" found' });
            }
  }
  catch (error) {
          console.error('Error fetching last invoice number:', error);
          return res.status(500).json({ error: 'Internal server error' });
   }
};

//fetch last invoice number starting with NUM Gampaha area

const getLastInvoiceNumberNUM = async (req, res) => {
  try{
    const lastinvoiceNo = await Invoice.findOne({ invoiceNumber: /^NUM/ })
              .sort({ invoiceNumber: -1 })
              .limit(1);


              if (lastinvoiceNo) {
                return res.status(200).json({ lastinvoice: lastinvoiceNo.invoiceNumber });
            } else {
                return res.status(404).json({ error: 'No order with order number starting with "NUM" found' });
            }
  }
  catch (error) {
          console.error('Error fetching last invoice number:', error);
          return res.status(500).json({ error: 'Internal server error' });
   }
};
//fetch last invoice number starting with KU1
const getLastInvoiceNumberKU1 = async (req, res) => {
  try{
    const lastinvoiceNo = await Invoice.findOne({ invoiceNumber: /^KU1/ })
              .sort({ invoiceNumber: -1 })
              .limit(1);


              if (lastinvoiceNo) {
                return res.status(200).json({ lastinvoice: lastinvoiceNo.invoiceNumber });
            } else {
                return res.status(404).json({ error: 'No order with order number starting with "KU1" found' });
            }
  }
  catch (error) {
          console.error('Error fetching last invoice number:', error);
          return res.status(500).json({ error: 'Internal server error' });
   }
};
//fetch last invoice number starting with NCP1 MR Buddika

const getLastInvoiceNumberNCP1 = async (req, res) => {
  try{
    const lastinvoiceNo = await Invoice.findOne({ invoiceNumber: /^NCP/ })
              .sort({ invoiceNumber: -1 })
              .limit(1);


              if (lastinvoiceNo) {
                return res.status(200).json({ lastinvoice: lastinvoiceNo.invoiceNumber });
            } else {
                return res.status(404).json({ error: 'No order with order number starting with "NCP" found' });
            }
  }
  catch (error) {
          console.error('Error fetching last invoice number:', error);
          return res.status(500).json({ error: 'Internal server error' });
   }
}


//fecth last invoice number starting with UPC1
const getLastInvoiceNumberUpcountry = async (req, res) => {
  try{
    const lastinvoiceNo = await Invoice.findOne({ invoiceNumber: /^UpCountry/ })
              .sort({ invoiceNumber: -1 })
              .limit(1);


              if (lastinvoiceNo) {
                return res.status(200).json({ lastinvoice: lastinvoiceNo.invoiceNumber });
            } else {
                return res.status(404).json({ error: 'No order with order number starting with "EA" found' });
            }
  }
  catch (error) {
          console.error('Error fetching last invoice number:', error);
          return res.status(500).json({ error: 'Internal server error' });
   }
};


//fecth last invoice number starting with UPC1
const getLastInvoiceNumberother = async (req, res) => {
  try{
    const lastinvoiceNo = await Invoice.findOne({ invoiceNumber: /^Other/ })
              .sort({ invoiceNumber: -1 })
              .limit(1);


              if (lastinvoiceNo) {
                return res.status(200).json({ lastinvoice: lastinvoiceNo.invoiceNumber });
            } else {
                return res.status(404).json({ error: 'No order with order number starting with "EA" found' });
            }
  }
  catch (error) {
          console.error('Error fetching last invoice number:', error);
          return res.status(500).json({ error: 'Internal server error' });
   }
};





const checkOrderNumberExists = async (req, res) => {
  try {
    const orderNumber = req.params.orderNumber;
    const existingOrder = await Invoice.findOne({ orderNumber });

    if (existingOrder) {
      
      return res.json({ exists: true });
    } else {
      
      return res.json({ exists: false });
    }
  } catch (error) {
    console.error('Error checking order number:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const searchInvoices = async (req, res) => {
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

    
    const invoices = await Invoice.find(query);

    
    res.json(invoices);
  } catch (error) {
    
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

//get sales details -----------------------------------------------------------------------------------------------------

const getSumByGatePassNo = async (req, res) => {
  try {
    const result = await Invoice.aggregate([
      { $match: { GatePassNo: 'Printed' } },
      { $unwind: '$products' },
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
          },
          taxRate: { $first: { $ifNull: ['$Tax', 0] } } // Include tax rate or set to 0 if not present
        }
      },
      {
        $project: {
          invoiceTotal: {
            $add: [
              '$invoiceTotal',
              { $multiply: ['$invoiceTotal', { $divide: ['$taxRate', 100] }] }
            ]
          }
        }
      },
      { $group: { _id: null, totalSum: { $sum: '$invoiceTotal' } } }
    ]);

    const totalsaless = result.length > 0 ? result[0].totalSum : 0;
    res.json({ sum: totalsaless });
  } catch (error) {
    console.error('Error calculating sum:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};




const getMonthlySales = async (req, res) => {
  try {
    const result = await Invoice.aggregate([
      { $match: { GatePassNo: 'Printed' } },
      { $unwind: '$products' },
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
      }, 
      {
        $group: {
          _id: {
            year: '$_id.year',
            month: '$_id.month'
          },
          totalSales: { $sum: '$invoiceTotal' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } } 
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
    const { exe } = req.query; 
    const matchStage = { GatePassNo: 'Printed' }; 

    
    if (exe) {
      matchStage.exe = exe;
    }

    const result = await Invoice.aggregate([
      { $match: matchStage }, 
      { $unwind: '$products' }, 
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
            exe: '$exe' 
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
      }, 
      {
        $group: {
          _id: {
            year: '$_id.year',
            month: '$_id.month',
            exe: '$_id.exe'
          },
          totalSales: { $sum: '$invoiceTotal' }
        }
      }, 
      { $sort: { '_id.year': 1, '_id.month': 1 } } 
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
    // Extract startDate and endDate from query parameters
    const { startDate, endDate } = req.query;

    // Ensure both startDate and endDate are provided
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    // Log to verify the received dates (for debugging purposes)
    console.log('Received startDate:', startDate);
    console.log('Received endDate:', endDate);

    // Filter to match invoiceDate between startDate and endDate (assuming they are strings in 'YYYY-MM-DD' format)
    const matchStage = {
      invoiceDate: { $gte: new Date(startDate), $lte: new Date(endDate) },  // Assuming invoiceDate is in 'YYYY-MM-DD' string format
      GatePassNo: 'Printed',  // Assuming you want to filter by this field as well
    };

    // Perform the aggregation query
    const result = await Invoice.aggregate([
      { $match: matchStage },  // Match invoices based on the date range
      { $unwind: '$products' },  // Unwind products if necessary
      {
        $group: {
          _id: '$exe',  // Group by the executive field
          totalSales: {
            $sum: {
              $multiply: [
                '$products.labelPrice',
                { $subtract: [1, { $divide: ['$products.discount', 100] }] },
                '$products.quantity',
              ],
            },
          },
        },
      },
    ]);

    // Return the result in JSON format
    return res.json(result);
  } catch (error) {
    console.error('Error fetching sales by executive:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


const getTotalQuantityByProductCode = async (req, res) => {
  try {
    console.log(`Fetching total quantities for all product codes`);
    const matchStage = { GatePassNo: 'Printed' }; 

    const result = await Invoice.aggregate([
      { $unwind: '$products' },
      { $match: matchStage }, 
      {
        $group: {
          _id: '$products.productCode', 
          productName: { $first: '$products.productName' }, 
          totalQuantity: { $sum: '$products.quantity' } 
        }
      },
      {
        $project: {
          _id: 0,
          productCode: '$_id', 
          productName: 1,
          totalQuantity: 1
        }
      }
    ]);

    console.log('Aggregation result:', result);

    res.json(result);
  } catch (error) {
    console.error('Error fetching total quantities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getexeforoutstanding = async (req, res) => {
  const { exe } = req.params;

  try {
    const outstandingData = await Outstanding.find({ exe: exe });

    if (!outstandingData || outstandingData.length === 0) {
      return res.status(404).json({ error: 'Outstanding data not found' });
    }

    res.status(200).json(outstandingData);
  } catch (error) {
    console.error('Error fetching outstanding data:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
const getAllInvoicesWithOutstanding = async (req, res) => {
  try {
     
      const invoices = await Invoice.find();

      
      const invoicesWithOutstanding = await Promise.all(
          invoices.map(async (invoice) => {
              let lastOutstanding = await Outstanding.findOne({
                  invoiceNumber: invoice.invoiceNumber,
              });

              
              let status = "Not Paid"; 

              if (lastOutstanding) {
                  if (lastOutstanding.outstanding === 0) {
                      status = "Paid";
                  } else {
                      status = lastOutstanding.outstanding;
                  }
              }

             
              if (status !== "Paid") {
                  return {
                      ...invoice._doc,
                      lastOutstanding: status,
                  };
              }
          })
      );

     
      const filteredInvoices = invoicesWithOutstanding.filter(invoice => invoice !== undefined);

      
      res.status(200).json(filteredInvoices);
  } catch (error) {
      console.error('Error fetching invoices with outstanding details:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};
const getAllInvoicesWithOutstandingadmin = async (req, res) => {
  try {
  
    const invoices = await Invoice.find().sort({ invoiceNumber: 1 });

    const invoiceNumbers = invoices.map(inv => inv.invoiceNumber);

   
    const allOutstandings = await Outstanding.aggregate([
      { $match: { invoiceNumber: { $in: invoiceNumbers } } },
      { $sort: { date: -1 } },
      {
        $group: {
          _id: "$invoiceNumber",
          latestOutstanding: { $first: "$outstanding" },
        },
      },
    ]);


    const allCheques = await Cheque.find({ invoiceNumber: { $in: invoiceNumbers } });

   
    const outstandingMap = new Map();
    allOutstandings.forEach((out) => {
      outstandingMap.set(out._id, out.latestOutstanding);
    });

    const chequeMap = new Map();
    allCheques.forEach((cheque) => {
      chequeMap.set(cheque.invoiceNumber, cheque.ChequeValue);
    });

 
    const result = invoices.map((invoice) => {
      const invoiceSuffix = invoice.invoiceNumber.slice(-3);

      const outstanding = outstandingMap.get(invoice.invoiceNumber);
      let status = "Not Paid";
      if (outstanding === 0) {
        status = "Paid";
      } else if (typeof outstanding !== "undefined") {
        status = outstanding;
      }

      const chequeValue = chequeMap.get(invoice.invoiceNumber);
      const chequeValues = chequeValue
        ? Array.isArray(chequeValue)
          ? chequeValue
          : [chequeValue]
        : "No Cheques Found";

      return {
        ...invoice._doc,
        invoiceSuffix,
        lastOutstanding: status,
        chequeValues: chequeValues,
      };
    });

    
    result.sort(
      (a, b) => parseInt(a.invoiceSuffix) - parseInt(b.invoiceSuffix)
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching invoices with outstanding and cheque details:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};







const searchInvoicesByExe = async (req, res) => {
  try {
    const { code } = req.params;

    if (!code) {
      return res.status(400).json({ error: 'Executive (code) is required' });
    }

    const invoices = await Invoice.find({ code }).sort({ invoiceDate: 1 });

    if (invoices.length === 0) {
      return res.status(404).json({ message: 'No invoices found for the specified executive' });
    }

    res.status(200).json(invoices);
  } catch (error) {
    console.error('Error searching invoices by exe:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


//get total sales by dealerID--------------------------------------------------------------------------------------------------------------------------------

const gettotsalesByDealercode = async (req, res) => {
  try {
    const { code } = req.params;
    const { startDate, endDate } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'Customer code is required' });
    }
   // Build the query
    const query = { code, GatePassNo: 'Printed' };
    
    if (startDate && endDate) {
      // Validate dates
      if (isNaN(new Date(startDate).getTime()) || isNaN(new Date(endDate).getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
      }

      // Create start and end dates with proper time handling
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0); // Start of the day
      
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // End of the day

      // Use $expr and $toDate for string-to-date comparison
      delete query.invoiceDate; // Remove previous filter if present
      query.$expr = {
        $and: [
          { $gte: [ { $toDate: '$invoiceDate' }, start ] },
          { $lte: [ { $toDate: '$invoiceDate' }, end ] }
        ]
      };
    }

    // Debug: log the query to see what's being sent to MongoDB
  

    const invoices = await Invoice.find(query).sort({ invoiceDate: -1 });

    if (invoices.length === 0) {
      return res.status(404).json({ 
        message: 'No invoices found with GatePassNo "Printed" for the specified customer code' + 
        (startDate && endDate ? ` between ${startDate} and ${endDate}` : '')
      });
    }

    let totalInvoiceAmount = 0;
    let totalCollectionAmount = 0;
    let productMovement = {};

    // Get customer name
    const customer = await Invoice.findOne({ code }).select('customer');
    const customerName = customer ? customer.customer : 'Unknown';

    for (const invoice of invoices) {
      // Debug: log each invoice date to verify filtering
   

      if (invoice.products && Array.isArray(invoice.products)) {
        invoice.products.forEach((product) => {
          const productTotal = parseFloat(product.unitPrice) * parseFloat(product.quantity);
          totalInvoiceAmount += productTotal;

          const { productName, quantity } = product;
          productMovement[productName] = (productMovement[productName] || 0) + parseFloat(quantity);
        });
      }

      const outstandingEntries = await Outstanding.find({ invoiceNumber: invoice.invoiceNumber });
      outstandingEntries.forEach((entry) => {
        totalCollectionAmount += parseFloat(entry.amount);
      });
    }

    res.status(200).json({
      totalInvoiceAmount: totalInvoiceAmount.toFixed(2),
      totalCollectionAmount: totalCollectionAmount.toFixed(2),
      productMovement,
      customerName,
    });
  } catch (error) {
    console.error('Error searching invoices by code:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// search by product code---------------------------------------------------------------------------------------------

const searchInvoicesByProductCode = async (req, res) => {
  try {
    const { productCode } = req.params;

    if (!productCode) {
      return res.status(400).json({ error: 'Product code is required' });
    }

    // Find invoices that contain the productCode
    const invoices = await Invoice.find({ 'products.productCode': productCode }).sort({ invoiceDate: -1 });

    if (invoices.length === 0) {
      return res.status(404).json({ message: 'No invoices found with the specified product code' });
    }

    // Modify the response to include only the matched product's quantity
    const updatedInvoices = invoices.map(invoice => {
      const matchingProduct = invoice.products.find(p => p.productCode === productCode);
      return {
        ...invoice.toObject(), // Convert Mongoose document to plain object
        searchedProductQuantity: matchingProduct ? matchingProduct.quantity : "N/A",
      };
    });

    res.status(200).json(updatedInvoices);
  } catch (error) {
    console.error('Error searching invoices by product code:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// get executives product wise sales------------------------------------------------------------------------------------------------------
const getProductWiseSalesByExe = async (req, res) => {
  try {
    const { exe } = req.params; 
    const { startDate, endDate } = req.query;

    if (!exe) {
      return res.status(400).json({ error: 'Sales executive name (exe) is required' });
    }

    // Build match stage
    const matchStage = { GatePassNo: 'Printed', exe };
    if (startDate && endDate) {
      // Ensure the time covers the whole end date
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchStage.invoiceDate = { $gte: start, $lte: end };
    }

    const salesData = await Invoice.aggregate([
      {
        $match: matchStage, 
      },
      {
        $unwind: '$products', 
      },
      {
        $group: {
          _id: {
            productName: '$products.productName',
          },
          totalSales: {
            $sum: {
              $multiply: [
                { $toDouble: '$products.unitPrice' }, 
                { $toDouble: '$products.quantity' },
              ],
            },
          },
          totalQuantity: {
            $sum: { $toDouble: '$products.quantity' }, 
          },
        },
      },
      {
        $project: {
          _id: 0,
          productName: '$_id.productName', 
          totalSales: { $round: ['$totalSales', 2] }, 
          totalQuantity: '$totalQuantity', 
        },
      },
      {
        $sort: { productName: 1 },
      },
    ]);

    if (salesData.length === 0) {
      return res.status(404).json({ message: `No sales data found for sales executive: ${exe}` });
    }

    res.status(200).json(salesData);
  } catch (error) {
    console.error('Error fetching product-wise sales data:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



const getlastTaxNo = async (req, res) => {
  try {
    const lastInserted = await Invoice.findOne({
      TaxNo: { $exists: true, $ne: "" }
    })
      .sort({ _id: -1 }) // sorts by most recently inserted
      .limit(1);

    if (lastInserted) {
      return res.status(200).json({ lastTaxNo: lastInserted.TaxNo });
    } else {
      return res.status(404).json({ error: 'No tax number found' });
    }
  } catch (error) {
    console.error('Error fetching last inserted tax number:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
const ExecutivesIncentive = async (req, res) => {
  try {
    const result = await Invoice.aggregate([

      {
        $project: {
          invoiceNumber: 1,
          customer: 1,
          exe: 1,
          invoiceDate:1,
          IncentiveStatus: 1,
          ModeofPayment: 1,
          IncentiveDueDate: 1,
          Duedate: 1,
          Incentivesettlement: 1,
          totalInvoiceAmount: { $sum: "$products.invoiceTotal" }
        }
      },
      {
        $addFields: {
          incentiveAmount: {
            $cond: {
              if: { $eq: ["$ModeofPayment", "Cash"] },
              then: {
                $multiply: [
                  {
                    $divide: [
                      { $multiply: [{ $divide: ["$totalInvoiceAmount", 118] }, 100] },
                      100
                    ]
                  },
                  2
                ]
              },
              else: {
                $multiply: [
                  {
                    $divide: [
                      { $multiply: [{ $divide: ["$totalInvoiceAmount", 118] }, 100] },
                      100
                    ]
                  },
                  1
                ]
              }
            }
          }
        }
      }
    ]);

    if (!result.length) {
      return res.status(404).json({ error: "No invoices with IncentiveStatus 'Settled' found" });
    }

    const formattedResult = result.map(invoice => ({
      invoiceNumber: invoice.invoiceNumber,
      customer: invoice.customer,
      exe: invoice.exe,
      invoiceDate:invoice.invoiceDate,
      IncentiveStatus: invoice.IncentiveStatus,
      ModeofPayment: invoice.ModeofPayment,
      IncentiveDueDate:invoice.IncentiveDueDate,
      Duedate: invoice.Duedate,
      Incentivesettlement: invoice.Incentivesettlement,
      invoiceTotal: invoice.totalInvoiceAmount.toFixed(2),
      incentiveAmount: invoice.incentiveAmount.toFixed(2)
    }));

    return res.status(200).json(formattedResult);

  } catch (error) {
    console.error("Error fetching Executive Incentives:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



const getLastTaxNo = async (req, res) => {
  try {
    // Find the last inserted invoice and select only TaxNo
    const lastInvoice = await Invoice.findOne({}, { TaxNo: 1, _id: 0 })
                                     .sort({ _id: -1 });

    let nextTaxNo;

    if (!lastInvoice || !lastInvoice.TaxNo) {
      // If no invoice exists, start from a default number
      nextTaxNo = 1;
    } else {
      // Convert TaxNo to number and increment
      nextTaxNo = parseInt(lastInvoice.TaxNo, 10) + 1;
    }

    res.status(200).json({ nextTaxNo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};




module.exports = { 
  getSumByGatePassNo,
  addInvoice,
  getAllInvoices, 
  getInvoiceById, 
  checkPassword, 
  deleteInvoice,
  getTotalInvoiceValueByCode,
  getMonthlyTotalInvoice,
  checkOrderNumberExists,
  searchInvoices,
  updateInvoice,
  getInvoiceByNumber,
  getSumByGatePassNo,
  getMonthlySales,
  getMonthlySalesbyExe,
  getSalesByExe,
  getTotalQuantityByProductCode,
  getexeforoutstanding,
  getAllInvoicesWithOutstanding,
  getAllInvoicesWithOutstandingadmin,
  searchInvoicesByExe,
  gettotsalesByDealercode,
  searchInvoicesByProductCode,
  getProductWiseSalesByExe,
  getLastInvoiceNumberEA1,
  getLastInvoiceNumberNUM,
  getLastInvoiceNumberPT1,
  getLastInvoiceNumberKU1,
  getLastInvoiceNumberNCP1, 
  getLastInvoiceNumberUpcountry,
  getLastInvoiceNumberother,
  getlastTaxNo,
  ExecutivesIncentive,
  getLastTaxNo
  
  
 
  
  
};




