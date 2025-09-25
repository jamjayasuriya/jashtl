const express = require('express');
const router = express.Router();
const { SupplierDues, Supplier } = require('../models');

// Get all supplier dues
router.get('/', async (req, res) => {
  try {
    const dues = await SupplierDues.findAll({
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'name'],
        },
      ],
    });
    res.json(dues);
  } catch (error) {
    console.error('Error fetching supplier dues:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a supplier due
router.post('/', async (req, res) => {
  try {
    const due = await SupplierDues.create({
      supplier_id: req.body.supplier_id,
      amount_due: req.body.amount_due || 0.00,
      last_updated: new Date(),
    });
    res.status(201).json(due);
  } catch (error) {
    console.error('Error creating supplier due:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;