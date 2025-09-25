const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

// GET /api/receipts/:saleId - Fetch and format POS receipt
router.get('/:saleId', authenticateToken, async (req, res) => {
  try {
    const saleId = req.params.saleId;
    if (!saleId || isNaN(saleId)) {
      return res.status(400).json({ message: 'Invalid sale ID' });
    }

    // Fetch receipt
    const receipt = await global.models.Receipt.findOne({
      where: { sale_id: saleId, type: 'receipt' },
    });

    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    const receiptData = JSON.parse(receipt.content);

    // Fetch related sale data
    const sale = await global.models.Sale.findOne({
      where: { id: saleId },
      include: [
        { model: global.models.SaleProduct, as: 'saleProducts' },
        { model: global.models.SalePayment, as: 'salePayments' },
        { model: global.models.Customer, as: 'customer' },
        { model: global.models.User, as: 'user' },
      ],
    });

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // Calculate total paid from salePayments
    const totalPaid = sale.salePayments.reduce((sum, payment) => {
      const amount = Number(payment.amount) || 0;
      return sum + amount;
    }, 0).toFixed(2);

    // Calculate dues (if total_except_credit > totalPaid)
    const totalDue = (Number(receiptData.total_except_credit) - Number(totalPaid)).toFixed(2);

    // Debug log for tax amount
    console.log('Tax amount from sale:', sale.tax_amount);

    // Format the receipt
    const formattedReceipt = [
      "===== POS Receipt =====",
      `Receipt No: ${receipt.receipt_number}`,
      `Date: ${receipt.created_at.toISOString().split('T')[0]}`,
      "---------------------",
      `Customer: ${sale.customer?.name || 'Walk-in Customer'}`, // Added customer name
      "Items:",
      ...sale.saleProducts.map(item => 
        `${item.name}, ${item.quantity}, $${item.item_discount}, $${item.price}`
      ),
      `Total Items: ${sale.saleProducts.length}`,
      "---------------------",
      `Subtotal: $${receiptData.total_amount}`,
      `Item Discount: $${receiptData.item_discount}`,
      `Cart Discount: $${receiptData.cart_discount}`,
      `Tax: $${sale.tax_amount || 0}`, // Use sale.tax_amount with fallback
      `Total: $${receiptData.total_except_credit}`,
      "---------------------",
      "Payments:",
      ...sale.salePayments
        .filter(payment => Number(payment.amount) > 0) // Only include payments with amount > 0
        .map(payment => 
          `${payment.payment_method}: $${Number(payment.amount).toFixed(2)}`
        ),
      `Total Paid: $${totalPaid}`, // Add total paid
      ...(Number(totalDue) > 0 ? [`Dues: $${totalDue}`] : []), // Add dues if applicable
      "---------------------",
      `Cashier: ${sale.user?.username || 'N/A'}`,
      "Thank you for your purchase"
    ].join('\n');

    // Return the formatted receipt
    res.status(200).json({ receipt: formattedReceipt });
  } catch (error) {
    console.error('Error generating receipt:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;