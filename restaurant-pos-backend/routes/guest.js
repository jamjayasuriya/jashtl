const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { SequelizeUniqueConstraintError, SequelizeForeignKeyConstraintError } = require('sequelize'); // Import specific Sequelize errors

// GET /api/guests - Fetch all guests
router.get('/', authenticateToken, async (req, res) => {
  try {
    const guests = await global.models.Guest.findAll({
      attributes: ['id', 'first_name', 'last_name', 'phone_no', 'email', 'gender', 'address', 'postcode', 'city', 'country', 'booking_id'],
    });
    res.json(guests.map(g => ({
      id: g.id,
      first_name: g.first_name,
      last_name: g.last_name,
      phone_no: g.phone_no,
      email: g.email,
      gender: g.gender,
      address: g.address,
      postcode: g.postcode,
      city: g.city,
      country: g.country,
      booking_id: g.booking_id,
    })));
  } catch (err) {
    console.error('Error in GET /api/guests:', err);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});

// POST /api/guests - Create a guest
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { first_name, last_name, phone_no, email, gender, address, postcode, city, country, booking_id } = req.body;
    if (!first_name || !last_name || !phone_no || !email) {
      return res.status(400).json({ message: 'First name, last name, phone number, and email are required' });
    }
    const guest = await global.models.Guest.create({ first_name, last_name, phone_no, email, gender, address, postcode, city, country, booking_id });
    res.status(201).json({
      id: guest.id,
      first_name: guest.first_name,
      last_name: guest.last_name,
      phone_no: guest.phone_no,
      email: guest.email,
      gender: guest.gender,
      address: guest.address,
      postcode: guest.postcode,
      city: guest.city,
      country: guest.country,
      booking_id: guest.booking_id,
    });
  } catch (error) {
    // Check if the error is a Sequelize unique constraint error for email
    if (error.name === 'SequelizeUniqueConstraintError' && error.errors && error.errors.some(e => e.path === 'email' && e.type === 'unique violation')) {
      return res.status(409).json({
        message: 'The email address provided is already in use. Please use a different one.',
        field: 'email',
        value: error.errors[0].value
      });
    }
    console.error('Error creating guest:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// PUT /api/guests/:id - Update a guest
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { first_name, last_name, phone_no, email, gender, address, postcode, city, country, booking_id } = req.body;
    const guest = await global.models.Guest.findByPk(req.params.id);
    if (!guest) {
      return res.status(404).json({ message: 'Guest not found' });
    }
    if (!first_name || !last_name || !phone_no || !email) {
      return res.status(400).json({ message: 'First name, last name, phone number, and email are required' });
    }

    await guest.update({ first_name, last_name, phone_no, email, gender, address, postcode, city, country, booking_id });

    res.json({
      id: guest.id,
      first_name: guest.first_name,
      last_name: guest.last_name,
      phone_no: guest.phone_no,
      email: guest.email,
      gender: guest.gender,
      address: guest.address,
      postcode: guest.postcode,
      city: guest.city,
      country: guest.country,
      booking_id: guest.booking_id,
    });
  } catch (error) {
    // Check if the error is a Sequelize unique constraint error for email
    if (error.name === 'SequelizeUniqueConstraintError' && error.errors && error.errors.some(e => e.path === 'email' && e.type === 'unique violation')) {
      return res.status(409).json({
        message: 'The email address provided is already in use by another guest. Please use a different one.',
        field: 'email',
        value: error.errors[0].value
      });
    }
    console.error('Error updating guest:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// DELETE /api/guests/:id - Delete a guest
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const guest = await global.models.Guest.findByPk(req.params.id);
    if (!guest) {
      return res.status(404).json({ message: 'Guest not found' });
    }
    await guest.destroy();
    res.status(204).send();
  } catch (error) {
    // Specific error handling for foreign key constraint violation
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      console.error('Foreign key constraint error when deleting guest:', error.message);
      return res.status(409).json({
        message: 'Cannot delete guest because there are related records (e.g., bookings) associated with this guest. Please delete or reassign related records first.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }

    console.error('Error deleting guest:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;
