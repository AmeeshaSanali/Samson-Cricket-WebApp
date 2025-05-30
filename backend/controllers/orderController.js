const Order = require("../models/orderModel");
const CricketBat = require("../models/batsModel");
const CricketProtectionGear = require("../models/protectionModel");
const Merchandise = require("../models/merchModel");
const Shoe = require("../models/shoeModel");
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { generateInvoicePDF } = require('../utils/invoiceGenerator');

const createOrder = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.id;

        const { items, deliveryAddress, phoneNumber, paymentMethod, paymentDetails } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        for (const item of items) {
            let product;
            if (item.productModel === 'CricketBat') {
                product = await CricketBat.findById(item.productId);
            } else if (item.productModel === 'CricketProtectionGear') {
                product = await CricketProtectionGear.findById(item.productId);
            } else if (item.productModel === 'Merchandise') {
                product = await Merchandise.findById(item.productId);
            } else if (item.productModel === 'Shoe') {
                product = await Shoe.findById(item.productId);
            } else {
                return res.status(400).json({ message: "Invalid product model" });
            }

            if (!product) {
                return res.status(400).json({ message: "Invalid product ID" });
            }

            if (item.quantity <= 0) {
                return res.status(400).json({ message: "Invalid quantity" });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({ message: "Insufficient Stock" });
            }

            item.price = product.price; // Set price from the found product
        }

        const totalAmount = items.reduce((total, item) => total + item.price * item.quantity, 0);

        const order = new Order({
            userId: userId,
            firstName: user.firstname,
            lastName: user.lastname,
            email: user.email,
            items: items,
            totalAmount: totalAmount,
            deliveryAddress: deliveryAddress,
            phoneNumber: phoneNumber,
            paymentMethod: paymentMethod,
            paymentDetails: paymentDetails,
        });

        await order.save();

        // Update product stock after order is saved
        for (const item of items) {
            if (item.productModel === 'CricketBat') {
                await CricketBat.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
            } else if (item.productModel === 'CricketProtectionGear') {
                await CricketProtectionGear.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
            } else if (item.productModel === 'Merchandise') {
                await Merchandise.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
            } else if (item.productModel === 'Shoe') {
                await Shoe.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
            }
        }

        res.status(201).json({ message: "Order created successfully", order: order });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Failed to create order", error: error.message });
    }
};

const updateOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({ message: "Order updated successfully", order: order });
    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({ message: "Failed to update order" });
    }
};

// Get an order by Order ID
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate("items.productId");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json(order);
    } catch (error) {
        console.error("Error getting order:", error);
        res.status(500).json({ message: "Failed to get order" });
    }
};

// Get orders by User ID
const getOrdersByUserId = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.id }).populate("items.productId"); // Ensure populate is here

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: "No orders found for this user" });
        }

        res.status(200).json(orders);
    } catch (error) {
        console.error("Error getting user orders:", error);
        res.status(500).json({ message: "Failed to get user orders" });
    }
};

// Get all orders (admin only)
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate("items.productId");

        res.status(200).json(orders);
    } catch (error) {
        console.error("Error getting orders:", error);
        res.status(500).json({ message: "Failed to get orders" });
    }
};

// Delete an order (admin only)
const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).json({ message: error.message });
    }
};

const downloadInvoice = async (req, res) => {
    try {
        const orderId = req.params.orderId;

        // First get the order without population
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        // Manually populate each item based on its productModel
        for (const item of order.items) {
            if (item.productModel === 'CricketBat') {
                item.productId = await CricketBat.findById(item.productId);
            } else if (item.productModel === 'CricketProtectionGear') {
                item.productId = await CricketProtectionGear.findById(item.productId);
            } else if (item.productModel === 'Merchandise') {
                item.productId = await Merchandise.findById(item.productId);
            } else if (item.productModel === 'Shoe') {
                item.productId = await Shoe.findById(item.productId);
            }
        }

        const pdfDoc = await generateInvoicePDF(order);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="invoice_${orderId}.pdf"`);

        pdfDoc.pipe(res);
        pdfDoc.end();

    } catch (error) {
        console.error('Error generating invoice:', error);
        res.status(500).json({ message: 'Failed to generate invoice.', error: error.message });
    }
};

module.exports = {
    createOrder,
    updateOrder,
    getOrderById,
    getOrdersByUserId, // Added this function
    getAllOrders,
    deleteOrder,
    downloadInvoice,
};