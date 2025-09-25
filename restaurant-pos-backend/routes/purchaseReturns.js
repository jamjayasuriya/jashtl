const express = require('express');
const router = express.Router();
const { Purchase, PurchaseItem, PurchaseReturn, PurchaseReturnItem, SupplierDues, Product } = require('../models');

// Generate invoice_no in format RET-YYYYMMDD-XXX
const generateInvoiceNo = async (returnDate) => {
  const date = new Date(returnDate);
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  const prefix = `RET-${dateStr}-`;

  const count = await PurchaseReturn.count({
    where: {
      invoice_no: { [require('sequelize').Op.like]: `${prefix}%` }
    }
  });

  const paddedCount = String(count + 1).padStart(3, '0'); // e.g., 001, 002
  return `${prefix}${paddedCount}`;
};

// Create a purchase return
router.post('/purchases/:id/return', async (req, res) => {
  const { id } = req.params;
  const { return_date, reason, items } = req.body;

  try {
    // Validate required fields (invoice_no removed)
    if (!return_date || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields: return_date and items are required' });
    }

    // Validate items
    for (const item of items) {
      if (!item.product_id || !item.quantity_returned || !item.amount) {
        return res.status(400).json({ error: 'Invalid item data: product_id, quantity_returned, and amount are required' });
      }
      if (item.quantity_returned <= 0 || item.amount < 0) {
        return res.status(400).json({ error: 'quantity_returned must be greater than 0 and amount must be non-negative' });
      }
    }

    // Generate invoice_no
    const invoice_no = await generateInvoiceNo(return_date);

    // Find the purchase with its items and existing returns
    const purchase = await Purchase.findByPk(id, {
      include: [
        { model: PurchaseItem, as: 'items' },
        { model: PurchaseReturn, as: 'returns', include: [{ model: PurchaseReturnItem, as: 'items' }] },
      ],
    });

    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    if (purchase.status === 'returned') {
      return res.status(400).json({ error: 'Cannot return items for a fully returned purchase' });
    }

    // Validate returned quantities
    const purchaseItemsMap = new Map(purchase.items.map(item => [item.product_id, item.quantity]));
    const returnedItemsMap = new Map();

    if (purchase.returns && purchase.returns.length > 0) {
      purchase.returns.forEach(returnRecord => {
        returnRecord.items.forEach(item => {
          const productId = item.product_id;
          returnedItemsMap.set(productId, (returnedItemsMap.get(productId) || 0) + item.quantity_returned);
        });
      });
    }

    items.forEach(item => {
      const productId = item.product_id;
      returnedItemsMap.set(productId, (returnedItemsMap.get(productId) || 0) + item.quantity_returned);
    });

    for (const [productId, totalReturned] of returnedItemsMap) {
      const purchasedQuantity = purchaseItemsMap.get(productId) || 0;
      if (totalReturned > purchasedQuantity) {
        return res.status(400).json({ error: `Cannot return ${totalReturned} units of product ID ${productId}; only ${purchasedQuantity} were purchased` });
      }
    }

    const totalReturnAmount = items.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    const totalPurchasedQuantity = purchase.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalReturnedQuantity = Array.from(returnedItemsMap.values()).reduce((sum, qty) => sum + qty, 0);
    const newStatus = totalReturnedQuantity === totalPurchasedQuantity ? 'returned' : 'partially_returned';

    const transaction = await Purchase.sequelize.transaction();
    try {
      const purchaseReturn = await PurchaseReturn.create(
        { purchase_id: id, invoice_no, return_date, reason },
        { transaction }
      );

      const returnItems = items.map(item => ({
        purchase_return_id: purchaseReturn.id,
        product_id: item.product_id,
        quantity_returned: item.quantity_returned,
        amount: item.amount,
      }));
      await PurchaseReturnItem.bulkCreate(returnItems, { transaction });

      // Update product stock
      await Promise.all(items.map(async (item) => {
        const product = await Product.findByPk(item.product_id, { transaction });
        if (!product) {
          throw new Error(`Product with ID ${item.product_id} not found`);
        }
        const newStock = product.stock - item.quantity_returned;
        if (newStock < 0) {
          throw new Error(`Cannot return ${item.quantity_returned} units of product ID ${item.product_id}; only ${product.stock} in stock`);
        }
        product.stock = newStock;
        await product.save({ transaction });
      }));

      await purchase.update({ status: newStatus }, { transaction });

      if (purchase.purchase_type === 'credit') {
        let supplierDue = await SupplierDues.findOne({
          where: { supplier_id: purchase.supplier_id },
          transaction,
        });

        if (!supplierDue) {
          supplierDue = await SupplierDues.create(
            {
              supplier_id: purchase.supplier_id,
              amount_due: 0,
              last_updated: new Date(),
            },
            { transaction }
          );
        }

        const currentAmountDue = parseFloat(supplierDue.amount_due) || 0;
        supplierDue.amount_due = currentAmountDue - totalReturnAmount;
        supplierDue.last_updated = new Date();

        if (supplierDue.amount_due <= 0) {
          await supplierDue.destroy({ transaction });
        } else {
          await supplierDue.save({ transaction });
        }
      }

      await transaction.commit();

      const updatedPurchase = await Purchase.findByPk(id, {
        include: [
          { model: PurchaseItem, as: 'items' },
          { model: PurchaseReturn, as: 'returns', include: [{ model: PurchaseReturnItem, as: 'items' }] },
        ],
      });

      res.status(201).json(updatedPurchase);
    } catch (error) {
      await transaction.rollback();
      res.status(500).json({ error: 'Failed to create purchase return: ' + error.message });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error creating purchase return: ' + error.message });
  }
});

module.exports = router;