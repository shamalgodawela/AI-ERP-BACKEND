const Order = require('../models/order');

class OrdersController {
    async addOrder(req, res) {
        try {
            // Check if orderNumber already exists
            const existingOrder = await Order.findOne({ orderNumber: req.body.orderNumber });
            if (existingOrder) {
                return res.status(400).json({ error: 'Order number must be unique' });
            }

            // Calculate unitPrice and invoiceTotal for each product
            const productsWithCalculatedFields = req.body.products.map(product => {
                const labelPrice = parseFloat(product.labelPrice);
                const discount = parseFloat(product.discount);
                const quantity = parseFloat(product.quantity);
                const unitPrice = labelPrice * (1 - discount / 100); // Calculate unit price
                const invoiceTotal = unitPrice * quantity; // Calculate invoice total
                return {
                    ...product,
                    unitPrice: isNaN(unitPrice) ? '' : unitPrice.toFixed(2),
                    invoiceTotal: isNaN(invoiceTotal) ? '' : invoiceTotal.toFixed(2)
                };
            });

            const status = req.body.status || "pending";

            // Create a new order with updated product fields
            const newOrder = new Order({
                products: productsWithCalculatedFields,
                invoiceNumber: req.body.invoiceNumber,
                customer: req.body.customer,
                code: req.body.code,
                address: req.body.address,
                contact: req.body.contact,
                invoiceDate: req.body.invoiceDate,
                orderNumber: req.body.orderNumber,
                orderDate: req.body.orderDate,
                exe: req.body.exe,
                status: status,
            });

            // Save the order
            await newOrder.save();
            res.status(201).json(newOrder);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getAllOrders(req, res) {
        try {
            // Retrieve all orders from the database
            const orders = await Order.find();
            res.status(200).json(orders);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getOrderDetails(req, res) {
        try {
            // Retrieve order details by order number
            const order = await Order.findOne({ orderNumber: req.params.orderNumber });
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }
            res.status(200).json(order);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async updateOrderDetails(req, res) {
        const orderNumber = req.params.orderNumber;
        const updatedOrderData = req.body; // Assuming updated data is sent in the request body

        try {
            // Fetch the order from the database
            let order = await Order.findOne({ orderNumber });

            // Check if order exists
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }

            // Update order details with the provided data
            order.set(updatedOrderData); // Apply updates
            await order.save(); // Save the updated order

            // Send the updated order details in the response
            res.status(200).json(order);
        } catch (error) {
            console.error('Failed to update order details', error);
            res.status(500).json({ error: 'Failed to update order details' });
        }
    }
}

module.exports = OrdersController;


