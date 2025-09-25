const express = require('express');
const router = express.Router();
const { Op } = require('sequelize'); // Import Op for Sequelize operators

// GET /api/transactions - Fetch all transactions (combining sales and no-detail-customers)
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, paymentMethod, status, timezone } = req.query;
    
    // Build where clause for date filtering with timezone support
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
      console.log(`Filtering transactions by date range: ${startDate} to ${endDate} (timezone: ${timezone || 'UTC'})`);
    }

    // Fetch sales with related data
    const sales = await global.models.Sale.findAll({
      where: dateFilter,
      include: [
        {
          model: global.models.SalePayment,
          as: 'salePayments',
          attributes: ['payment_method', 'amount', 'reference_number'],
          ...(paymentMethod && { where: { payment_method: paymentMethod } })
        },
        {
          model: global.models.Customer,
          as: 'customer',
          attributes: ['id', 'name', 'phone', 'email'],
          required: false
        },
        {
          model: global.models.User,
          as: 'user',
          attributes: ['username']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Transform sales data to match frontend expectations
    const transactions = sales.map(sale => {
      const primaryPayment = sale.salePayments && sale.salePayments.length > 0 ? sale.salePayments[0] : null;
      
      return {
        id: sale.id,
        order_id: sale.id, // Using sale ID as order ID
        customer_name: sale.customer ? sale.customer.name : 'No Detail Customer',
        customer_id: sale.customer_id,
        amount: parseFloat(sale.total_amount || 0),
        payment_method: primaryPayment ? primaryPayment.payment_method : 'cash',
        payment_reference: primaryPayment ? primaryPayment.reference_number : null,
        status: 'completed', // All sales are considered completed
        created_at: sale.createdAt,
        updated_at: sale.updatedAt,
        cashier: sale.user ? sale.user.username : 'System',
        total_paid: parseFloat(sale.paid_bycash || 0) + parseFloat(sale.paid_bycheque || 0) + 
                   parseFloat(sale.paid_bycard || 0) + parseFloat(sale.paid_byvoucher || 0),
        dues: parseFloat(sale.on_credit || 0)
      };
    });

    // Apply status filter if provided
    let filteredTransactions = transactions;
    if (status && status !== 'all') {
      if (status === 'completed') {
        filteredTransactions = transactions.filter(t => t.status === 'completed');
      } else if (status === 'pending') {
        filteredTransactions = transactions.filter(t => t.status === 'pending');
      } else if (status === 'failed') {
        filteredTransactions = transactions.filter(t => t.status === 'failed');
      }
    }

    res.json(filteredTransactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
});

// GET /api/transactions/:id - Get a specific transaction
router.get('/:id', async (req, res) => {
  try {
    const transactionId = req.params.id;
    
    const sale = await global.models.Sale.findByPk(transactionId, {
      include: [
        {
          model: global.models.SalePayment,
          as: 'salePayments',
          attributes: ['payment_method', 'amount', 'reference_number', 'details']
        },
        {
          model: global.models.SaleProduct,
          as: 'saleProducts',
          attributes: ['id', 'product_id', 'name', 'quantity', 'price', 'item_discount', 'item_total']
        },
        {
          model: global.models.Customer,
          as: 'customer',
          attributes: ['id', 'name', 'phone', 'email']
        },
        {
          model: global.models.User,
          as: 'user',
          attributes: ['username']
        },
        {
          model: global.models.Receipt,
          as: 'receipts',
          attributes: ['receipt_number', 'type', 'total', 'total_paid']
        }
      ]
    });

    if (!sale) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const primaryPayment = sale.salePayments && sale.salePayments.length > 0 ? sale.salePayments[0] : null;
    
    const transaction = {
      id: sale.id,
      order_id: sale.id,
      customer_name: sale.customer ? sale.customer.name : 'No Detail Customer',
      customer_id: sale.customer_id,
      amount: parseFloat(sale.total_amount || 0),
      payment_method: primaryPayment ? primaryPayment.payment_method : 'cash',
      payment_reference: primaryPayment ? primaryPayment.reference_number : null,
      status: 'completed',
      created_at: sale.createdAt,
      updated_at: sale.updatedAt,
      cashier: sale.user ? sale.user.username : 'System',
      total_paid: parseFloat(sale.paid_bycash || 0) + parseFloat(sale.paid_bycheque || 0) + 
                 parseFloat(sale.paid_bycard || 0) + parseFloat(sale.paid_byvoucher || 0),
      dues: parseFloat(sale.on_credit || 0),
      items: sale.saleProducts || [],
      payments: sale.salePayments || [],
      receipt: sale.receipts && sale.receipts.length > 0 ? sale.receipts[0] : null
    };

    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ message: 'Error fetching transaction', error: error.message });
  }
});

// GET /api/transactions/stats/summary - Get transaction statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const sales = await global.models.Sale.findAll({
      where: dateFilter,
      include: [
        {
          model: global.models.SalePayment,
          as: 'salePayments',
          attributes: ['payment_method', 'amount']
        }
      ]
    });

    const stats = {
      totalTransactions: sales.length,
      totalAmount: sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0),
      successfulTransactions: sales.length, // All sales are successful
      failedTransactions: 0,
      averageTransaction: sales.length > 0 ? 
        sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0) / sales.length : 0,
      paymentMethods: {
        cash: sales.reduce((sum, sale) => sum + parseFloat(sale.paid_bycash || 0), 0),
        card: sales.reduce((sum, sale) => sum + parseFloat(sale.paid_bycard || 0), 0),
        cheque: sales.reduce((sum, sale) => sum + parseFloat(sale.paid_bycheque || 0), 0),
        voucher: sales.reduce((sum, sale) => sum + parseFloat(sale.paid_byvoucher || 0), 0)
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    res.status(500).json({ message: 'Error fetching transaction stats', error: error.message });
  }
});

module.exports = router;