const ReturnOldinvoice=require('../models/ReturnOldinvoice');
const Product=require('../models/productModel');

const addProductAndreturn =async(req, res)=>{
    const {invoiceNo, InvoiceDte, Customer, ProductCode, productName, quanity,value , reason} =req.body;

    try {

        const existingProduct= await Product.findOne({category : ProductCode });

        if(existingProduct){
            existingProduct.quantity= parseFloat(existingProduct.quantity) + parseFloat(quanity);
            await existingProduct.save();

        }
        const newProduct= new ReturnOldinvoice({
            invoiceNo,
            InvoiceDte,
            Customer,
            ProductCode,
            productName,
            quanity,
            value,
            reason,
        })

        const savereturnProduct= await newProduct.save();
        res.status(201).json('successfully created')
        
    } catch (error) {
        res.status(500).json({message:'server error'})
        console.log(error)
        
    }


    
}

module.exports={

    addProductAndreturn
}