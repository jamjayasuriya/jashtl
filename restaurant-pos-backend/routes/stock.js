const express = require('express');
const { param, body, query, validationResult } = require('express-validator');
const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET /api/stock/products
router.get('/products', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1 }).toInt(),
], validate, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const products = await global.models.Product.findAndCountAll({
      limit,
      offset,
      include: [{ model: global.models.Category, as: 'category' }],
    });

    res.json({
      totalItems: products.count,
      totalPages: Math.ceil(products.count / limit),
      currentPage: page,
      products: products.rows,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// GET /api/stock/suppliers
router.get('/suppliers', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1 }).toInt(),
], validate, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const suppliers = await global.models.Supplier.findAndCountAll({
      limit,
      offset,
    });

    res.json({
      totalItems: suppliers.count,
      totalPages: Math.ceil(suppliers.count / limit),
      currentPage: page,
      suppliers: suppliers.rows,
    });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ message: 'Error fetching suppliers', error: error.message });
  }
});

// GET /api/stock/purchases
router.get('/purchases', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1 }).toInt(),
  query('invoice_no').optional().isString().trim(), // Add invoice_no filter
], validate, async (req, res) => {
  try {
    const { page = 1, limit = 10, invoice_no } = req.query;
    const offset = (page - 1) * limit;

    const where = invoice_no ? { invoice_no } : {};

    const purchases = await global.models.Purchase.findAndCountAll({
      where,
      limit,
      offset,
      include: [
        { model: global.models.Supplier, as: 'supplier' },
        { model: global.models.PurchaseItem, as: 'items', include: [{ model: global.models.Product, as: 'product' }] },
        { model: global.models.PurchaseReturn, as: 'returns', include: [{ model: global.models.PurchaseReturnItem, as: 'items' }] },
      ],
      order: [['purchase_date', 'DESC']],
    });

    res.json({
      totalItems: purchases.count,
      totalPages: Math.ceil(purchases.count / limit),
      currentPage: page,
      purchases: purchases.rows,
    });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ message: 'Error fetching purchases', error: error.message });
  }
});

// POST /api/stock/purchases
router.post('/purchases', [
  body('invoice_no').notEmpty().isString().trim().withMessage('Invoice number is required'), // Add invoice_no validation
  body('supplier_id').notEmpty().isInt({ min: 1 }).withMessage('Supplier ID must be a positive integer'),
  body('purchase_type').notEmpty().isIn(['cash', 'credit']).withMessage('Purchase type must be "cash" or "credit"'),
  body('payment_type')
    .if(body('purchase_type').equals('cash'))
    .notEmpty()
    .isIn(['cash', 'cheque', 'bank_transfer'])
    .withMessage('For cash purchases, payment type must be "cash", "cheque", or "bank_transfer"'),
  body('items').isArray({ min: 1 }).withMessage('Items must be a non-empty array'),
  body('items.*.product_id').notEmpty().isInt({ min: 1 }).withMessage('Product ID must be a positive integer'),
  body('items.*.quantity').notEmpty().isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('items.*.purchasing_price').notEmpty().isFloat({ min: 0 }).withMessage('Purchasing price must be a non-negative number'),
  body('items.*.item_discount').optional().isFloat({ min: 0 }).withMessage('Item discount must be a non-negative number'),
  body('bill_discount').optional().isFloat({ min: 0 }).withMessage('Bill discount must be a non-negative number'),
  body('remarks').optional().isString().withMessage('Remarks must be a string'),
], validate, async (req, res) => {
  const { invoice_no, supplier_id, purchase_type, payment_type, items, bill_discount, remarks } = req.body;

  const transaction = await global.sequelize.transaction();
  try {
    // Validate supplier exists
    const supplier = await global.models.Supplier.findByPk(supplier_id, { transaction });
    if (!supplier) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Supplier not found' });
    }

    // Validate all products exist
    const productIds = items.map(item => item.product_id);
    const products = await global.models.Product.findAll({
      where: { id: productIds },
      transaction
    });
    
    if (products.length !== items.length) {
      await transaction.rollback();
      const missingIds = productIds.filter(id => !products.some(p => p.id === id));
      return res.status(404).json({ 
        message: 'Some products not found', 
        missing_product_ids: missingIds 
      });
    }

    // Calculate amounts
    let total_amount = 0;
    items.forEach(item => {
      total_amount += (item.quantity * item.purchasing_price) - (item.item_discount || 0);
    });
    const final_amount = total_amount - (bill_discount || 0);

    // Create purchase with invoice_no
    const purchase = await global.models.Purchase.create({
      grn_number: `GRN-${Date.now()}`,
      invoice_no, // Add invoice_no
      supplier_id,
      purchase_type,
      payment_type: purchase_type === 'credit' ? null : payment_type,
      total_amount,
      bill_discount: bill_discount || 0,
      bill_discount_percentage: 0,
      final_amount,
      purchase_date: new Date(),
      remarks: remarks || null,
    }, { transaction });

    // Create items and update stock
    await Promise.all(items.map(async (item) => {
      await global.models.PurchaseItem.create({
        purchase_id: purchase.id,
        product_id: item.product_id,
        quantity: item.quantity,
        purchasing_price: item.purchasing_price,
        item_discount: item.item_discount || 0,
      }, { transaction });

      const product = products.find(p => p.id === item.product_id);
      product.stock += item.quantity;
      await product.save({ transaction });
    }));

    // Fetch complete purchase data for response
    const createdPurchase = await global.models.Purchase.findByPk(purchase.id, {
      include: [
        { model: global.models.Supplier, as: 'supplier' },
        { 
          model: global.models.PurchaseItem, 
          as: 'items', 
          include: [{ model: global.models.Product, as: 'product' }] 
        }
      ],
      transaction
    });

    await transaction.commit();
    res.status(201).json({ 
      message: 'Purchase created successfully', 
      purchase: createdPurchase
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Purchase creation failed:', {
      error: error.message,
      stack: error.stack,
      errors: error.errors?.map(e => e.message)
    });
    res.status(500).json({ 
      message: 'Failed to create purchase',
      error: error.message,
      details: error.errors?.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }
});

// PUT /api/stock/purchases/:id
router.put('/purchases/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
  body('invoice_no').notEmpty().isString().trim().withMessage('Invoice number is required'), // Add invoice_no validation
  body('supplier_id').notEmpty().isInt({ min: 1 }).withMessage('Supplier ID must be a positive integer'),
  body('purchase_type').notEmpty().isIn(['cash', 'credit']).withMessage('Purchase type must be "cash" or "credit"'),
  body('payment_type')
    .if(body('purchase_type').equals('cash'))
    .notEmpty()
    .isIn(['cash', 'cheque', 'bank_transfer'])
    .withMessage('For cash purchases, payment type must be "cash", "cheque", or "bank_transfer"'),
  body('items').isArray({ min: 1 }).withMessage('Items must be a non-empty array'),
  body('items.*.product_id').notEmpty().isInt({ min: 1 }).withMessage('Product ID must be a positive integer'),
  body('items.*.quantity').notEmpty().isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('items.*.purchasing_price').notEmpty().isFloat({ min: 0 }).withMessage('Purchasing price must be a non-negative number'),
  body('items.*.item_discount').optional().isFloat({ min: 0 }).withMessage('Item discount must be a non-negative number'),
  body('bill_discount').optional().isFloat({ min: 0 }).withMessage('Bill discount must be a non-negative number'),
  body('remarks').optional().isString().withMessage('Remarks must be a string'),
], validate, async (req, res) => {
  const { id } = req.params;
  const { invoice_no, supplier_id, purchase_type, payment_type, items, bill_discount, remarks } = req.body;

  const transaction = await global.sequelize.transaction();
  try {
    // Find existing purchase
    const purchase = await global.models.Purchase.findByPk(id, {
      include: [
        { model: global.models.PurchaseItem, as: 'items' },
        { model: global.models.Supplier, as: 'supplier' }
      ],
      transaction
    });
    
    if (!purchase) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Purchase not found' });
    }

    // Validate supplier exists
    const supplier = await global.models.Supplier.findByPk(supplier_id, { transaction });
    if (!supplier) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Supplier not found' });
    }

    // Validate all products exist
    const productIds = items.map(item => item.product_id);
    const products = await global.models.Product.findAll({
      where: { id: productIds },
      transaction
    });
    
    if (products.length !== items.length) {
      await transaction.rollback();
      const missingIds = productIds.filter(id => !products.some(p => p.id === id));
      return res.status(404).json({ 
        message: 'Some products not found', 
        missing_product_ids: missingIds 
      });
    }

    // Reverse stock for old items
    await Promise.all(purchase.items.map(async (item) => {
      const product = await global.models.Product.findByPk(item.product_id, { transaction });
      if (product) {
        product.stock -= item.quantity;
        await product.save({ transaction });
      }
    }));

    // Delete old purchase items
    await global.models.PurchaseItem.destroy({ where: { purchase_id: id }, transaction });

    // Calculate new amounts
    let total_amount = 0;
    items.forEach(item => {
      total_amount += (item.quantity * item.purchasing_price) - (item.item_discount || 0);
    });
    const final_amount = total_amount - (bill_discount || 0);

    // Update purchase with invoice_no
    await purchase.update({
      invoice_no, // Add invoice_no
      supplier_id,
      purchase_type,
      payment_type: purchase_type === 'credit' ? null : payment_type,
      total_amount,
      bill_discount: bill_discount || 0,
      bill_discount_percentage: 0,
      final_amount,
      remarks: remarks || null,
    }, { transaction });

    // Create new items and update stock
    await Promise.all(items.map(async (item) => {
      await global.models.PurchaseItem.create({
        purchase_id: id,
        product_id: item.product_id,
        quantity: item.quantity,
        purchasing_price: item.purchasing_price,
        item_discount: item.item_discount || 0,
      }, { transaction });

      const product = products.find(p => p.id === item.product_id);
      product.stock += item.quantity;
      await product.save({ transaction });
    }));

    // Fetch complete updated purchase
    const updatedPurchase = await global.models.Purchase.findByPk(id, {
      include: [
        { model: global.models.Supplier, as: 'supplier' },
        { 
          model: global.models.PurchaseItem, 
          as: 'items', 
          include: [{ model: global.models.Product, as: 'product' }] 
        }
      ],
      transaction
    });

    await transaction.commit();
    res.status(200).json({ 
      message: 'Purchase updated successfully', 
      purchase: updatedPurchase
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Purchase update failed:', {
      error: error.message,
      stack: error.stack,
      errors: error.errors?.map(e => e.message)
    });
    res.status(500).json({ 
      message: 'Failed to update purchase',
      error: error.message,
      details: error.errors?.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }
});

// DELETE /api/stock/purchases/:id
router.delete('/purchases/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
], validate, async (req, res) => {
  const { id } = req.params;
  const transaction = await global.sequelize.transaction();

  try {
    const purchaseId = parseInt(id);
    const purchase = await global.models.Purchase.findByPk(purchaseId, {
      include: [
        { model: global.models.PurchaseItem, as: 'items' },
        { model: global.models.Supplier, as: 'supplier' },
        { model: global.models.PurchaseReturn, as: 'returns' },
      ],
      transaction,
    });

    if (!purchase) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Purchase not found' });
    }

    if (purchase.returns && purchase.returns.length > 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Cannot delete purchase with existing returns' });
    }

    // Reverse stock updates
    await Promise.all(purchase.items.map(async (item) => {
      const product = await global.models.Product.findByPk(item.product_id, { transaction });
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ message: `Product with ID ${item.product_id} not found` });
      }
      product.stock -= item.quantity;
      if (product.stock < 0) {
        await transaction.rollback();
        return res.status(400).json({ message: `Cannot delete purchase: insufficient stock for product ID ${item.product_id}` });
      }
      await product.save({ transaction });
    }));

    // Reverse supplier dues if purchase was on credit
    if (purchase.purchase_type === 'credit') {
      let supplierDue = await global.models.SupplierDues.findOne({
        where: { supplier_id: purchase.supplier_id },
        transaction,
      });

      if (supplierDue) {
        const finalAmount = parseFloat(purchase.final_amount || 0);
        supplierDue.amount_due = Math.max(0, parseFloat(supplierDue.amount_due || 0) - finalAmount);
        supplierDue.last_updated = new Date();
        if (supplierDue.amount_due <= 0) {
          await supplierDue.destroy({ transaction });
        } else {
          await supplierDue.save({ transaction });
        }
      }
    }

    await global.models.PurchaseItem.destroy({ where: { purchase_id: purchaseId }, transaction });
    await purchase.destroy({ transaction });

    await transaction.commit();
    res.status(200).json({ message: 'Purchase deleted successfully with all reversals' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting purchase:', error);
    res.status(500).json({ message: 'Failed to delete purchase', error: error.message });
  }
});

module.exports = router;