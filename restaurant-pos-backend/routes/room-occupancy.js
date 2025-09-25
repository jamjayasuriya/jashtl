const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { Op } = require('sequelize');

// GET /api/room-occupancy - Fetch all room occupancies
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, guest_id, start_date, end_date } = req.query;
    const whereClause = {};

    if (status) whereClause.status = status;
    if (guest_id) whereClause.guest_id = guest_id;
    if (start_date && end_date) {
      whereClause.checkin_date = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    const occupancies = await global.models.RoomOccupy.findAll({
      where: whereClause,
      order: [['checkin_date', 'DESC']]
    });

    res.json(occupancies);
  } catch (error) {
    console.error('Error fetching room occupancies:', error);
    res.status(500).json({ 
      message: 'Error fetching room occupancies', 
      error: error.message 
    });
  }
});

// GET /api/room-occupancy/:id - Fetch single occupancy
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const occupancy = await global.models.RoomOccupy.findByPk(req.params.id);

    if (!occupancy) {
      return res.status(404).json({ message: 'Room occupancy not found' });
    }

    res.json(occupancy);
  } catch (error) {
    console.error('Error fetching room occupancy:', error);
    res.status(500).json({ 
      message: 'Error fetching room occupancy', 
      error: error.message 
    });
  }
});

// POST /api/room-occupancy - Create new room occupancy (Check-in)
router.post('/', authenticateToken, async (req, res) => {
  const transaction = await global.sequelize.transaction();
  
  try {
    const {
      guest_id,
      room_ids, // Array of room IDs
      checkin_date,
      advance_paid = 0,
      room_charge = 0
    } = req.body;

    // Validate required fields
    if (!guest_id || !room_ids || !Array.isArray(room_ids) || room_ids.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'Guest ID and room IDs are required' 
      });
    }

    // Check if guest exists
    const guest = await global.models.Guest.findByPk(guest_id, { transaction });
    if (!guest) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Guest not found' });
    }

    // Check if rooms exist and are available
    const rooms = await global.models.Room.findAll({
      where: { 
        id: { [Op.in]: room_ids },
        status: 'available'
      },
      transaction
    });

    if (rooms.length !== room_ids.length) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'One or more rooms are not available' 
      });
    }

    // Create room occupancy
    const occupancy = await global.models.RoomOccupy.create({
      guest_id,
      checkin_date: checkin_date || new Date(),
      advance_paid,
      room_charge,
      status: 'active'
    }, { transaction });

    // Associate rooms with occupancy
    const roomOccupancyData = room_ids.map(room_id => ({
      occupy_id: occupancy.occupy_id,
      room_id
    }));

    await global.models.RoomOccupyRooms.bulkCreate(roomOccupancyData, { transaction });

    // Update room statuses to occupied
    await global.models.Room.update(
      { status: 'occupied', guest_id },
      { 
        where: { id: { [Op.in]: room_ids } },
        transaction 
      }
    );

    await transaction.commit();

    // Fetch the created occupancy with all relations
    const createdOccupancy = await global.models.RoomOccupy.findByPk(occupancy.occupy_id, {
      include: [
        {
          model: global.models.Guest,
          as: 'guest',
          attributes: ['id', 'first_name', 'last_name', 'phone_no']
        },
        {
          model: global.models.Room,
          as: 'rooms',
          through: { attributes: [] },
          attributes: ['id', 'room_number', 'room_type', 'daily_rate']
        }
      ]
    });

    res.status(201).json(createdOccupancy);
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating room occupancy:', error);
    res.status(500).json({ 
      message: 'Error creating room occupancy', 
      error: error.message 
    });
  }
});

// PUT /api/room-occupancy/:id/checkout - Check out guest
router.put('/:id/checkout', authenticateToken, async (req, res) => {
  const transaction = await global.sequelize.transaction();
  
  try {
    const { checkout_date, total_on_pos = 0, total_on_other = 0 } = req.body;

    const occupancy = await global.models.RoomOccupy.findByPk(req.params.id, {
      include: [
        {
          model: global.models.Room,
          as: 'rooms',
          through: { attributes: [] },
          attributes: ['id']
        }
      ],
      transaction
    });

    if (!occupancy) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Room occupancy not found' });
    }

    if (occupancy.status === 'checked_out') {
      await transaction.rollback();
      return res.status(400).json({ message: 'Guest already checked out' });
    }

    // Update occupancy
    await occupancy.update({
      checkout_date: checkout_date || new Date(),
      total_on_pos,
      total_on_other,
      status: 'checked_out'
    }, { transaction });

    // Get room IDs for this occupancy
    const roomIds = occupancy.rooms.map(room => room.id);

    // Update room statuses to available
    await global.models.Room.update(
      { status: 'available', guest_id: null },
      { 
        where: { id: { [Op.in]: roomIds } },
        transaction 
      }
    );

    await transaction.commit();

    res.json({ message: 'Guest checked out successfully', occupancy });
  } catch (error) {
    await transaction.rollback();
    console.error('Error checking out guest:', error);
    res.status(500).json({ 
      message: 'Error checking out guest', 
      error: error.message 
    });
  }
});

// POST /api/room-occupancy/:id/payment - Add payment to occupancy
router.post('/:id/payment', authenticateToken, async (req, res) => {
  try {
    const {
      payment_method,
      amount,
      details = null,
      transaction_reference = null
    } = req.body;

    // Validate required fields
    if (!payment_method || !amount || amount <= 0) {
      return res.status(400).json({ 
        message: 'Payment method and valid amount are required' 
      });
    }

    // Check if occupancy exists
    const occupancy = await global.models.RoomOccupy.findByPk(req.params.id);
    if (!occupancy) {
      return res.status(404).json({ message: 'Room occupancy not found' });
    }

    const payment = await global.models.RoomBillPayments.create({
      occupy_id: req.params.id,
      payment_method,
      amount,
      details,
      transaction_reference,
      payment_status: 'completed'
    });

    res.status(201).json(payment);
  } catch (error) {
    console.error('Error adding payment:', error);
    res.status(500).json({ 
      message: 'Error adding payment', 
      error: error.message 
    });
  }
});

// GET /api/room-occupancy/active/current - Get current active occupancies
router.get('/active/current', authenticateToken, async (req, res) => {
  try {
    const activeOccupancies = await global.models.RoomOccupy.findAll({
      where: { status: 'active' },
      order: [['checkin_date', 'DESC']]
    });

    res.json(activeOccupancies);
  } catch (error) {
    console.error('Error fetching active occupancies:', error);
    res.status(500).json({ 
      message: 'Error fetching active occupancies', 
      error: error.message 
    });
  }
});

module.exports = router;
