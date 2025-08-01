const Order = require('../models/order');
const Invoice = require('../models/invoice');

class OrdersController {
    async addOrder(req, res) {
        try {
           
            const existingOrder = await Order.findOne({ orderNumber: req.body.orderNumber });
            if (existingOrder) {
                return res.status(400).json({ error: 'Order number must be unique' });
            }

            
            const productsWithCalculatedFields = req.body.products.map(product => {
                const labelPrice = parseFloat(product.labelPrice);
                const discount = parseFloat(product.discount);
                const quantity = parseFloat(product.quantity);
                const unitPrice = labelPrice * (1 - discount / 100); 
                const invoiceTotal = unitPrice * quantity; 
                return {
                    ...product,
                    unitPrice: isNaN(unitPrice) ? '' : unitPrice.toFixed(2),
                    invoiceTotal: isNaN(invoiceTotal) ? '' : invoiceTotal.toFixed(2)
                };
            });

            const status = req.body.status || "pending";

           
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
                VatRegNo:req.body.VatRegNo,
                VatNO:req.body.VatNO,
                TaxNo:req.body.TaxNo,
                CreditPeriod:req.body.CreditPeriod,
                Paymentmethod:req.body.Paymentmethod,
                CusVatNo:req.body.CusVatNo,
                IncentiveDueDate: req.body.IncentiveDueDate
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
       
            const orders = await Order.find();

   
            const ordersWithCheckStatus = await Promise.all(
                orders.map(async (order) => {
               
                    const invoice = await Invoice.findOne({ orderNumber: order.orderNumber });
                    return {
                        ...order.toJSON(),
                        checked: !!invoice, 
                    };
                })
            );

            res.status(200).json(ordersWithCheckStatus);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getOrderDetails(req, res) {
        try {
        
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
        const updatedOrderData = req.body; 

        try {
           
            let order = await Order.findOne({ orderNumber });

        
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }

           
            order.set(updatedOrderData); 
            await order.save(); r

            
            res.status(200).json(order);
        } catch (error) {
            console.error('Failed to update order details', error);
            res.status(500).json({ error: 'Failed to update order details' });
        }
    }
    async getAllOr(req, res) {
        try {
           
            const { period, status, exe } = req.query;

          
            const filter = {};
            if (period) {
               
                let startDate, endDate;
                const today = moment().startOf('day');
                switch (period) {
                    case 'today':
                        startDate = today;
                        endDate = moment(today).endOf('day');
                        break;
                    case 'thisWeek':
                        startDate = moment(today).startOf('week');
                        endDate = moment(today).endOf('week');
                        break;
                    case 'thisMonth':
                        startDate = moment(today).startOf('month');
                        endDate = moment(today).endOf('month');
                        break;
               
                    default:
                     
                        return res.status(400).json({ error: 'Invalid period value.' });
                }

                filter.createdAt = { $gte: startDate, $lte: endDate };
            }
            if (status) {
                filter.status = status;
            }
            if (exe) {
                filter.exe = exe;
            }

         
            const orders = await Order.find(filter);

            
            const ordersWithCheckStatus = await Promise.all(
                orders.map(async (order) => {
                 
                    const invoice = await Invoice.findOne({ orderNumber: order.orderNumber });
                    return {
                        ...order.toJSON(),
                        checked: !!invoice,
                    };
                })
            );

            res.status(200).json(ordersWithCheckStatus);
        } catch (error) {
            console.error('Error fetching orders:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    async getLastOrderNumberStartingWithEA(req, res) {
        try {
            // Find the last order number that starts with "EA"
            const lastOrder = await Order.findOne({ orderNumber: /^EA1/ })
                .sort({ orderNumber: -1 })
                .limit(1);
    
            if (lastOrder) {
                return res.status(200).json({ lastOrderNumber: lastOrder.orderNumber });
            } else {
                return res.status(404).json({ error: 'No order with order number starting with "EA" found' });
            }
        } catch (error) {
            console.error('Error fetching last order number:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    };
    async getLastOrderNumberStartingWithEA2(req, res) {
        try {
            // Find the last order number that starts with "EA2"
            const lastOrder = await Order.findOne({ orderNumber: /^EA2/ })
                .sort({ orderNumber: -1 })
                .limit(1);
    
            if (lastOrder) {
                return res.status(200).json({ lastOrderNumber: lastOrder.orderNumber });
            } else {
                return res.status(404).json({ error: 'No order with order number starting with "EA" found' });
            }
        } catch (error) {
            console.error('Error fetching last order number:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    };
    async getLastOrderNumberStartingWithSU(req, res) {
        try {
            // Find the last order number that starts with "EA"
            const lastOrder = await Order.findOne({ orderNumber: /^SU/ })
                .sort({ orderNumber: -1 })
                .limit(1);
    
            if (lastOrder) {
                return res.status(200).json({ lastOrderNumber: lastOrder.orderNumber });
            } else {
                return res.status(404).json({ error: 'No order with order number starting with "SU" found' });
            }
        } catch (error) {
            console.error('Error fetching last order number:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    };
    async getLastOrderNumberStartingWithNCP(req, res) {
        try {
            // Find the last order number that starts with "EA"
            const lastOrder = await Order.findOne({ orderNumber: /^NCP/ })
                .sort({ orderNumber: -1 })
                .limit(1);
    
            if (lastOrder) {
                return res.status(200).json({ lastOrderNumber: lastOrder.orderNumber });
            } else {
                return res.status(404).json({ error: 'No order with order number starting with "NCP" found' });
            }
        } catch (error) {
            console.error('Error fetching last order number:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    };
    async getLastOrderNumberStartingWithUPC(req, res) {
        try {
            // Find the last order number that starts with "EA"
            const lastOrder = await Order.findOne({ orderNumber: /^UPC1/ })
                .sort({ orderNumber: -1 })
                .limit(1);
    
            if (lastOrder) {
                return res.status(200).json({ lastOrderNumber: lastOrder.orderNumber });
            } else {
                return res.status(404).json({ error: 'No order with order number starting with "UPC" found' });
            }
        } catch (error) {
            console.error('Error fetching last order number:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    };
    async getLastOrderNumberStartingWithUPC2(req, res) {
        try {
            // Find the last order number that starts with "EA"
            const lastOrder = await Order.findOne({ orderNumber: /^UPC2/ })
                .sort({ orderNumber: -1 })
                .limit(1);
    
            if (lastOrder) {
                return res.status(200).json({ lastOrderNumber: lastOrder.orderNumber });
            } else {
                return res.status(404).json({ error: 'No order with order number starting with "UPC" found' });
            }
        } catch (error) {
            console.error('Error fetching last order number:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    };
    async getLastOrderNumberStartingWithNUM(req, res) {
        try {
            // Find the last order number that starts with "EA"
            const lastOrder = await Order.findOne({ orderNumber: /^NUM/ })
                .sort({ orderNumber: -1 })
                .limit(1);
    
            if (lastOrder) {
                return res.status(200).json({ lastOrderNumber: lastOrder.orderNumber });
            } else {
                return res.status(404).json({ error: 'No order with order number starting with "NUM" found' });
            }
        } catch (error) {
            console.error('Error fetching last order number:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    };
}


module.exports = OrdersController;


