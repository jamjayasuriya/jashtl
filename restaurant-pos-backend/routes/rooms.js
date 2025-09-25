const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { Op } = require('sequelize');

// GET /api/rooms - Fetch all rooms with optional filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, room_type, floor, search } = req.query;
    const whereClause = {};

    if (status) whereClause.status = status;
    if (room_type) whereClause.room_type = room_type;
    if (floor) whereClause.floor = parseInt(floor);
    if (search) {
      whereClause[Op.or] = [
        { room_number: { [Op.like]: `%${search}%` } },
        { amenities: { [Op.like]: `%${search}%` } }
      ];
    }

    const rooms = await global.models.Room.findAll({
      where: whereClause,
      order: [['room_number', 'ASC']]
    });

    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ 
      message: 'Error fetching rooms', 
      error: error.message 
    });
  }
});

// GET /api/rooms/available - Fetch available rooms for room service
router.get('/available', authenticateToken, async (req, res) => {
  try {
    const { room_type, floor, capacity } = req.query;
    const whereClause = {
      status: 'available',
      room_service_enabled: true
    };

    if (room_type) whereClause.room_type = room_type;
    if (floor) whereClause.floor = parseInt(floor);
    if (capacity) whereClause.capacity = { [Op.gte]: parseInt(capacity) };

    const rooms = await global.models.Room.findAll({
      where: whereClause,
      order: [['room_number', 'ASC']]
    });

    res.json(rooms);
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    res.status(500).json({ 
      message: 'Error fetching available rooms', 
      error: error.message 
    });
  }
});

// GET /api/rooms/:id - Fetch single room
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const room = await global.models.Room.findByPk(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ 
      message: 'Error fetching room', 
      error: error.message 
    });
  }
});

// POST /api/rooms - Create new room
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      room_number,
      room_type = 'standard',
      capacity = 2,
      floor = null,
      amenities = null,
      price_per_night = 0,
      hourly_rate = 0,
      additional_charges = 0,
      room_service_enabled = false,
      description = null
    } = req.body;

    // Validate required fields
    if (!room_number) {
      return res.status(400).json({ message: 'Room number is required' });
    }

    // Check if room number already exists
    const existingRoom = await global.models.Room.findOne({
      where: { room_number }
    });

    if (existingRoom) {
      return res.status(400).json({ message: 'Room number already exists' });
    }

    const room = await global.models.Room.create({
      room_number,
      room_type,
      capacity,
      floor,
      amenities,
      price_per_night,
      hourly_rate,
      additional_charges,
      room_service_enabled,
      special_instructions: description,
      status: 'available'
    });

    res.status(201).json(room);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ 
      message: 'Error creating room', 
      error: error.message 
    });
  }
});

// PUT /api/rooms/:id - Update room
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const room = await global.models.Room.findByPk(req.params.id);
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const {
      room_number,
      room_type,
      capacity,
      floor,
      amenities,
      price_per_night,
      hourly_rate,
      additional_charges,
      room_service_enabled,
      description,
      status
    } = req.body;

    // Check if room number is being changed and if it already exists
    if (room_number && room_number !== room.room_number) {
      const existingRoom = await global.models.Room.findOne({
        where: { room_number, id: { [Op.ne]: req.params.id } }
      });

      if (existingRoom) {
        return res.status(400).json({ message: 'Room number already exists' });
      }
    }

    await room.update({
      room_number: room_number || room.room_number,
      room_type: room_type || room.room_type,
      capacity: capacity !== undefined ? capacity : room.capacity,
      floor: floor !== undefined ? floor : room.floor,
      amenities: amenities !== undefined ? amenities : room.amenities,
      price_per_night: price_per_night !== undefined ? price_per_night : room.price_per_night,
      hourly_rate: hourly_rate !== undefined ? hourly_rate : room.hourly_rate,
      additional_charges: additional_charges !== undefined ? additional_charges : room.additional_charges,
      room_service_enabled: room_service_enabled !== undefined ? room_service_enabled : room.room_service_enabled,
      special_instructions: description !== undefined ? description : room.special_instructions,
      status: status || room.status
    });

    res.json(room);
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ 
      message: 'Error updating room', 
      error: error.message 
    });
  }
});

// DELETE /api/rooms/:id - Delete room
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const room = await global.models.Room.findByPk(req.params.id);
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if room is currently occupied
    if (room.status === 'occupied') {
      return res.status(400).json({ 
        message: 'Cannot delete occupied room. Please check out guests first.' 
      });
    }

    await room.destroy();
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ 
      message: 'Error deleting room', 
      error: error.message 
    });
  }
});

// GET /api/rooms/status/summary - Get room status summary
router.get('/status/summary', authenticateToken, async (req, res) => {
  try {
    const summary = await global.models.Room.findAll({
      attributes: [
        'status',
        [global.sequelize.fn('COUNT', global.sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const totalRooms = await global.models.Room.count();
    
    const statusSummary = {
      total: totalRooms,
      available: 0,
      occupied: 0,
      maintenance: 0,
      reserved: 0
    };

    summary.forEach(item => {
      statusSummary[item.status] = parseInt(item.count);
    });

    res.json(statusSummary);
  } catch (error) {
    console.error('Error fetching room status summary:', error);
    res.status(500).json({ 
      message: 'Error fetching room status summary', 
      error: error.message 
    });
  }
});

module.exports = router;
