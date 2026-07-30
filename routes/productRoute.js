const express = require("express");
const protect = require("../middleWare/authMiddleware");
const authorize = require("../middleWare/authorize");
const { createProduct, getProducts, getSingleProduct, deleteProduct, updateProduct, getProductByCategory, saveDailyStock, getAllSnapshots } = require("../controllers/productController");
const { upload } = require("../utils/fileUpload");

const router = express.Router();

router.post("/", protect, authorize("user","admin","Operation","account"), upload.single("image"), createProduct);
router.get("/", protect, authorize("user","admin","Operation","account"), getProducts);
router.get("/:id", protect, authorize("user","admin","Operation","account"), getSingleProduct);
router.delete("/:id", protect, authorize("user","admin","Operation","account"), deleteProduct);
router.patch("/:id", protect, authorize("user","admin","Operation","account"), upload.single("image"), updateProduct);
router.get("/category/:category", protect, authorize("user","admin","Operation","account"), getProductByCategory); 
router.get("/all-snapshots", protect, authorize("user","admin","Operation","account"), getAllSnapshots);


module.exports = router;
