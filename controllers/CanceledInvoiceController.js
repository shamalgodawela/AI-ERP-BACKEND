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
        // Update the quantity and amount in the database
        parseFloat(existingProduct.quantity) += parseFloat(product.quantity);
        parseFloat(existingProduct.amount) += parseFloat(product.invoiceTotal);

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

module.exports=
{
    addCanceledInvoice

}