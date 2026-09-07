const express = require('express');
const OrdersController = require('../controllers/ordersController');
const protect = require("../middleWare/authMiddleware");
const authorize = require("../middleWare/authorize");

const router = express.Router();
const ordersController = new OrdersController();



router.post('/orders',protect, authorize("user","admin","Operation","account"), ordersController.addOrder);


router.get('/allorders', protect, authorize("user","admin","Operation","account"), ordersController.getAllOrders);


router.get('/orders/:orderNumber', protect, authorize("user","admin","Operation","account"), ordersController.getOrderDetails);


router.put('/orders/:orderNumber', protect, authorize("user","admin","Operation","account"), ordersController.updateOrderDetails);

router.get('/allor', protect, authorize("user", "admin"), ordersController.getAllOr);
router.get('/lastorder/ea', protect, authorize("user","admin","Operation","account"), ordersController.getLastOrderNumberStartingWithEA);
router.get('/lastorder/KU1', protect, authorize("user","admin","Operation","account"), ordersController.getLastOrderNumberStartingWithKU1);
router.get('/lastorder/NCP', protect, authorize("user","admin","Operation","account"), ordersController.getLastOrderNumberStartingWithNCP);
router.get('/lastorder/NUM', protect, authorize("user","admin","Operation","account"), ordersController.getLastOrderNumberStartingWithNUM)
router.get('/lastorder/PT1', protect, authorize("user","admin","Operation","account"), ordersController.getLastOrderNumberStartingWithPT1)
router.get('/lastorder/south1', protect, authorize("user","admin","Operation","account"), ordersController.getLastOrderNumberStartingWithSouth1);
router.get('/lastorder/upcountry', protect, authorize("user","admin","Operation","account"), ordersController.getLastOrderNumberStartingWithUpccountry);
router.get('/lastorder/other', protect, authorize("user","admin","Operation","account"), ordersController.getLastOrderNumberStartingWithother);
router.get('/lastorder/UpCountry1', protect, authorize("user","admin","Operation","account"), ordersController.getLastOrderNumberStartingWithUpccountry1);






module.exports = router;
