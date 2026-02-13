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

    // Validate required fields early
    if (!invoiceData.invoiceNumber) {
      return res.status(400).json({
        error: "Invoice number is required",
      });
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        error: "Products array is required and must contain at least one product",
      });
    }

    // Check if StockName is "MS" (main stock) - case insensitive
    const stockName = invoiceData.StockName ? String(invoiceData.StockName).trim() : '';
    const isMainStock = stockName.toLowerCase() === 'ms';

    let inventoryDoc = null;
    
    // Only look for inventory if NOT main stock
    if (!isMainStock && stockName) {
      const candidates = new Set();
      const asIs = stockName;
      const mrExpanded = stockName.replace(/^m\.?\s*/i, 'Mr.');
      const noDots = stockName.replace(/\./g, '');
      const mrExpandedNoDots = mrExpanded.replace(/\./g, '');
      const collapsedSpaces = stockName.replace(/\s+/g, ' ').trim();
      [asIs, mrExpanded, noDots, mrExpandedNoDots, collapsedSpaces].forEach((c) => {
        if (c && c.length) candidates.add(c);
      });

      const ownerRegexes = Array.from(candidates).map((c) => ({
        owner: { $regex: new RegExp(`^${escapeRegExp(c)}$`, 'i') },
      }));

      inventoryDoc = await Inventory.findOne({ $or: ownerRegexes });

      // If inventory owner specified but not found, return error
      if (!inventoryDoc) {
        return res.status(400).json({
          error: `Cannot add invoice. Inventory for owner "${stockName}" not found.`,
        });
      }
    }

    // Loop through each product in the invoice
    for (const product of products) {
      const quantity = parseFloat(product.quantity);
      const labelPrice = parseFloat(product.labelPrice);
      const discount = parseFloat(product.discount) || 0;

      // 🚫 1. Validate quantity
      if (!quantity || quantity <= 0 || isNaN(quantity)) {
        return res.status(400).json({
          error: `Cannot add invoice. Quantity for product "${product.productCode || product.productName}" must be greater than 0.`,
        });
      }

      // ✅ 2. Calculate unit price and invoice total
      product.unitPrice = labelPrice - (labelPrice * discount) / 100;
      product.invoiceTotal = product.unitPrice * quantity;

      if (isMainStock || !inventoryDoc) {
        // Use Product collection (main stock) - for MS or when no inventory found
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
            error: `Invalid product code "${product.productCode}" or category mismatch`,
          });
        }

        // Convert quantity to number for comparison (Product.quantity is String in model)
        const availableQty = parseFloat(existingProduct.quantity);
        if (isNaN(availableQty) || availableQty < quantity) {
          return res.status(400).json({
            error: `Cannot add invoice. Product "${existingProduct.sku}" has insufficient quantity. Available: ${availableQty}, Required: ${quantity}`,
          });
        }

        // Reduce stock (convert to number, subtract, convert back to string for model)
        existingProduct.quantity = String(availableQty - quantity);
        existingProduct.amount =
          (parseFloat(existingProduct.amount) || 0) - product.invoiceTotal;

        await existingProduct.save();
      } else {
        // Use Inventory stock when StockName matches Inventory owner
        const normalize = (v) => String(v || '')
          .toLowerCase()
          .replace(/\s+/g, '')
          .replace(/[.-_]/g, '');

        const targetCode = normalize(product.productCode);
        const targetName = normalize(product.productName);

        const existingIndex = inventoryDoc.products.findIndex((p) => {
          const codeMatch = targetCode && normalize(p.productCode) === targetCode;
          const nameMatch = targetName && normalize(p.productName) === targetName;
          return codeMatch || nameMatch;
        });

        if (existingIndex === -1) {
          return res.status(400).json({
            error: `Cannot add invoice. Inventory for owner "${stockName}" does not contain product ${product.productCode || product.productName || ''}.`,
          });
        }

        const invProd = inventoryDoc.products[existingIndex];
        const availableQty = Number(invProd.quantity || 0);
        if (availableQty < quantity) {
          return res.status(400).json({
            error: `Cannot add invoice. Inventory product "${invProd.productCode || invProd.productName}" has insufficient quantity. Available: ${availableQty}, Required: ${quantity}`,
          });
        }

        // Deduct from inventory
        inventoryDoc.products[existingIndex].quantity = availableQty - quantity;
        await inventoryDoc.save();
      }
    }

    // ✅ 6. Calculate total prices for the invoice and ensure proper data types
    const processedProducts = products.map(p => ({
      productCode: String(p.productCode || ''),
      productName: String(p.productName || ''),
      quantity: Number(p.quantity) || 0,
      labelPrice: Number(p.labelPrice) || 0,
      discount: Number(p.discount) || 0,
      unitPrice: Number(p.unitPrice) || 0,
      invoiceTotal: Number(p.invoiceTotal) || 0,
    }));

    const totalUnitPrice = processedProducts.reduce(
      (total, p) => total + p.unitPrice,
      0
    );
    const totalInvoiceTotal = processedProducts.reduce(
      (total, p) => total + p.invoiceTotal,
      0
    );

    // ✅ 7. Prepare and save invoice
    invoiceData.products = processedProducts;
    invoiceData.totalUnitPrice = totalUnitPrice;
    invoiceData.totalInvoiceTotal = totalInvoiceTotal;
    // Ensure StockName is preserved
    if (stockName) {
      invoiceData.StockName = stockName;
    }

    // Check for duplicate invoice number before saving
    const existingInvoice = await Invoice.findOne({ 
      invoiceNumber: invoiceData.invoiceNumber 
    });
    
    if (existingInvoice) {
      return res.status(400).json({
        error: `Invoice number "${invoiceData.invoiceNumber}" already exists`,
      });
    }

    // Check for duplicate CusVatNo if provided
    if (invoiceData.CusVatNo) {
      const existingCusVat = await Invoice.findOne({ 
        CusVatNo: invoiceData.CusVatNo 
      });
      
      if (existingCusVat) {
        return res.status(400).json({
          error: `Customer VAT number "${invoiceData.CusVatNo}" already exists`,
        });
      }
    }

    const newInvoice = new Invoice(invoiceData);
    const savedInvoice = await newInvoice.save();

    // ✅ 8. Return success response
    res.status(201).json({
      message: "Invoice added successfully",
      invoice: savedInvoice,
    });
  } catch (error) {
    console.error("Error adding invoice:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: "Validation error",
        details: error.message,
      });
    }
    
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern || {})[0];
      return res.status(400).json({
        error: `Duplicate value for field "${field}"`,
        details: error.message,
      });
    }
    
    res.status(500).json({ 
      error: "Internal Server Error",
      details: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while saving the invoice'
    });
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
  const { GatePassNo, chequeData } = req.body;

  try {
    const invoice = await Invoice.findOne({ invoiceNumber });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Update GatePassNo if provided
    if (GatePassNo) {
      invoice.GatePassNo = GatePassNo;
    }

    // Push cheque if valid
    if (chequeData && chequeData.chequeNo && chequeData.amount) {
      invoice.cheques.push({
        chequeNo: chequeData.chequeNo,
        bankName: chequeData.bankName || '',
        depositDate: chequeData.depositDate || '',
        amount: Number(chequeData.amount),
        status: chequeData.status || 'Pending',
        addedAt: new Date(),
      });
    }

    await invoice.save();

    res.status(200).json({
      message: 'Invoice updated successfully',
      invoice,
    });

  } catch (error) {
    console.error('Update invoice error:', error);
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




const getSalesByExe = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    // Keep startDate and endDate as strings in YYYY-MM-DD format
    // No need to convert to Date
    const start = startDate;
    const end = endDate;

    const result = await Invoice.aggregate([
      {
        $match: {
          invoiceDate: { $gte: start, $lte: end },
          GatePassNo: 'Printed',
        },
      },
      { $unwind: '$products' },
      {
        $group: {
          _id: '$exe',
          totalSales: {
            $sum: {
              $multiply: [
                { $ifNull: ['$products.labelPrice', 0] },
                {
                  $subtract: [
                    1,
                    { $divide: [{ $ifNull: ['$products.discount', 0] }, 100] },
                  ],
                },
                { $ifNull: ['$products.quantity', 0] },
              ],
            },
          },
        },
      },
    ]);

    res.json(result);
  } catch (error) {
    console.error('Error fetching sales by executive:', error);
    res.status(500).json({ error: 'Internal server error' });
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
// const getAllInvoicesWithOutstandingadmin = async (req, res) => {
//   try {
  
//     const invoices = await Invoice.find().sort({ invoiceNumber: 1 });

//     const invoiceNumbers = invoices.map(inv => inv.invoiceNumber);

   
//     const allOutstandings = await Outstanding.aggregate([
//       { $match: { invoiceNumber: { $in: invoiceNumbers } } },
//       { $sort: { date: -1 } },
//       {
//         $group: {
//           _id: "$invoiceNumber",
//           latestOutstanding: { $first: "$outstanding" },
//         },
//       },
//     ]);


//     const allCheques = await Cheque.find({ invoiceNumber: { $in: invoiceNumbers } });

   
//     const outstandingMap = new Map();
//     allOutstandings.forEach((out) => {
//       outstandingMap.set(out._id, out.latestOutstanding);
//     });

//     const chequeMap = new Map();
//     allCheques.forEach((cheque) => {
//       chequeMap.set(cheque.invoiceNumber, cheque.ChequeValue);
//     });

 
//     const result = invoices.map((invoice) => {
//       const invoiceSuffix = invoice.invoiceNumber.slice(-3);

//       const outstanding = outstandingMap.get(invoice.invoiceNumber);
//       let status = "Not Paid";
//       if (outstanding === 0) {
//         status = "Paid";
//       } else if (typeof outstanding !== "undefined") {
//         status = outstanding;
//       }

//       const chequeValue = chequeMap.get(invoice.invoiceNumber);
//       const chequeValues = chequeValue
//         ? Array.isArray(chequeValue)
//           ? chequeValue
//           : [chequeValue]
//         : "No Cheques Found";

//       return {
//         ...invoice._doc,
//         invoiceSuffix,
//         lastOutstanding: status,
//         chequeValues: chequeValues,
//       };
//     });

    
//     result.sort(
//       (a, b) => parseInt(a.invoiceSuffix) - parseInt(b.invoiceSuffix)
//     );

//     res.status(200).json(result);
//   } catch (error) {
//     console.error("Error fetching invoices with outstanding and cheque details:", error.message);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

const getAllInvoicesWithOutstandingadmin = async (req, res) => {
  try {
    // 1️⃣ Get all invoices
    const invoices = await Invoice.find().sort({ invoiceNumber: 1 });

    // 2️⃣ Get latest outstanding per invoice
    const allOutstandings = await Outstanding.aggregate([
      {
        $match: {
          invoiceNumber: { $in: invoices.map(i => i.invoiceNumber) }
        }
      },
      { $sort: { date: -1 } },
      {
        $group: {
          _id: "$invoiceNumber",
          latestOutstanding: { $first: "$outstanding" }
        }
      }
    ]);

    // 3️⃣ Map outstanding values
    const outstandingMap = new Map();
    allOutstandings.forEach(o => {
      outstandingMap.set(o._id, o.latestOutstanding);
    });

    // 4️⃣ Build final response
    const result = invoices.map(invoice => {
      const invoiceSuffix = invoice.invoiceNumber.slice(-3);

      // ----- Outstanding Status -----
      let lastOutstanding = "Not Paid";
      const outstanding = outstandingMap.get(invoice.invoiceNumber);

      if (outstanding === 0) {
        lastOutstanding = "Paid";
      } else if (typeof outstanding === "number") {
        lastOutstanding = outstanding;
      }

      // ----- ✅ Pending Cheque Total (FIXED) -----
      let chequeTotal = 0;

      if (Array.isArray(invoice.cheques) && invoice.cheques.length > 0) {
        chequeTotal = invoice.cheques.reduce((sum, cheque) => {
          const status = (cheque.status || '').toLowerCase().trim();
          const amount = Number(cheque.amount) || 0;

          if (status === 'pending') {
            return sum + amount;
          }
          return sum;
        }, 0);
      }

      // ----- Final Object -----
      return {
        ...invoice._doc,
        invoiceSuffix,
        lastOutstanding,
        chequeValues: chequeTotal // ✅ Always NUMBER
      };
    });

    // 5️⃣ Send response
    res.status(200).json(result);

  } catch (error) {
    console.error("Error fetching invoices with outstanding:", error);
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
    // Find the most recent invoice whose TaxNo is not empty or zero
    const lastValidInvoice = await Invoice.findOne(
      { TaxNo: { $nin: [null, "", 0, "0"] } },
      { TaxNo: 1, _id: 0 }
    ).sort({ _id: -1 });

    let nextTaxNo = 1;

    if (lastValidInvoice && lastValidInvoice.TaxNo) {
      const parsedTaxNo = parseInt(lastValidInvoice.TaxNo, 10);
      if (!Number.isNaN(parsedTaxNo) && parsedTaxNo > 0) {
        nextTaxNo = parsedTaxNo + 1;
      }
    }

    res.status(200).json({ nextTaxNo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getProductQuantityByCode = async (req, res) => {
  try {
    const { startDate, endDate, exe } = req.query;

    // Build match stage
    const matchStage = { GatePassNo: 'Printed' };

    // Add executive filtering if provided (case-insensitive, ignore extra spaces)
    if (exe) {
      matchStage.exe = {
        $regex: new RegExp(`^${escapeRegExp(exe.trim())}\\s*$`, 'i'),
      };
    }

    // Add date filtering if provided
    if (startDate && endDate) {
      // Validate dates
      if (isNaN(new Date(startDate).getTime()) || isNaN(new Date(endDate).getTime())) {
        return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD format' });
      }

      // Create start and end dates with proper time handling
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0); // Start of the day
      
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // End of the day

      // Use $expr and $toDate for string-to-date comparison
      // If exe filter exists, combine with date filter
      if (matchStage.$expr) {
        matchStage.$expr.$and.push(
          { $gte: [{ $toDate: '$invoiceDate' }, start] },
          { $lte: [{ $toDate: '$invoiceDate' }, end] }
        );
      } else {
        matchStage.$expr = {
          $and: [
            { $gte: [{ $toDate: '$invoiceDate' }, start] },
            { $lte: [{ $toDate: '$invoiceDate' }, end] }
          ]
        };
      }
    } else if (startDate || endDate) {
      return res.status(400).json({ error: 'Both startDate and endDate are required for date filtering' });
    }

    const result = await Invoice.aggregate([
      { $match: matchStage },
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.productCode',
          productName: { $first: '$products.productName' },
          totalQuantity: { $sum: { $toDouble: '$products.quantity' } }
        }
      },
      {
        $project: {
          _id: 0,
          productCode: '$_id',
          productName: 1,
          totalQuantity: { $round: ['$totalQuantity', 2] }
        }
      },
      {
        $sort: { productCode: 1 }
      }
    ]);

    if (result.length === 0) {
      let message = 'No products found';
      const filters = [];
      if (exe) filters.push(`for executive: ${exe}`);
      if (startDate && endDate) filters.push(`between ${startDate} and ${endDate}`);
      if (filters.length > 0) {
        message += ' ' + filters.join(' ');
      }
      return res.status(404).json({ message });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching product quantities by code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateChequeStatus = async (req, res) => {
  const { invoiceNumber } = req.params;
  const { chequeId, status } = req.body;

  try {
    const invoice = await Invoice.findOne({ invoiceNumber });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Find the cheque to update
    const cheque = invoice.cheques.id(chequeId);

    if (!cheque) {
      return res.status(404).json({ message: 'Cheque not found' });
    }

    cheque.status = status; // update status
    await invoice.save();

    res.status(200).json({
      message: `Cheque status updated to ${status}`,
      invoice,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const updateChequeDepositDate = async (req, res) => {
  const { invoiceNumber } = req.params;
  const { chequeId, depositDate } = req.body;

  try {
    const invoice = await Invoice.findOne({ invoiceNumber });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Find the cheque to update
    const cheque = invoice.cheques.id(chequeId);

    if (!cheque) {
      return res.status(404).json({ message: 'Cheque not found' });
    }

    cheque.depositDate = depositDate; // update deposit date
    await invoice.save();

    res.status(200).json({
      message: 'Deposit date updated successfully',
      invoice,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const updateChequeAmount = async (req, res) => {
  const { invoiceNumber } = req.params;
  const { chequeId, amount } = req.body;

  try {
    const invoice = await Invoice.findOne({ invoiceNumber });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Find the cheque to update
    const cheque = invoice.cheques.id(chequeId);

    if (!cheque) {
      return res.status(404).json({ message: 'Cheque not found' });
    }

    cheque.amount = parseFloat(amount); // update amount
    await invoice.save();

    res.status(200).json({
      message: 'Cheque amount updated successfully',
      invoice,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const getAllChequeDetails = async (req, res) => {
  try {
    const invoices = await Invoice.find(
      { cheques: { $exists: true, $ne: [] } },
      {
        invoiceNumber: 1,
        customer: 1,
        exe: 1,
        invoiceDate: 1,
        Duedate: 1,
        cheques: 1
      }
    );

    const chequeList = [];

    invoices.forEach((invoice) => {
      invoice.cheques.forEach((cheque) => {
        chequeList.push({
          invoiceNumber: invoice.invoiceNumber,
          customer: invoice.customer,
          invoiceDate: invoice.invoiceDate,
          dueDate: invoice.Duedate,
          exe: invoice.exe,

          chequeId: cheque._id,
          chequeNo: cheque.chequeNo,
          bankName: cheque.bankName,
          depositDate: cheque.depositDate,
          amount: cheque.amount,
          status: cheque.status,
          addedAt: cheque.addedAt
        });
      });
    });

    res.status(200).json(chequeList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch cheque details' });
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
  checkOrderNumberExists,
  searchInvoices,
  updateInvoice,
  getInvoiceByNumber,
  getMonthlySales,
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
  getLastTaxNo,
  getProductQuantityByCode,
  updateInvoice,
  updateChequeStatus,
  updateChequeDepositDate,
  updateChequeAmount,
  getAllChequeDetails
  
  

 
  
  
};
