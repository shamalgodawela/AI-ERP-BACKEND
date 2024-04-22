const asyncHandler = require("express-async-handler");
const Exeproduct = require("../models/exeProduct");

const createProductexe = asyncHandler(async (req, res) => {
    const { name,quantity, price, code } = req.body;

    // Validation
    if (!name || !quantity || !price || !code) {
        res.status(400);
        throw new Error("Please fill all fields");
    }

    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
        res.status(401);
        throw new Error("User not authenticated");
    }

    // Set SKU as the value of the category
    const sku = code;

    // Create product
    const productexe = await Exeproduct.create({
        user: req.user.id, // Assuming user ID is available in req.user
        name,
        sku,
        price,
        quantity,
        code,
    });

    res.status(201).json(productexe);
});

// get all product--------------------------------------------------------------------------------------
const getProductsexe=(asyncHandler(async(req, res)=>{
    const products= await Exeproduct.find({user:req.user.id}).sort("-createdAt");//{user:req.user.id}
    res.status(200).json(products)

}))

// get single product
const getSingleProductexe= (asyncHandler(async(req, res)=>{
    const product= await Exeproduct.findById(req.params.id)
    if(!product){
        res.status(404)
        throw new Error("product not found")
    }
    if(product.user.toString()!== req.user.id){
        res.status(401)
        throw new Error("user not authorized");

    }
    res.status(200).json(product);

}))

module.exports = {
    createProductexe,
    getProductsexe,
    getSingleProductexe
};
