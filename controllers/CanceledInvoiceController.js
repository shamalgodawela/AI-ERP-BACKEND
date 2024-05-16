const CanInvoice = require('../models/CanceldInvoice');
const Product = require("../models/productModel");


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
        // Parse the existing quantity and invoice total as floats
        const exQuantity = parseFloat(existingProduct.quantity);
        const exInvoiceTotal = parseFloat(existingProduct.invoiceTotal);
        
        // Parse the incoming product's quantity and invoice total as floats
        const newQuantity = parseFloat(product.quantity);
        const newInvoiceTotal = parseFloat(product.invoiceTotal);
        
        // Update the existing product's quantity and invoice total
        existingProduct.quantity = exQuantity + newQuantity;
        existingProduct.invoiceTotal = exInvoiceTotal + newInvoiceTotal;
        
        // Save the updated product in the database
        await existingProduct.save();
    }
     else {
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

module.exports=
{
    addCanceledInvoice

}