// backend/routes/room-bookings.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

// GET /api/room-bookings - Get all room bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await global.models.RoomBooking.findAll({
      include: [
        {
          model: global.models.Room,
          as: 'room'
        },
        {
          model: global.models.Customer,
          as: 'customer'
        }
      ],
      order: [['check_in_date', 'DESC']]
    });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching room bookings:', error);
    res.status(500).json({ message: 'Error fetching room bookings', error: error.message });
  }
});

// GET /api/room-bookings/available - Get available rooms for a specific date range
router.get('/available', async (req, res) => {
  try {
    const { check_in_date, check_out_date, room_type, capacity } = req.query;
    
    if (!check_in_date || !check_out_date) {
      return res.status(400).json({ message: 'Check-in and check-out dates are required' });
    }

    const checkInDate = new Date(check_in_date);
    const checkOutDate = new Date(check_out_date);

    // Find rooms that are booked during the requested period
    const bookedRooms = await global.models.RoomBooking.findAll({
      where: {
        [Op.or]: [
          {
            check_in_date: {
              [Op.between]: [checkInDate, checkOutDate]
            }
          },
          {
            check_out_date: {
              [Op.between]: [checkInDate, checkOutDate]
            }
          },
          {
            [Op.and]: [
              { check_in_date: { [Op.lte]: checkInDate } },
              { check_out_date: { [Op.gte]: checkOutDate } }
            ]
          }
        ],
        status: {
          [Op.in]: ['confirmed', 'checked_in']
        }
      },
      attributes: ['room_id']
    });

    const bookedRoomIds = bookedRooms.map(booking => booking.room_id);

    // Build where clause for available rooms
    const whereClause = {
      id: {
        [Op.notIn]: bookedRoomIds
      },
      room_service_enabled: true
    };

    if (room_type) {
      whereClause.room_type = room_type;
    }

    if (capacity) {
      whereClause.capacity = {
        [Op.gte]: parseInt(capacity)
      };
    }

    const availableRooms = await global.models.Room.findAll({
      where: whereClause,
      order: [['room_number', 'ASC']]
    });

    res.json(availableRooms);
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    res.status(500).json({ message: 'Error fetching available rooms', error: error.message });
  }
});

// POST /api/room-bookings - Create a new room booking
router.post('/', async (req, res) => {
  const t = await global.sequelize.transaction();
  try {
    const {
      room_id,
      customer_id,
      check_in_date,
      check_out_date,
      guests,
      special_requests,
      contact_phone,
      contact_email,
      room_service_preferences
    } = req.body;

    // Validate required fields
    if (!room_id || !customer_id || !check_in_date || !check_out_date || !guests) {
      await t.rollback();
      return res.status(400).json({ 
        message: 'Room ID, customer ID, check-in date, check-out date, and number of guests are required' 
      });
    }

    // Check if room exists and has room service enabled
    const room = await global.models.Room.findByPk(room_id, { transaction: t });
    if (!room || !room.room_service_enabled) {
      await t.rollback();
      return res.status(404).json({ message: 'Room not found or room service not enabled' });
    }

    // Check if room has sufficient capacity
    if (room.capacity < guests) {
      await t.rollback();
      return res.status(400).json({ 
        message: `Room capacity (${room.capacity}) is less than number of guests (${guests})` 
      });
    }

    // Check if customer exists
    const customer = await global.models.Customer.findByPk(customer_id, { transaction: t });
    if (!customer) {
      await t.rollback();
      return res.status(404).json({ message: 'Customer not found' });
    }

    const checkInDate = new Date(check_in_date);
    const checkOutDate = new Date(check_out_date);

    // Validate dates
    if (checkInDate >= checkOutDate) {
      await t.rollback();
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }

    // Check for conflicts
    const conflictingBooking = await global.models.RoomBooking.findOne({
      where: {
        room_id,
        [Op.or]: [
          {
            check_in_date: {
              [Op.between]: [checkInDate, checkOutDate]
            }
          },
          {
            check_out_date: {
              [Op.between]: [checkInDate, checkOutDate]
            }
          },
          {
            [Op.and]: [
              { check_in_date: { [Op.lte]: checkInDate } },
              { check_out_date: { [Op.gte]: checkOutDate } }
            ]
          }
        ],
        status: {
          [Op.in]: ['confirmed', 'checked_in']
        }
      },
      transaction: t
    });

    if (conflictingBooking) {
      await t.rollback();
      return res.status(409).json({ 
        message: 'Room is already booked for the selected dates' 
      });
    }

    // Calculate duration in days
    const duration = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    // Create booking
    const booking = await global.models.RoomBooking.create({
      room_id,
      customer_id,
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      duration,
      guests,
      special_requests,
      contact_phone,
      contact_email,
      room_service_preferences,
      status: 'confirmed',
      created_by: req.user?.id || 1
    }, { transaction: t });

    await t.commit();

    // Fetch the created booking with relations
    const createdBooking = await global.models.RoomBooking.findByPk(booking.id, {
      include: [
        {
          model: global.models.Room,
          as: 'room'
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
    console.error('Error creating room booking:', error);
    res.status(500).json({ message: 'Error creating room booking', error: error.message });
  }
});

// PUT /api/room-bookings/:id - Update a room booking
router.put('/:id', async (req, res) => {
  const t = await global.sequelize.transaction();
  try {
    const { id } = req.params;
    const {
      room_id,
      customer_id,
      check_in_date,
      check_out_date,
      guests,
      special_requests,
      contact_phone,
      contact_email,
      room_service_preferences,
      status
    } = req.body;

    const booking = await global.models.RoomBooking.findByPk(id, { transaction: t });
    if (!booking) {
      await t.rollback();
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Update booking
    const updateData = {};
    if (room_id) updateData.room_id = room_id;
    if (customer_id) updateData.customer_id = customer_id;
    if (check_in_date) updateData.check_in_date = new Date(check_in_date);
    if (check_out_date) updateData.check_out_date = new Date(check_out_date);
    if (guests) updateData.guests = guests;
    if (special_requests !== undefined) updateData.special_requests = special_requests;
    if (contact_phone) updateData.contact_phone = contact_phone;
    if (contact_email) updateData.contact_email = contact_email;
    if (room_service_preferences) updateData.room_service_preferences = room_service_preferences;
    if (status) updateData.status = status;

    // Recalculate duration if dates changed
    if (check_in_date || check_out_date) {
      const checkIn = updateData.check_in_date || booking.check_in_date;
      const checkOut = updateData.check_out_date || booking.check_out_date;
      updateData.duration = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    }

    await booking.update(updateData, { transaction: t });
    await t.commit();

    // Fetch updated booking with relations
    const updatedBooking = await global.models.RoomBooking.findByPk(id, {
      include: [
        {
          model: global.models.Room,
          as: 'room'
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
    console.error('Error updating room booking:', error);
    res.status(500).json({ message: 'Error updating room booking', error: error.message });
  }
});

// DELETE /api/room-bookings/:id - Cancel a room booking
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await global.models.RoomBooking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Soft delete by changing status to cancelled
    await booking.update({ status: 'cancelled' });

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling room booking:', error);
    res.status(500).json({ message: 'Error cancelling room booking', error: error.message });
  }
});

module.exports = router;
