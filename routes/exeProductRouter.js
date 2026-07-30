const express = require("express");

const { getproductsbynawaneethan,createProductexe, getProductsexe, getSingleProductexe,getProductsByAhamed,getProductsBysanjeewa,getproductsbychmeera,getproductbydasun } = require("../controllers/exeproducts");
const protectexe = require("../middleWare2/authMiddleware1");
const authorize = require('../middleWare/authorize');

const router = express.Router();

router.post("/addexeproduct", protectexe, authorize("user","admin","Operation","account"), createProductexe)
router.get("/allproductexe", protectexe, authorize("user","admin","Operation","account"), getProductsexe)
router.get("/getSingleProductExe/:id", protectexe, authorize("user","admin","Operation","account"), getSingleProductexe)
router.get("/getproductallsexe", protectexe, authorize("user","admin","Operation","account"), getProductsByAhamed)
router.get("/getproductssanjeewa", protectexe, authorize("user","admin","Operation","account"), getProductsBysanjeewa)
router.get("/getproductschameera", protectexe, authorize("user","admin","Operation","account"), getproductsbychmeera)
router.get("/getproductsbydasun", protectexe, authorize("user","admin","Operation","account"), getproductbydasun)
router.get("/getproductbynawaneedan", protectexe, authorize("user","admin","Operation","account"), getproductsbynawaneethan)

module.exports=router;