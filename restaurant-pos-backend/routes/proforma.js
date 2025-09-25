const express = require('express');
const { body, validationResult } = require('express-validator');
const moment = require('moment');
const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation errors',
      errors: errors.array(),
      timestamp: new Date().toISOString(),
    });
  }
  next();
};

// POST /api/proforma-invoices - Create a proforma invoice
router.post('/', [
  body('guest_id').notEmpty().isInt({ min: 1 }).withMessage('Guest ID must be a positive integer'),
  body('issue_date').optional().isISO8601().withMessage('Issue date must be a valid date').default(moment().format('YYYY-MM-DD')),
  body('due_date').optional().isISO8601().withMessage('Due date must be a valid date'),
  body('items').isArray({ min: 1 }).withMessage('Items must be a non-empty array'),
  body('items.*.product_id').notEmpty().isInt({ min: 1 }).withMessage('Product ID must be a positive integer'),
  body('items.*.quantity').notEmpty().isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('items.*.unit_price').notEmpty().isFloat({ min: 0 }).withMessage('Unit price must be a non-negative number'),
  body('items.*.item_discount').optional().isFloat({ min: 0 }).withMessage('Item discount must be a non-negative number'),
  body('bill_discount').optional().isFloat({ min: 0 }).withMessage('Bill discount must be a non-negative number'),
  body('service_charge').optional().isFloat({ min: 0 }).withMessage('Service charge must be a non-negative number'),
  body('gratuity').optional().isFloat({ min: 0 }).withMessage('Gratuity must be a non-negative number'),
  body('remarks').optional().isString().withMessage('Remarks must be a string'),
], validate, async (req, res) => {
  const { guest_id, issue_date, due_date, items, bill_discount, service_charge, gratuity, remarks } = req.body;

  const transaction = await global.sequelize.transaction();
  try {
    const guest = await global.models.Guest.findByPk(guest_id, { transaction });
    if (!guest) {
      await transaction.rollback();
      return res.status(404).json({
        message: 'Guest not found',
        timestamp: new Date().toISOString(),
      });
    }

    // Use room_number from the guest record
    const room_number = guest.room_number;

    let total_amount = 0;
    items.forEach(item => {
      total_amount += (item.quantity * item.unit_price) - (item.item_discount || 0);
    });
    const final_amount = total_amount - (bill_discount || 0) + (service_charge || 0) + (gratuity || 0);
    const invoice_no = `PI-HOTEL-${moment().format('YYYYMMDD')}-${Math.floor(Math.random() * 1000)}`;

    const proformaInvoice = await global.models.ProformaInvoice.create({
      invoice_no,
      guest_id,
      room_number, // Set from guest record
      issue_date: issue_date || moment().format('YYYY-MM-DD'),
      due_date: due_date || null,
      total_amount,
      bill_discount: bill_discount || 0,
      service_charge: service_charge || 0,
      gratuity: gratuity || 0,
      final_amount,
      remarks: remarks || null,
      status: 'draft',
    }, { transaction });

    await Promise.all(items.map(async (item) => {
      await global.models.ProformaInvoiceItem.create({
        proforma_invoice_id: proformaInvoice.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        item_discount: item.item_discount || 0,
        category: item.category || null,
        preparation_time: item.preparation_time || null,
        line_total: (item.quantity * item.unit_price) - (item.item_discount || 0),
      }, { transaction });
    }));

    const createdInvoice = await global.models.ProformaInvoice.findByPk(proformaInvoice.id, {
      include: [
        { model: global.models.Guest, as: 'guest' },
        { model: global.models.ProformaInvoiceItem, as: 'items', include: [{ model: global.models.Product, as: 'product' }] },
      ],
      transaction,
    });

    await transaction.commit();
    res.status(201).json({
      message: 'Proforma invoice created successfully',
      proforma_invoice: createdInvoice,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Proforma invoice creation failed at:', new Date().toISOString(), error);
    res.status(500).json({
      message: 'Failed to create proforma invoice',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/proforma-invoices - Fetch all proforma invoices
router.get('/', async (req, res) => {
  try {
    const proformaInvoices = await global.models.ProformaInvoice.findAll({
      include: [
        { model: global.models.Guest, as: 'guest' },
        { model: global.models.ProformaInvoiceItem, as: 'items', include: [{ model: global.models.Product, as: 'product' }] },
      ],
    });
    res.json(proformaInvoices);
  } catch (error) {
    console.error('Error fetching proforma invoices:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/proforma-invoices/:id - Fetch a specific proforma invoice
router.get('/:id', async (req, res) => {
  try {
    const proformaInvoice = await global.models.ProformaInvoice.findByPk(req.params.id, {
      include: [
        { model: global.models.Guest, as: 'guest' },
        { model: global.models.ProformaInvoiceItem, as: 'items', include: [{ model: global.models.Product, as: 'product' }] },
      ],
    });
    if (!proformaInvoice) {
      return res.status(404).json({ message: 'Proforma invoice not found' });
    }
    res.json(proformaInvoice);
  } catch (error) {
    console.error('Error fetching proforma invoice:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/proforma-invoices/:id - Update a proforma invoice
router.put('/:id', [
  body('guest_id').optional().isInt({ min: 1 }).withMessage('Guest ID must be a positive integer'),
  body('issue_date').optional().isISO8601().withMessage('Issue date must be a valid date'),
  body('due_date').optional().isISO8601().withMessage('Due date must be a valid date'),
  body('items').optional().isArray().withMessage('Items must be an array'),
  body('items.*.product_id').optional().isInt({ min: 1 }).withMessage('Product ID must be a positive integer'),
  body('items.*.quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('items.*.unit_price').optional().isFloat({ min: 0 }).withMessage('Unit price must be a non-negative number'),
  body('items.*.item_discount').optional().isFloat({ min: 0 }).withMessage('Item discount must be a non-negative number'),
  body('bill_discount').optional().isFloat({ min: 0 }).withMessage('Bill discount must be a non-negative number'),
  body('service_charge').optional().isFloat({ min: 0 }).withMessage('Service charge must be a non-negative number'),
  body('gratuity').optional().isFloat({ min: 0 }).withMessage('Gratuity must be a non-negative number'),
  body('remarks').optional().isString().withMessage('Remarks must be a string'),
  body('status').optional().isIn(['draft', 'issued', 'fulfilled', 'cancelled']).withMessage('Status must be draft, issued, fulfilled, or cancelled'),
], validate, async (req, res) => {
  const transaction = await global.sequelize.transaction();
  try {
    const proformaInvoice = await global.models.ProformaInvoice.findByPk(req.params.id, { transaction });
    if (!proformaInvoice) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Proforma invoice not found', timestamp: new Date().toISOString() });
    }

    const { guest_id, issue_date, due_date, items, bill_discount, service_charge, gratuity, remarks, status } = req.body;
    if (guest_id) {
      const guest = await global.models.Guest.findByPk(guest_id, { transaction });
      if (!guest) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Guest not found', timestamp: new Date().toISOString() });
      }
      await proformaInvoice.set('room_number', guest.room_number); // Update room_number if guest changes
    }

    if (items && items.length > 0) {
      await global.models.ProformaInvoiceItem.destroy({ where: { proforma_invoice_id: proformaInvoice.id }, transaction });
      await Promise.all(items.map(async (item) => {
        await global.models.ProformaInvoiceItem.create({
          proforma_invoice_id: proformaInvoice.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          item_discount: item.item_discount || 0,
          category: item.category || null,
          preparation_time: item.preparation_time || null,
          line_total: (item.quantity * item.unit_price) - (item.item_discount || 0),
        }, { transaction });
      }));
    }

    const updates = {
      guest_id,
      issue_date,
      due_date,
      bill_discount: bill_discount || 0,
      service_charge: service_charge || 0,
      gratuity: gratuity || 0,
      remarks: remarks || null,
      status: status || 'draft',
    };
    let total_amount = 0;
    const newItems = await global.models.ProformaInvoiceItem.findAll({ where: { proforma_invoice_id: proformaInvoice.id }, transaction });
    newItems.forEach(item => {
      total_amount += item.line_total;
    });
    updates.total_amount = total_amount;
    updates.final_amount = total_amount - (updates.bill_discount || 0) + (updates.service_charge || 0) + (updates.gratuity || 0);

    await proformaInvoice.update(updates, { transaction });

    const updatedInvoice = await global.models.ProformaInvoice.findByPk(proformaInvoice.id, {
      include: [
        { model: global.models.Guest, as: 'guest' },
        { model: global.models.ProformaInvoiceItem, as: 'items', include: [{ model: global.models.Product, as: 'product' }] },
      ],
      transaction,
    });

    await transaction.commit();
    res.json({
      message: 'Proforma invoice updated successfully',
      proforma_invoice: updatedInvoice,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Proforma invoice update failed at:', new Date().toISOString(), error);
    res.status(500).json({
      message: 'Failed to update proforma invoice',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// DELETE /api/proforma-invoices/:id - Delete a proforma invoice
router.delete('/:id', async (req, res) => {
  const transaction = await global.sequelize.transaction();
  try {
    const proformaInvoice = await global.models.ProformaInvoice.findByPk(req.params.id, { transaction });
    if (!proformaInvoice) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Proforma invoice not found', timestamp: new Date().toISOString() });
    }
    await global.models.ProformaInvoiceItem.destroy({ where: { proforma_invoice_id: req.params.id }, transaction });
    await proformaInvoice.destroy({ transaction });
    await transaction.commit();
    res.status(204).send();
  } catch (error) {
    await transaction.rollback();
    console.error('Proforma invoice deletion failed at:', new Date().toISOString(), error);
    res.status(500).json({
      message: 'Failed to delete proforma invoice',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/proforma-invoices/:id/send - Send a proforma invoice
router.post('/:id/send', async (req, res) => {
  try {
    const proformaInvoice = await global.models.ProformaInvoice.findByPk(req.params.id, {
      include: [
        { model: global.models.Guest, as: 'guest' },
        { model: global.models.ProformaInvoiceItem, as: 'items', include: [{ model: global.models.Product, as: 'product' }] },
      ],
    });
    
    if (!proformaInvoice) {
      return res.status(404).json({ message: 'Proforma invoice not found', timestamp: new Date().toISOString() });
    }

    // Update status to 'issued' when sent
    await proformaInvoice.update({ status: 'issued' });

    res.json({
      message: 'Proforma invoice sent successfully',
      proforma_invoice: proformaInvoice,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error sending proforma invoice:', error);
    res.status(500).json({
      message: 'Failed to send proforma invoice',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;