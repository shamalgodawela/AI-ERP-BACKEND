const Product = require('../models/productModel'); 
const DateProduct = require('../models/dateProduct'); 
const BulkProduct = require('../models/bulkproduct');



const addProductAndUpdate = async (req, res) => {
    const { GpnDate, productName, category, unitPrice, numberOfUnits, packsize } = req.body;

    try {
        console.log('Request SKU:', category); 

   
        const existingProduct = await Product.findOne({
            sku: { $regex: new RegExp(category, "i") }
        });

        if (existingProduct) {
            const parsedNumberOfUnits = parseFloat(numberOfUnits);
            const parsedExistingQuantity = parseFloat(existingProduct.quantity);

          
            existingProduct.quantity = parsedExistingQuantity + parsedNumberOfUnits;
            await existingProduct.save();

            
            const parsedPacksize = !isNaN(parseInt(packsize)) ? parseInt(packsize) : 0;

            
            if (category === 'BP20') {
                
                let bulkProductBPB15 = await BulkProduct.findOne({ bulkCode: 'BPB20-1' });
                if (bulkProductBPB15) {
                   
                    let newQuantityBPB15 = (bulkProductBPB15.weight * bulkProductBPB15.quantity - numberOfUnits * 20) / bulkProductBPB15.weight;

                  
                    bulkProductBPB15.quantity = newQuantityBPB15;
                    await bulkProductBPB15.save();
                }

               ts
                let bulkProductGRN25 = await BulkProduct.findOne({ bulkCode: 'GRN25' });
                if (bulkProductGRN25) {
                   
                    let newQuantityGRN25 = (bulkProductGRN25.weight * bulkProductGRN25.quantity - numberOfUnits * 5) / bulkProductGRN25.weight;

                  
                    bulkProductGRN25.quantity = newQuantityGRN25;
                    await bulkProductGRN25.save();
                }
            } 
            else if (category === 'MNP20') {
               
                let bulkProductDAP50 = await BulkProduct.findOne({ bulkCode: 'DAP50' });
                if (bulkProductDAP50) {
                   
                    let newQuantityDAP50 = (bulkProductDAP50.weight * bulkProductDAP50.quantity - numberOfUnits * 4) / bulkProductDAP50.weight;

                 
                    bulkProductDAP50.quantity = newQuantityDAP50;
                    await bulkProductDAP50.save();
                }

                
                let bulkProductBPB20 = await BulkProduct.findOne({ bulkCode: 'BPB20' });
                if (bulkProductBPB20) {
                  
                    let newQuantityBPB20 = (bulkProductBPB20.weight * bulkProductBPB20.quantity - numberOfUnits * 6) / bulkProductBPB20.weight;

                    
                    bulkProductBPB20.quantity = newQuantityBPB20;
                    await bulkProductBPB20.save();
                }
            } 
            else if (category === 'MG800') {
                
                let bulkProductMGB25 = await BulkProduct.findOne({ bulkCode: 'MGB25' });
                if (bulkProductMGB25) {
                  
                    let newQuantityMGB25 = (bulkProductMGB25.weight * bulkProductMGB25.quantity - numberOfUnits * parsedPacksize) / bulkProductMGB25.weight;

                 
                    bulkProductMGB25.quantity = newQuantityMGB25;
                    await bulkProductMGB25.save();
                }

               
                let bulkProductWSB1000 = await BulkProduct.findOne({ bulkCode: 'WSB1000' });
                if (bulkProductWSB1000) {
                  
                    let newQuantityWSB1000 = (bulkProductWSB1000.weight * bulkProductWSB1000.quantity - numberOfUnits * 20) / bulkProductWSB1000.weight;

                
                    bulkProductWSB1000.quantity = newQuantityWSB1000;
                    await bulkProductWSB1000.save();
                }
            } 
            else if (category === 'MG400') {
               
                let bulkProductMGB25 = await BulkProduct.findOne({ bulkCode: 'MGB25' });
                if (bulkProductMGB25) {
                 
                    let newQuantityMGB25 = (bulkProductMGB25.weight * bulkProductMGB25.quantity - numberOfUnits * parsedPacksize) / bulkProductMGB25.weight;

                  
                    bulkProductMGB25.quantity = newQuantityMGB25;
                    await bulkProductMGB25.save();
                }

            
                let bulkProductWSB1000 = await BulkProduct.findOne({ bulkCode: 'WSB1000' });
                if (bulkProductWSB1000) {
                
                    let newQuantityWSB1000 = (bulkProductWSB1000.weight * bulkProductWSB1000.quantity - numberOfUnits * 40) / bulkProductWSB1000.weight;

                 
                    bulkProductWSB1000.quantity = newQuantityWSB1000;
                    await bulkProductWSB1000.save();
                }
            } 
            else {
            
                const bulkProducts = await BulkProduct.find({ 'products.productCode': category });

                if (bulkProducts.length > 0) {
              
                    const bulkProduct = bulkProducts[0];
                    let newQuantity = (bulkProduct.weight * bulkProduct.quantity - numberOfUnits * parsedPacksize) / bulkProduct.weight;

             
                    bulkProduct.quantity = newQuantity;
                    await bulkProduct.save();
                } else {
                    console.log('No bulkProduct found with the same product code.');
                  
                    return res.status(404).json({ success: false, message: 'No bulkProduct found with the same product code.' });
                }
            }
            
            

            const totweight = numberOfUnits * parseInt(packsize);

          
            const newProduct = await DateProduct.create({
                GpnDate,
                productName,
                category,
                unitPrice,
                numberOfUnits,
                packsize,
                totweight
            });

         
            return res.status(201).json({ success: true, message: 'Product added successfully.', product: newProduct });
        } else {
            console.log('No existing product found with the same SKU.');
            return res.status(404).json({ success: false, message: 'No existing product found with the same SKU.' });
        }
    } catch (error) {
        console.error('Error adding product:', error);
        return res.status(500).json({ success: false, message: 'Failed to add product.', error: error.message });
    }
};




const getAllDateProducts = async (req, res) => {
    try {
       
        const allDateProducts = await DateProduct.find();

    
        res.status(200).json(allDateProducts);
    } catch (error) {

        console.error('Error fetching dateProducts:', error);
        res.status(500).json({ error: 'Failed to fetch dateProducts' });
    }
};


module.exports = { addProductAndUpdate, getAllDateProducts };
