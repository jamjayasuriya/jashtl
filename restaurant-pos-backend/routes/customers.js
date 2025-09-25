const express = require('express');
const router = express.Router();

// GET /api/customers - Fetch all customers (used by pos.js)
router.get('/', async (req, res) => {
  try {
    const customers = await global.models.Customer.findAll({
      attributes: ['id', 'name', 'email', 'phone', 'address', 'dues'],
    });
    res.json(customers.map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      address: c.address,
      dues: c.dues ? parseFloat(c.dues) : 0,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/customers - Create a customer
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    const customer = await global.models.Customer.create({ name, email, phone, address });
    res.status(201).json({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      dues: customer.dues ? parseFloat(customer.dues) : 0,
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/customers/:id - Update a customer
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const customer = await global.models.Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    await customer.update({ name, email, phone, address });
    res.json({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      dues: customer.dues ? parseFloat(customer.dues) : 0,
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/customers/:id - Delete a customer
router.delete('/:id', async (req, res) => {
  const transaction = await global.sequelize.transaction();
  
  try {
    const customer = await global.models.Customer.findByPk(req.params.id, { transaction });
    if (!customer) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    if (customer.dues > 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Cannot delete customer with outstanding dues' });
    }

    // Check for related records that might prevent deletion
    const [orders, sales, tableBookings, roomBookings, customerDues] = await Promise.all([
      global.models.Order.count({ where: { customer_id: req.params.id }, transaction }),
      global.models.Sale.count({ where: { customer_id: req.params.id }, transaction }),
      global.models.TableBooking.count({ where: { customer_id: req.params.id }, transaction }),
      global.models.RoomBooking.count({ where: { customer_id: req.params.id }, transaction }),
      global.models.CustomerDues.count({ where: { customer_id: req.params.id }, transaction })
    ]);

    const hasRelatedRecords = orders > 0 || sales > 0 || tableBookings > 0 || roomBookings > 0 || customerDues > 0;
    
    if (hasRelatedRecords) {
      await transaction.rollback();
      return res.status(409).json({ 
        message: 'Cannot delete customer because there are related records (orders, sales, bookings, or dues) associated with this customer. Please delete or reassign related records first.',
        details: {
          orders,
          sales,
          tableBookings,
          roomBookings,
          customerDues
        }
      });
    }

    // Delete the customer
    await customer.destroy({ transaction });
    await transaction.commit();
    res.status(204).send();
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting customer:', error);
    
    // Handle specific foreign key constraint errors
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(409).json({
        message: 'Cannot delete customer because there are related records associated with this customer. Please delete or reassign related records first.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
    
    res.status(500).json({ 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

module.exports = router;