const CanInvoice = require('../models/CanceldInvoice');
const Product = require("../models/productModel");
const asyncHandler =require("express-async-handler");



const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
};
const addCanceledInvoice = async (req, res) => {
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
        // Ensure values are numbers before adding
        existingProduct.quantity = parseFloat(existingProduct.quantity) + parseFloat(product.quantity);
        existingProduct.amount = parseFloat(existingProduct.amount) + parseFloat(product.invoiceTotal);

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

    const newInvoice = new CanInvoice(invoiceData);
    const savedInvoice = await newInvoice.save();

    res.status(201).json(savedInvoice);
  } catch (error) {
    console.error('Error adding invoice:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const getAllCancelInvoice = async(req, res)=>{
  try {
    const allcaninvoice= await CanInvoice.find().sort({invoiceDate: -1});
    res.status(200).json(allcaninvoice)
    
  } catch (error) {
    console.error('error fetching all invoices', error.message)

    res.status(500).json({error: 'internal server error'})
    
  }
};

const getCancelInvoiceById = asyncHandler(async (req, res) => {
  const { invoiceNumber } = req.params;

  try {
    const cancelInvoice = await CanInvoice.findOne({invoiceNumber});
    
    if (!cancelInvoice) {
      return res.status(404).json({ error: 'Cancel invoice not found' });
    }

    res.status(200).json(cancelInvoice);
  } catch (error) {
    console.error(`Error fetching canceled invoice with id: ${invoiceNumber}`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = {
  addCanceledInvoice,
  getAllCancelInvoice,
  getCancelInvoiceById
};
