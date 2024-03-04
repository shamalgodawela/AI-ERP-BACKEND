const express = require('express');
const OrdersController = require('../controllers/ordersController');

const router = express.Router();
const ordersController = new OrdersController();

// POST route to add an order
router.post('/orders', ordersController.addOrder);

// GET route to retrieve all orders
router.get('/allorders', ordersController.getAllOrders);

// GET route to retrieve details of a specific order by order number
router.get('/orders/:orderNumber', ordersController.getOrderDetails);

// PUT route to update details of a specific order by order number
router.put('/orders/:orderNumber', ordersController.updateOrderDetails);

module.exports = router;
