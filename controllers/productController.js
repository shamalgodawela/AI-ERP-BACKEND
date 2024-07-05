const asyncHandler =require("express-async-handler");
const Product=require("../models/productModel");
const { fileSizeFormatter } = require("../utils/fileUpload");
const cloudinary= require("cloudinary").v2;


const createProduct = asyncHandler(async(req, res) => {
    const { name, category, quantity, price, description,discount } = req.body;

    // Validation
    if (!name || !category || !quantity || !price || !description) {
        res.status(400);
        throw new Error("Please fill all fields");
    }

    // Handle image upload
    let fileData = {};
    if (req.file) {
        // Save image to cloudinary
        let uploadedFile;

        try {
            uploadedFile = await cloudinary.uploader.upload(req.file.path, { folder: "Nihon App", resource_type: "image" });
        } catch (error) {
            res.status(500);
            throw new Error("Image could not be uploaded");
        }

        fileData = {
            fileName: req.file.originalname,
            filePath: uploadedFile.secure_url,
            fileType: req.file.originalmimetype,
            fileSize: fileSizeFormatter(req.file.size, 2),
        };
    }

    // Set SKU as the value of the category
    const sku = category;

    // Create product
    const product = await Product.create({
        user: req.user.id,
        name,
        sku,
        category,
        price,
        quantity,
        description,
        image: fileData,
        discount,
    });

    res.status(201).json(product);
});


// get all product--------------------------------------------------------------------------------------
const getProducts=(asyncHandler(async(req, res)=>{
    const products= await Product.find().sort("-createdAt");//{user:req.user.id}
    res.status(200).json(products)

}))

// get single product
const getSingleProduct= (asyncHandler(async(req, res)=>{
    const product= await Product.findById(req.params.id)
    if(!product){
        res.status(404)
        throw new Error("product not found")
    }
    // if(product.user.toString()!== req.user.id){
    //     res.status(401)
    //     throw new Error("user not authorized");

    // }
    res.status(200).json(product);

}))

//delete product-------------------------------------------------------------------------------
// const deleteProduct= asyncHandler(async(req, res)=>{

//     const product= await Product.findById(req.params.id)
//     if(!product){
//         res.status(404)
//         throw new Error("product not found")
//     }
//     // if(product.user.toString()!== req.user.id){
//     //     res.status(401)
//     //     throw new Error("user not authorized");

//     // }
//     await product.findByIdAndDelete(id);
//     res.status(200).json(product);

// });

const deleteProduct=asyncHandler(async(req,res)=>{
    try {
        const {id}= req.params
        const product=await Product.findByIdAndDelete(id)

        if(!product){
            return res.status(404).json(`No product with id: ${id}`)
        }
        res.status(200).json({message:"product deleted"})
    } catch (error) {
        res.status(500).json({msg: error.message})
    }
})
// update product----------------------------------------------------------------------------

const updateProduct= asyncHandler(async(req, res)=>{
    const {name, category, quantity,price, description,discount}= req.body;
    const {id}= req.params;

    const product= await Product.findById(id)
    if(!product){
       res.status(404);
       throw new Error("product not found")
    }

    // handle image upload
    let fileData={}
    if(req.file){
        //save image to cloudinary
        let uploadedFile;

        try {
            uploadedFile=await cloudinary.uploader.upload(req.file.path,{folder:"Nihon App", resource_type:"image"})
        } catch (error) {
            res.status(500)
            throw new Error("image could not be uploaded")
            
        }
        fileData={
            fileName:req.file.originalname,
            filePath:uploadedFile.secure_url,
            fileType:req.file.originalmimetype,
            fileSize:fileSizeFormatter(req.file.size, 2),
        }
    }

    

// updated product
 const updatedProduct= await Product.findByIdAndUpdate(
    {_id:id},
    {
        
        name,
        category,
        price,
        quantity,
        price,
        description,
        discount,
        image: Object.keys(fileData).length === 0 ? product.image :fileData,
    },
    {
        new: true,
        runValidators:true
    }


 )
    res.status(200).json(updatedProduct);


})

// get a product using category
const getProductByCategory = asyncHandler(async (req, res) => {
    const { category } = req.params;
  
    try {
      // Find the product in the database by category
      const product = await Product.findOne({ category });
  
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
  
      // Return the product as JSON response
      res.json(product);
    } catch (error) {
      console.error('Error fetching product by category:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


module.exports={
    createProduct,
    getProducts,
    getSingleProduct,
    deleteProduct,
    updateProduct,
    getProductByCategory
  
}