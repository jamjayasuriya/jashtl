// backend/routes/kotbot.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

// Helper to generate unique KOT/BOT numbers based on type (e.g., KOT-YYYYMMDD-XXXX, BOT-YYYYMMDD-XXXX)
const generateKotBotNumber = async (type) => {
    const prefix = type === 'KOT' ? 'KOT' : 'BOT';
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, ''); //YYYYMMDD
    const todayTicketsCount = await global.models.KotBot.count({
        where: {
            kot_number: {
                [Op.like]: `${prefix}-${datePart}-%`
            }
        }
    });
    const nextNumber = todayTicketsCount + 1;
    return `${prefix}-${datePart}-${String(nextNumber).padStart(4, '0')}`;
};

// POST route to generate a KOT or BOT
router.post('/generate', async (req, res) => {
    const t = await global.sequelize.transaction();
    try {
        const { order_id, type, items, notes } = req.body; // 'items' here are the filtered items from frontend for THIS KOT/BOT

        // Validate type and items (order_id can be null if it's a new KOT without a held order)
        if (!type || !['KOT', 'BOT'].includes(type) || !items || items.length === 0) {
            await t.rollback();
            // Added more specific messages for better debugging on frontend
            if (!type || !['KOT', 'BOT'].includes(type)) {
                return res.status(400).json({ message: 'Invalid or missing KOT/BOT type. Must be "KOT" or "BOT".' });
            }
            if (!items || items.length === 0) {
                return res.status(400).json({ message: 'No items provided for KOT/BOT generation.' });
            }
            return res.status(400).json({ message: 'Invalid KOT/BOT generation request. Missing required data.' });
        }

        let order = null;
        if (order_id) { // Only try to find order if order_id is provided
            order = await global.models.Order.findByPk(order_id, { transaction: t });
            if (!order) {
                await t.rollback();
                return res.status(404).json({ message: 'Associated order not found.' });
            }
        }

        const kotBotNumber = await generateKotBotNumber(type);
        const created_by = req.user.id; // User from auth middleware

        const kotBot = await global.models.KotBot.create({
            order_id: order_id || null, // Ensure it's explicitly null if not provided
            type,
            kot_number: kotBotNumber,
            status: 'sent', // Default to 'sent' when created
            notes: notes || '',
            created_by,
            created_at: new Date(), // Add explicit timestamp
            updated_at: new Date(), // Add explicit timestamp
            // Add other necessary fields as per your KotBot model
        }, { transaction: t });

        for (const item of items) {
            // Find the product to get its full name and confirm existence
            const product = await global.models.Product.findByPk(item.product_id, { transaction: t });
            if (!product) {
                console.warn(`Product ID ${item.product_id} not found for KOT/BOT item.`);
                await t.rollback();
                return res.status(400).json({ message: `Product with ID ${item.product_id} not found for KOT/BOT.` });
            }

            await global.models.KotBotItem.create({
                kot_bot_id: kotBot.id,
                product_id: item.product_id,
                name: item.name || product.name, // Use name from frontend or product name
                quantity: item.quantity,
                instructions: item.instructions || '',
                is_prepared: false, // Default status
                created_at: new Date(), // Add explicit timestamp
                updated_at: new Date(), // Add explicit timestamp
            }, { transaction: t });
        }

        // Optionally, update the main order to mark that a KOT has been sent
        if (order) { // Only update order if one was associated
            await order.update({ is_kot_sent: true }, { transaction: t });
        }

        await t.commit();
        res.status(201).json({
            message: `${type} generated successfully`,
            kotBot: {
                id: kotBot.id,
                kot_number: kotBot.kot_number,
                type: kotBot.type,
                notes: kotBot.notes,
                items: items // Return the items that were included for frontend confirmation
            }
        });

    } catch (error) {
        await t.rollback();
        console.error('Error generating KOT/BOT:', error);
        // Provide a more generic 500 error message to the client unless it's a known validation error
        res.status(500).json({ message: `Failed to generate ${req.body.type || 'KOT/BOT'} due to a server error.`, error: error.message });
    }
});

// GET specific KOT/BOT by ID (for re-printing or status check)
router.get('/:id', async (req, res) => {
    try {
        const kotBot = await global.models.KotBot.findByPk(req.params.id, {
            include: [
                {
                    model: global.models.Order,
                    as: 'order',
                    attributes: ['id', 'order_number', 'customer_id'],
                    include: [{ model: global.models.Customer, as: 'customer', attributes: ['name'] }]
                },
                {
                    model: global.models.KotBotItem,
                    as: 'kotBotItems',
                    attributes: ['id', 'product_id', 'name', 'quantity', 'instructions'],
                    include: [{
                        model: global.models.Product,
                        as: 'product',
                        attributes: ['id', 'name', 'image_path', 'preparation_area']
                    }]
                },
                {
                    model: global.models.User,
                    as: 'creator',
                    attributes: ['id', 'username']
                }
            ]
        });
        if (!kotBot) {
            return res.status(404).json({ message: 'KOT/BOT not found' });
        }
        res.status(200).json(kotBot);
    } catch (error) {
        console.error('Error fetching KOT/BOT by ID:', error);
        res.status(500).json({ message: 'Failed to fetch KOT/BOT', error: error.message });
    }
});


// GET all KOT/BOTs (e.g., for kitchen display)
router.get('/', async (req, res) => {
    try {
        const { type, status, orderId, createdBy, startDate, endDate } = req.query;
        const whereClause = {};

        if (type) whereClause.type = type;
        if (status) whereClause.status = status;
        if (orderId) whereClause.order_id = orderId;
        if (createdBy) whereClause.created_by = createdBy;
        if (startDate && endDate) {
            whereClause.created_at = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const kotBots = await global.models.KotBot.findAll({
            where: whereClause,
            include: [
                {
                    model: global.models.Order,
                    as: 'order',
                    attributes: ['id', 'order_number'],
                    include: [{ model: global.models.Customer, as: 'customer', attributes: ['name'] }]
                },
                {
                    model: global.models.KotBotItem,
                    as: 'kotBotItems',
                    attributes: ['id', 'product_id', 'name', 'quantity', 'instructions']
                },
                {
                    model: global.models.User,
                    as: 'creator',
                    attributes: ['id', 'username']
                }
            ],
            order: [['created_at', 'DESC']]
        });
        res.status(200).json(kotBots);
    } catch (error) {
        console.error('Error fetching KOT/BOTs:', error);
        res.status(500).json({ message: 'Failed to fetch KOT/BOTs', error: error.message });
    }
});


// PUT update KOT/BOT status (e.g., from 'sent' to 'preparing' to 'ready')
router.put('/:id/status', async (req, res) => {
    const t = await global.sequelize.transaction();
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['sent', 'preparing', 'ready', 'cancelled'].includes(status)) {
            await t.rollback();
            return res.status(400).json({ message: 'Invalid status provided.' });
        }

        const kotBot = await global.models.KotBot.findByPk(id, { transaction: t });
        if (!kotBot) {
            await t.rollback();
            return res.status(404).json({ message: 'KOT/BOT not found.' });
        }

        await kotBot.update({ status }, { transaction: t });
        await t.commit();
        res.status(200).json({ message: `KOT/BOT ${kotBot.kot_number} status updated to '${status}'`, kotBot });
    } catch (error) {
        await t.rollback();
        console.error('Error updating KOT/BOT status:', error);
        res.status(500).json({ message: 'Failed to update KOT/BOT status', error: error.message });
    }
});

// DELETE a KOT/BOT (e.g., if cancelled)
router.delete('/:id', async (req, res) => {
    const t = await global.sequelize.transaction();
    try {
        const { id } = req.params;
        const kotBot = await global.models.KotBot.findByPk(id, { transaction: t });

        if (!kotBot) {
            await t.rollback();
            return res.status(404).json({ message: 'KOT/BOT not found' });
        }

        await kotBot.destroy({ transaction: t });
        await t.commit();
        res.status(200).json({ message: 'KOT/BOT deleted successfully' });
    } catch (error) {
        await t.rollback();
        console.error('Error deleting KOT/BOT:', error);
        res.status(500).json({ message: 'Failed to delete KOT/BOT', error: error.message });
    }
});


module.exports = router;
