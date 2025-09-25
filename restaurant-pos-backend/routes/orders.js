// backend/routes/orders.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize'); // Import Op for Sequelize operators

// Helper to generate a unique order number (e.g., ORD-YYYYMMDD-XXXX)
const generateOrderNumber = async (transaction) => {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, ''); //YYYYMMDD
    const todayOrdersCount = await global.models.Order.count({
        where: {
            order_number: {
                [Op.like]: `ORD-${datePart}-%`
            }
        },
        transaction // Pass transaction to count
    });
    const nextNumber = todayOrdersCount + 1;
    return `ORD-${datePart}-${String(nextNumber).padStart(4, '0')}`;
};

// Calculate item total based on quantity, price, discount, and discount type
const calculateItemLineTotal = (quantity, price, itemDiscount, itemDiscountType) => {
    const numericQuantity = parseFloat(quantity) || 0;
    const numericPrice = parseFloat(price) || 0;
    const numericItemDiscount = parseFloat(itemDiscount) || 0;

    let lineTotal = numericQuantity * numericPrice;
    let effectiveDiscount = 0;

    if (itemDiscountType === 'percentage') {
        effectiveDiscount = lineTotal * (numericItemDiscount / 100);
    } else if (itemDiscountType === 'amount') {
        effectiveDiscount = numericItemDiscount;
    }
    return Math.max(0, lineTotal - effectiveDiscount); // Item total cannot be negative
};


// GET all orders (with optional filters)
router.get('/', async (req, res) => {
    try {
        if (!global.models || !global.models.Order || !global.models.OrderItem || !global.models.Customer || !global.models.User || !global.models.Product) {
            console.error('GET /orders: Server configuration error: Models not initialized');
            return res.status(500).json({ message: 'Server configuration error: Models not initialized' });
        }

        const { status, customerId, createdBy, startDate, endDate, timezone } = req.query;
        const whereClause = {};

        // --- START DEBUGGING LOGS ---
        console.log('GET /orders: Received query parameters:', req.query);
        console.log('GET /orders: User ID from auth middleware (req.user.id):', req.user ? req.user.id : 'N/A');
        // --- END DEBUGGING LOGS ---

        if (status) whereClause.status = status;
        if (customerId) whereClause.customer_id = customerId;
        if (createdBy) whereClause.created_by = createdBy; // This is the filter the frontend sends for userId
        
        // Date filtering with timezone support
        if (startDate && endDate) {
            whereClause.created_at = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
            console.log(`Filtering orders by date range: ${startDate} to ${endDate} (timezone: ${timezone || 'UTC'})`);
        } else if (startDate) {
            whereClause.created_at = {
                [Op.gte]: new Date(startDate)
            };
        } else if (endDate) {
            whereClause.created_at = {
                [Op.lte]: new Date(endDate)
            };
        }

        // --- START DEBUGGING LOGS ---
        console.log('GET /orders: Constructed whereClause:', whereClause);
        // --- END DEBUGGING LOGS ---

        const orders = await global.models.Order.findAll({
            where: whereClause,
            include: [
                {
                    model: global.models.OrderItem,
                    as: 'items',
                    attributes: [
                        'id', 'product_id', 'name', 'quantity', 'price',
                        'item_discount', 'item_total', 'item_discount_type',
                        'instructions', 'is_kot_selected'
                    ],
                    include: [{
                        model: global.models.Product,
                        as: 'product',
                        attributes: ['id', 'name', 'image_path', 'stock', 'preparation_area']
                    }]
                },
                {
                    model: global.models.Customer,
                    as: 'customer',
                    attributes: ['id', 'name', 'phone', 'email']
                },
                {
                    model: global.models.User,
                    as: 'creator',
                    attributes: ['id', 'username']
                },
                {
                    model: global.models.Table,
                    as: 'table',
                    attributes: ['id', 'table_number', 'table_name', 'capacity', 'status', 'location', 'floor']
                },
                {
                    model: global.models.Room,
                    as: 'room',
                    attributes: ['id', 'room_number', 'room_type', 'floor', 'status']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        // --- START DEBUGGING LOGS ---
        console.log('GET /orders: Number of orders found by Sequelize:', orders.length);
        console.log('GET /orders: Sample order data (first 2):', JSON.stringify(orders.slice(0, 2), null, 2));
        // --- END DEBUGGING LOGS ---

        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
    }
});

// GET order by ID
router.get('/:id', async (req, res) => {
    try {
        if (!models || !global.models.Order || !global.models.OrderItem || !global.models.Customer || !global.models.Product || !global.models.User) {
            return res.status(500).json({ message: 'Server configuration error: Models not initialized' });
        }

        const orderId = parseInt(req.params.id, 10);
        if (isNaN(orderId)) {
            return res.status(400).json({ message: 'Invalid order ID' });
        }

        const order = await global.models.Order.findByPk(orderId, {
            include: [
                {
                    model: global.models.OrderItem,
                    as: 'items',
                    attributes: [
                        'id', 'product_id', 'name', 'quantity', 'price',
                        'item_discount', 'item_total', 'item_discount_type',
                        'instructions', 'is_kot_selected'
                    ],
                    include: [{
                        model: global.models.Product,
                        as: 'product',
                        attributes: ['id', 'name', 'image_path', 'stock', 'preparation_area']
                    }]
                },
                {
                    model: global.models.Customer,
                    as: 'customer',
                    attributes: ['id', 'name', 'phone', 'email']
                },
                {
                    model: global.models.User,
                    as: 'creator',
                    attributes: ['id', 'username']
                },
                {
                    model: global.models.Table,
                    as: 'table',
                    attributes: ['id', 'table_number', 'table_name', 'capacity', 'status', 'location', 'floor']
                },
                {
                    model: global.models.Room,
                    as: 'room',
                    attributes: ['id', 'room_number', 'room_type', 'floor', 'status']
                }
            ]
        });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (error) {
        console.error('Error fetching order by ID:', error);
        res.status(500).json({ message: 'Failed to fetch order', error: error.message });
    }
});

// POST create a new order (or hold order)
router.post('/', async (req, res) => {
    const t = await global.sequelize.transaction();
    try {
        if (!models || !global.models.Customer || !global.models.User || !global.models.Order || !global.models.OrderItem || !global.models.Product) {
            await t.rollback();
            return res.status(500).json({ message: 'Server configuration error: Models not initialized' });
        }

        let {
            customer_id,
            items, // Array of { product_id, name, quantity, price, item_discount, item_discount_type, instructions, is_kot_selected }
            cart_discount = 0,
            cart_discount_type = 'percentage',
            tax_rate = 0,
            status = 'held', // Default status for POS created orders
            table_id,
            room_id,
            order_type = 'dine_in',
        } = req.body;

        const created_by = req.user.id; // Assuming auth middleware sets req.user.id

        // Validate inputs
        if (!items || !Array.isArray(items) || items.length === 0) {
            await t.rollback();
            return res.status(400).json({ message: 'Items are required and must be a non-empty array' });
        }
        
        // Customer ID is optional for walk-in customers
        let customer = null;
        if (customer_id && !isNaN(parseInt(customer_id))) {
            customer = await global.models.Customer.findByPk(customer_id, { transaction: t });
            if (!customer) {
                await t.rollback();
                return res.status(404).json({ message: `Customer with ID ${customer_id} not found` });
            }
        }
        const user = await global.models.User.findByPk(created_by, { transaction: t });
        if (!user) {
            await t.rollback();
            return res.status(401).json({ message: `User with ID ${created_by} not found` });
        }

        // Calculate order totals and validate items
        let subtotalBeforeItemDiscounts = 0;
        let totalItemDiscountSum = 0;

        for (const item of items) {
            const quantity = parseInt(item.quantity, 10);
            const price = parseFloat(item.price);
            const itemDiscount = parseFloat(item.item_discount || 0);
            const productId = parseInt(item.product_id);
            const itemDiscountType = item.item_discount_type || 'percentage';

            if (isNaN(quantity) || quantity <= 0 || isNaN(price) || price <= 0 || isNaN(itemDiscount) || itemDiscount < 0 || isNaN(productId)) {
                await t.rollback();
                return res.status(400).json({
                    message: `Invalid item data: quantity (${item.quantity}), price (${item.price}), item_discount (${item.item_discount}), or product_id (${item.product_id}) must be valid positive numbers`
                });
            }

            const product = await global.models.Product.findByPk(productId, { transaction: t });
            if (!product) {
                await t.rollback();
                return res.status(404).json({ message: `Product with ID ${productId} not found` });
            }

            subtotalBeforeItemDiscounts += (quantity * price);

            let itemCalculatedDiscount = 0;
            if (itemDiscountType === 'percentage') {
                itemCalculatedDiscount = (quantity * price) * (itemDiscount / 100);
            } else if (itemDiscountType === 'amount') {
                itemCalculatedDiscount = itemDiscount;
            }
            totalItemDiscountSum += itemCalculatedDiscount;
        }

        const subtotalAfterItemDiscounts = subtotalBeforeItemDiscounts - totalItemDiscountSum;

        const numericCartDiscount = parseFloat(cart_discount) || 0;
        let calculatedCartDiscountAmount = 0;
        if (cart_discount_type === 'percentage') {
            calculatedCartDiscountAmount = subtotalAfterItemDiscounts * (numericCartDiscount / 100);
        } else if (cart_discount_type === 'amount') {
            calculatedCartDiscountAmount = numericCartDiscount;
        }
        calculatedCartDiscountAmount = Math.min(calculatedCartDiscountAmount, subtotalAfterItemDiscounts); // Cap cart discount at subtotal

        const totalAfterCartDiscount = subtotalAfterItemDiscounts - calculatedCartDiscountAmount;
        const numericTaxRate = parseFloat(tax_rate) || 0;
        const tax_amount_calculated = totalAfterCartDiscount * (numericTaxRate / 100);
        const finalTotal = totalAfterCartDiscount + tax_amount_calculated;

        if (finalTotal < 0) { // Should not happen with previous caps, but as a final guard
            await t.rollback();
            return res.status(400).json({ message: 'Calculated order total cannot be negative.' });
        }

        const orderNumber = await generateOrderNumber(t); // Generate unique order number

        // Create the order
        const order = await global.models.Order.create({
            order_number: orderNumber,
            customer_id: customer ? parseInt(customer_id) : null,
            created_by: created_by,
            cart_discount: numericCartDiscount.toFixed(2),
            cart_discount_type,
            tax_rate: numericTaxRate.toFixed(2), // Save tax_rate
            tax_amount: tax_amount_calculated.toFixed(2), // Save calculated tax_amount
            subtotal: subtotalAfterItemDiscounts.toFixed(2), // Save subtotal after item discounts
            total: finalTotal.toFixed(2),
            status, // 'held' or other provided status
            table_id: table_id ? parseInt(table_id) : null,
            room_id: room_id ? parseInt(room_id) : null,
            order_type,
            is_kot_sent: false, // Default to false when creating/holding
            created_at: new Date(), // Explicit timestamps
            updated_at: new Date(), // Explicit timestamps
        }, { transaction: t });

        // Insert items into order_items table
        for (const item of items) {
            const itemLineTotal = calculateItemLineTotal(item.quantity, item.price, item.item_discount, item.item_discount_type);
            await global.models.OrderItem.create({
                order_id: order.id,
                product_id: item.product_id,
                name: item.name,
                quantity: item.quantity,
                price: item.price.toFixed(2),
                item_discount: (parseFloat(item.item_discount) || 0).toFixed(2),
                item_discount_type: item.item_discount_type || 'percentage',
                item_total: itemLineTotal.toFixed(2),
                instructions: item.instructions || '', // Save instructions
                is_kot_selected: item.is_kot_selected || false, // Save is_kot_selected
                created_at: new Date(), // Explicit timestamps
                updated_at: new Date(), // Explicit timestamps
            }, { transaction: t });
        }

        await t.commit();
        res.status(201).json({ message: 'Order created successfully', order });
    } catch (error) {
        await t.rollback();
        console.error('Create order error:', error);
        res.status(500).json({ message: 'Error creating order', error: error.message });
    }
});

// PUT update an order
router.put('/:id', async (req, res) => {
    const t = await global.sequelize.transaction();
    try {
        if (!models || !global.models.Order || !global.models.OrderItem || !global.models.Product || !global.models.Customer) {
            await t.rollback();
            return res.status(500).json({ message: 'Server configuration error: Models not initialized' });
        }

        const { id } = req.params;
        let {
            customer_id,
            items, // Array of { product_id, name, quantity, price, item_discount, item_discount_type, instructions, is_kot_selected }
            cart_discount = 0,
            cart_discount_type = 'percentage',
            tax_rate = 0,
            status, // Status can be updated
            is_kot_sent, // Can be updated if frontend sends it (e.g., after KOT generation)
            table_id,
            room_id,
            order_type,
        } = req.body;

        // Validate order ID and items
        const orderId = parseInt(id, 10);
        if (isNaN(orderId)) {
            await t.rollback();
            return res.status(400).json({ message: 'Invalid order ID' });
        }
        if (!items || !Array.isArray(items) || items.length === 0) {
            await t.rollback();
            return res.status(400).json({ message: 'Order must contain items' });
        }

        const order = await global.models.Order.findByPk(orderId, { transaction: t });
        if (!order) {
            await t.rollback();
            return res.status(404).json({ message: 'Order not found' });
        }

        // Prevent updating if order is already settled or cancelled, unless specifically allowing (e.g. for is_kot_sent update)
        if (order.status === 'settled' || order.status === 'cancelled') {
            // Allow update of is_kot_sent only if the order is already settled/cancelled
            if (typeof is_kot_sent === 'boolean' && order.is_kot_sent !== is_kot_sent) {
                await order.update({ is_kot_sent }, { transaction: t });
                await t.commit();
                return res.status(200).json({ message: `Order ${order.order_number} is_kot_sent status updated.` });
            }
            await t.rollback();
            return res.status(400).json({ message: `Cannot update items for order with status '${order.status}'` });
        }

        // Validate customer ID if provided and changed
        if (customer_id && parseInt(customer_id) !== order.customer_id) {
             const customer = await global.models.Customer.findByPk(customer_id, { transaction: t });
             if (!customer) {
                 await t.rollback();
                 return res.status(404).json({ message: `Customer with ID ${customer_id} not found` });
             }
           }


        // Calculate order totals based on new items
        let subtotalBeforeItemDiscounts = 0;
        let totalItemDiscountSum = 0;

        for (const item of items) {
            const quantity = parseInt(item.quantity, 10);
            const price = parseFloat(item.price);
            const itemDiscount = parseFloat(item.item_discount || 0);
            const productId = parseInt(item.product_id);
            const itemDiscountType = item.item_discount_type || 'percentage';

            if (isNaN(quantity) || quantity <= 0 || isNaN(price) || price <= 0 || isNaN(itemDiscount) || itemDiscount < 0 || isNaN(productId)) {
                await t.rollback();
                return res.status(400).json({
                    message: `Invalid item data: quantity (${item.quantity}), price (${item.price}), item_discount (${item.item_discount}), or product_id (${item.product_id}) must be valid positive numbers`
                });
            }

            const product = await global.models.Product.findByPk(productId, { transaction: t });
            if (!product) {
                await t.rollback();
                return res.status(404).json({ message: `Product with ID ${productId} not found` });
            }

            subtotalBeforeItemDiscounts += (quantity * price);

            let itemCalculatedDiscount = 0;
            if (itemDiscountType === 'percentage') {
                itemCalculatedDiscount = (quantity * price) * (itemDiscount / 100);
            } else if (itemDiscountType === 'amount') {
                itemCalculatedDiscount = itemDiscount;
            }
            totalItemDiscountSum += itemCalculatedDiscount;
        }

        const subtotalAfterItemDiscounts = subtotalBeforeItemDiscounts - totalItemDiscountSum;

        const numericCartDiscount = parseFloat(cart_discount) || 0;
        let calculatedCartDiscountAmount = 0;
        if (cart_discount_type === 'percentage') {
            calculatedCartDiscountAmount = subtotalAfterItemDiscounts * (numericCartDiscount / 100);
        } else if (cart_discount_type === 'amount') {
            calculatedCartDiscountAmount = numericCartDiscount;
        }
        calculatedCartDiscountAmount = Math.min(calculatedCartDiscountAmount, subtotalAfterItemDiscounts);

        const totalAfterCartDiscount = subtotalAfterItemDiscounts - calculatedCartDiscountAmount;
        const numericTaxRate = parseFloat(tax_rate) || 0;
        const tax_amount_calculated = totalAfterCartDiscount * (numericTaxRate / 100);
        const finalTotal = totalAfterCartDiscount + tax_amount_calculated;

        if (finalTotal < 0) {
            await t.rollback();
            return res.status(400).json({ message: 'Calculated order total cannot be negative.' });
        }


        // Update order header details
        await order.update({
            customer_id: customer_id || order.customer_id,
            total: finalTotal.toFixed(2),
            subtotal: subtotalAfterItemDiscounts.toFixed(2),
            cart_discount: numericCartDiscount.toFixed(2),
            cart_discount_type,
            tax_amount: tax_amount_calculated.toFixed(2),
            tax_rate: numericTaxRate.toFixed(2),
            status: status || order.status, // Allow status update, but default to existing
            table_id: table_id !== undefined ? (table_id ? parseInt(table_id) : null) : order.table_id,
            room_id: room_id !== undefined ? (room_id ? parseInt(room_id) : null) : order.room_id,
            order_type: order_type || order.order_type,
            is_kot_sent: typeof is_kot_sent === 'boolean' ? is_kot_sent : order.is_kot_sent, // Update if provided
            updated_at: new Date(), // Explicit timestamp update
        }, { transaction: t });

        // Delete existing order items
        await global.models.OrderItem.destroy({ where: { order_id: order.id }, transaction: t });

        // Create new order items
        for (const item of items) {
            const itemLineTotal = calculateItemLineTotal(item.quantity, item.price, item.item_discount, item.item_discount_type);
            await global.models.OrderItem.create({
                order_id: order.id,
                product_id: item.product_id,
                name: item.name,
                quantity: item.quantity,
                price: item.price.toFixed(2),
                item_discount: (parseFloat(item.item_discount) || 0).toFixed(2),
                item_discount_type: item.item_discount_type || 'percentage',
                item_total: itemLineTotal.toFixed(2),
                instructions: item.instructions || '', // Save instructions
                is_kot_selected: item.is_kot_selected || false, // Save is_kot_selected
                created_at: new Date(), // Explicit timestamps
                updated_at: new Date(), // Explicit timestamps
            }, { transaction: t });
        }

        await t.commit();
        res.status(200).json({ message: 'Order updated successfully', order });
    } catch (error) {
        await t.rollback();
        console.error('Update order error:', error);
        res.status(500).json({ message: 'Error updating order', error: error.message });
    }
});

// PUT /api/orders/:id/settle - Settle a pending order
router.put('/:id/settle', async (req, res) => {
    const t = await global.sequelize.transaction();
    try {
        if (!models || !global.models.Order || !global.models.Sale) {
            await t.rollback();
            return res.status(500).json({ message: 'Server configuration error: Models not initialized' });
        }

        const orderId = parseInt(req.params.id, 10);
        const { sale_id } = req.body;

        if (isNaN(orderId)) {
            await t.rollback();
            return res.status(400).json({ message: 'Invalid order ID' });
        }
        if (!sale_id || isNaN(parseInt(sale_id))) {
            await t.rollback();
            return res.status(400).json({ message: 'Valid sale ID is required' });
        }

        const order = await global.models.Order.findByPk(orderId, {
            include: [
                { model: global.models.Customer, as: 'customer', attributes: ['name'] },
                { model: global.models.User, as: 'creator', attributes: ['username'] },
            ],
            transaction: t,
        });

        if (!order) {
            await t.rollback();
            return res.status(404).json({ message: 'Order not found' });
        }
        if (order.status !== 'held') {
            await t.rollback();
            return res.status(400).json({ message: 'Order is not in a held state and cannot be settled this way.' });
        }

        const sale = await global.models.Sale.findByPk(sale_id, { transaction: t });
        if (!sale) {
            await t.rollback();
            return res.status(404).json({ message: `Sale with ID ${sale_id} not found` });
        }

        await order.update({
            status: 'settled',
            sale_id,
            updated_at: new Date(),
        }, { transaction: t });

        await t.commit();
        res.status(200).json({ message: 'Order settled successfully' });
    } catch (error) {
        await t.rollback();
        console.error('Settle order error:', error);
        res.status(500).json({ message: 'Error settling order', error: error.message });
    }
});

// DELETE /api/orders/:id - Delete an order by ID
router.delete('/:id', async (req, res) => {
    const t = await global.sequelize.transaction();
    try {
        if (!models || !global.models.Order || !global.models.OrderItem) {
            await t.rollback();
            return res.status(500).json({ message: 'Server configuration error: Models not initialized' });
        }

        const orderId = parseInt(req.params.id, 10);
        if (isNaN(orderId)) {
            await t.rollback();
            return res.status(400).json({ message: 'Invalid order ID' });
        }

        const order = await global.models.Order.findByPk(orderId, { transaction: t });

        if (!order) {
            await t.rollback();
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status !== 'held') {
            await t.rollback();
            return res.status(400).json({ message: 'Only held orders can be deleted.' });
        }

        await global.models.OrderItem.destroy({ where: { order_id: orderId }, transaction: t });

        await order.destroy({ transaction: t });

        await t.commit();
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        await t.rollback();
        console.error('Delete order error:', error);
        res.status(500).json({ message: 'Error deleting order', error: error.message });
    }
});

module.exports = router;
