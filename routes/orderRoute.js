const express = require('express');
const OrdersController = require('../controllers/ordersController');

const router = express.Router();
const ordersController = new OrdersController();


router.post('/orders', ordersController.addOrder);


router.get('/allorders', ordersController.getAllOrders);


router.get('/orders/:orderNumber', ordersController.getOrderDetails);


router.put('/orders/:orderNumber', ordersController.updateOrderDetails);

router.get('/allor', ordersController.getAllOr);


router.get('/lastorder/ea', ordersController.getLastOrderNumberStartingWithEA);
router.get('/lastorder/KU1', ordersController.getLastOrderNumberStartingWithKU1);
router.get('/lastorder/NCP', ordersController.getLastOrderNumberStartingWithNCP);
router.get('/lastorder/NUM', ordersController.getLastOrderNumberStartingWithNUM)
router.get('/lastorder/PT1', ordersController.getLastOrderNumberStartingWithPT1)
router.get('/lastorder/south1', ordersController.getLastOrderNumberStartingWithSouth1);
router.get('/lastorder/upcountry', ordersController.getLastOrderNumberStartingWithUpccountry);
router.get('/lastorder/other', ordersController.getLastOrderNumberStartingWithother);






module.exports = router;
