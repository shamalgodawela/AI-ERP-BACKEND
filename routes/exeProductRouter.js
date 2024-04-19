const express = require("express");

const { createProductexe, getProductsexe, getSingleProductexe } = require("../controllers/exeproducts");
const protectexe = require("../middleWare2/authMiddleware1");

const router = express.Router();

router.post("/addexeproduct",protectexe , createProductexe)
router.get("/allproductexe",protectexe, getProductsexe)
router.get("/getSingleProductExe/:id",protectexe, getSingleProductexe)

module.exports=router;