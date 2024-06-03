const express = require("express");

const { getproductsbynawaneethan,createProductexe, getProductsexe, getSingleProductexe,getProductsByAhamed,getProductsBysanjeewa,getproductsbychmeera,getproductbydasun } = require("../controllers/exeproducts");
const protectexe = require("../middleWare2/authMiddleware1");

const router = express.Router();

router.post("/addexeproduct",protectexe , createProductexe)
router.get("/allproductexe",protectexe, getProductsexe)
router.get("/getSingleProductExe/:id",protectexe, getSingleProductexe)
router.get("/getproductallsexe",getProductsByAhamed)
router.get("/getproductssanjeewa",getProductsBysanjeewa)
router.get("/getproductschameera",getproductsbychmeera)
router.get("/getproductsbydasun",getproductbydasun)
router.get("/getproductbynawaneedan",getproductsbynawaneethan)

module.exports=router;