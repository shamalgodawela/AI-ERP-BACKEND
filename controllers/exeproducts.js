const asyncHandler = require("express-async-handler");
const Exeproduct = require("../models/exeProduct");
const Exe = require('../models/exe');
const { exec } = require("child_process");

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
const getProductsByAhamed = async (req, res) => {
    const userId = "6622138a97797a3b0394692f";
    try {
      
      const products = await Exeproduct.find({ user: userId });
  
      if (!products.length) {
        return res.status(404).json({ error: 'No products found for this user' });
      }
  
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  };

const getProductsBysanjeewa =async (req, res)=>{
    const userId= "662214b897797a3b03946935";

    try {
        const products= await Exeproduct.find({user:userId})

        if(!products.length){
            return res.status(404).json({error:"no products found with this user"})
        }
        res.json(products);
        
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
        
    }
};

const getproductsbychmeera= async (req,res)=>{
    const userId="6622146b97797a3b03946932";

    try {
        const products= await Exeproduct.find({user:userId})

        if(!products.length){
            return res.status(400).json({error:'no products found with this user'})

        }
        res.json(products)
        
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
        
    }
}

const getproductbydasun= async(req,res)=>{
    const userId="66221af197797a3b03946938"
    try {
        const products= await Exeproduct.find({user:userId});
        if(!products.length){
            return res.status(404).json({error:'no products found with this user'})
        }
        res.json(products)
        
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
        
    }
}
const getproductsbynawaneethan= async (req,res)=>{
    const userId="663b46498da136f464fb3dd2";

    try {

        const products= await Exeproduct.find({user:userId});

        if(!products.length){
            return res.status(404).json({error:'no products found with this user'})
        }
        
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
        
    }
}
module.exports = {
    createProductexe,
    getProductsexe,
    getSingleProductexe,
    getProductsByAhamed,
    getProductsBysanjeewa,
    getproductsbychmeera,
    getproductbydasun,
    getproductsbynawaneethan
};
