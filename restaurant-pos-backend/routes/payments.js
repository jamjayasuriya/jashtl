const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

// POST /api/payments - Create a new payment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      order_id,
      customer_id,
      payment_method,
      amount,
      status = 'completed',
      transaction_id,
      notes
    } = req.body;

    console.log('💳 Payment request received:', {
      order_id,
      customer_id,
      payment_method,
      amount,
      status,
      transaction_id
    });

    // Validate required fields
    if (!order_id || !payment_method || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: order_id, payment_method, amount'
      });
    }

    // Check if order exists
    const order = await global.models.Order.findByPk(order_id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Create payment record
    const payment = await global.models.Payment.create({
      order_id,
      customer_id,
      payment_method,
      amount: parseFloat(amount),
      status,
      transaction_id: transaction_id || `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      notes,
      created_by: req.user.id,
      created_at: new Date()
    });

    console.log('💳 Payment created:', payment.toJSON());

    // Update order status to completed
    await order.update({
      status: 'completed',
      payment_status: 'paid',
      updated_at: new Date()
    });

    console.log('💳 Order status updated to completed');

    // Create sale record
    const sale = await global.models.Sale.create({
      order_id,
      customer_id,
      total_amount: parseFloat(amount),
      payment_method,
      status: 'completed',
      created_by: req.user.id,
      created_at: new Date()
    });

    console.log('💳 Sale record created:', sale.toJSON());

    res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        payment: payment.toJSON(),
        sale: sale.toJSON(),
        order: order.toJSON()
      }
    });

  } catch (error) {
    console.error('💳 Payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment processing failed',
      error: error.message
    });
  }
});

// GET /api/payments - Get all payments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const payments = await global.models.Payment.findAll({
      include: [
        {
          model: global.models.Order,
          include: [
            {
              model: global.models.Customer,
              attributes: ['id', 'name', 'phone']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message
    });
  }
});

// GET /api/payments/:id - Get payment by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const payment = await global.models.Payment.findByPk(req.params.id, {
      include: [
        {
          model: global.models.Order,
          include: [
            {
              model: global.models.Customer,
              attributes: ['id', 'name', 'phone']
            }
          ]
        }
      ]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment',
      error: error.message
    });
  }
});

module.exports = router;
