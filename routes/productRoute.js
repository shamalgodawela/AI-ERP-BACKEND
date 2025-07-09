const express = require("express");
const protect = require("../middleWare/authMiddleware");
const { createProduct, getProducts, getSingleProduct, deleteProduct, updateProduct, getProductByCategory } = require("../controllers/productController");
const { upload } = require("../utils/fileUpload");

const router = express.Router();

router.post("/",  upload.single("image"), createProduct);
router.get("/", protect, getProducts);
router.get("/:id", getSingleProduct);
router.delete("/:id", protect, deleteProduct);
router.patch("/:id", protect, upload.single("image"), updateProduct);
router.get("/category/:category", getProductByCategory); 


module.exports = router;
