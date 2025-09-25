// backend/routes/table-bookings.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

// GET /api/table-bookings - Get all table bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await global.models.TableBooking.findAll({
      include: [
        {
          model: global.models.Table,
          as: 'table'
        },
        {
          model: global.models.Customer,
          as: 'customer'
        }
      ],
      order: [['booking_date', 'DESC']]
    });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching table bookings:', error);
    res.status(500).json({ message: 'Error fetching table bookings', error: error.message });
  }
});

// GET /api/table-bookings/available - Get available tables for a specific date/time
router.get('/available', async (req, res) => {
  try {
    const { date, time, duration = 120 } = req.query; // duration in minutes
    
    if (!date || !time) {
      return res.status(400).json({ message: 'Date and time are required' });
    }

    const bookingDateTime = new Date(`${date}T${time}`);
    const endDateTime = new Date(bookingDateTime.getTime() + duration * 60000);

    // Find tables that are not booked during the requested time
    const bookedTables = await global.models.TableBooking.findAll({
      where: {
        [Op.or]: [
          {
            booking_date: {
              [Op.between]: [bookingDateTime, endDateTime]
            }
          },
          {
            end_date: {
              [Op.between]: [bookingDateTime, endDateTime]
            }
          },
          {
            [Op.and]: [
              { booking_date: { [Op.lte]: bookingDateTime } },
              { end_date: { [Op.gte]: endDateTime } }
            ]
          }
        ],
        status: {
          [Op.in]: ['confirmed', 'in_progress']
        }
      },
      attributes: ['table_id']
    });

    const bookedTableIds = bookedTables.map(booking => booking.table_id);

    const availableTables = await global.models.Table.findAll({
      where: {
        id: {
          [Op.notIn]: bookedTableIds
        }
      },
      order: [['table_number', 'ASC']]
    });

    res.json(availableTables);
  } catch (error) {
    console.error('Error fetching available tables:', error);
    res.status(500).json({ message: 'Error fetching available tables', error: error.message });
  }
});

// POST /api/table-bookings - Create a new table booking
router.post('/', async (req, res) => {
  const t = await global.sequelize.transaction();
  try {
    const {
      table_id,
      customer_id,
      booking_date,
      duration = 120,
      party_size,
      special_requests,
      contact_phone,
      contact_email
    } = req.body;

    // Validate required fields
    if (!table_id || !customer_id || !booking_date || !party_size) {
      await t.rollback();
      return res.status(400).json({ 
        message: 'Table ID, customer ID, booking date, and party size are required' 
      });
    }

    // Check if table exists
    const table = await global.models.Table.findByPk(table_id, { transaction: t });
    if (!table) {
      await t.rollback();
      return res.status(404).json({ message: 'Table not found' });
    }

    // Check if table has sufficient capacity
    if (table.capacity < party_size) {
      await t.rollback();
      return res.status(400).json({ 
        message: `Table capacity (${table.capacity}) is less than party size (${party_size})` 
      });
    }

    // Check if customer exists
    const customer = await global.models.Customer.findByPk(customer_id, { transaction: t });
    if (!customer) {
      await t.rollback();
      return res.status(404).json({ message: 'Customer not found' });
    }

    const bookingDateTime = new Date(booking_date);
    const endDateTime = new Date(bookingDateTime.getTime() + duration * 60000);

    // Check for conflicts
    const conflictingBooking = await global.models.TableBooking.findOne({
      where: {
        table_id,
        [Op.or]: [
          {
            booking_date: {
              [Op.between]: [bookingDateTime, endDateTime]
            }
          },
          {
            end_date: {
              [Op.between]: [bookingDateTime, endDateTime]
            }
          },
          {
            [Op.and]: [
              { booking_date: { [Op.lte]: bookingDateTime } },
              { end_date: { [Op.gte]: endDateTime } }
            ]
          }
        ],
        status: {
          [Op.in]: ['confirmed', 'in_progress']
        }
      },
      transaction: t
    });

    if (conflictingBooking) {
      await t.rollback();
      return res.status(409).json({ 
        message: 'Table is already booked for the selected time slot' 
      });
    }

    // Create booking
    const booking = await global.models.TableBooking.create({
      table_id,
      customer_id,
      booking_date: bookingDateTime,
      end_date: endDateTime,
      duration,
      party_size,
      special_requests,
      contact_phone,
      contact_email,
      status: 'confirmed',
      created_by: req.user?.id || 1
    }, { transaction: t });

    await t.commit();

    // Fetch the created booking with relations
    const createdBooking = await global.models.TableBooking.findByPk(booking.id, {
      include: [
        {
          model: global.models.Table,
          as: 'table'
        },
        {
          model: global.models.Customer,
          as: 'customer'
        }
      ]
    });

    res.status(201).json(createdBooking);
  } catch (error) {
    await t.rollback();
    console.error('Error creating table booking:', error);
    res.status(500).json({ message: 'Error creating table booking', error: error.message });
  }
});

// PUT /api/table-bookings/:id - Update a table booking
router.put('/:id', async (req, res) => {
  const t = await global.sequelize.transaction();
  try {
    const { id } = req.params;
    const {
      table_id,
      customer_id,
      booking_date,
      duration,
      party_size,
      special_requests,
      contact_phone,
      contact_email,
      status
    } = req.body;

    const booking = await global.models.TableBooking.findByPk(id, { transaction: t });
    if (!booking) {
      await t.rollback();
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Update booking
    const updateData = {};
    if (table_id) updateData.table_id = table_id;
    if (customer_id) updateData.customer_id = customer_id;
    if (booking_date) {
      updateData.booking_date = new Date(booking_date);
      if (duration) {
        updateData.end_date = new Date(new Date(booking_date).getTime() + duration * 60000);
      }
    }
    if (duration) updateData.duration = duration;
    if (party_size) updateData.party_size = party_size;
    if (special_requests !== undefined) updateData.special_requests = special_requests;
    if (contact_phone) updateData.contact_phone = contact_phone;
    if (contact_email) updateData.contact_email = contact_email;
    if (status) updateData.status = status;

    await booking.update(updateData, { transaction: t });
    await t.commit();

    // Fetch updated booking with relations
    const updatedBooking = await global.models.TableBooking.findByPk(id, {
      include: [
        {
          model: global.models.Table,
          as: 'table'
        },
        {
          model: global.models.Customer,
          as: 'customer'
        }
      ]
    });

    res.json(updatedBooking);
  } catch (error) {
    await t.rollback();
    console.error('Error updating table booking:', error);
    res.status(500).json({ message: 'Error updating table booking', error: error.message });
  }
});

// DELETE /api/table-bookings/:id - Cancel a table booking
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await global.models.TableBooking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Soft delete by changing status to cancelled
    await booking.update({ status: 'cancelled' });

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling table booking:', error);
    res.status(500).json({ message: 'Error cancelling table booking', error: error.message });
  }
});

module.exports = router;
