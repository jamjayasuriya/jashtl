const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

// GET all tables
router.get('/', async (req, res) => {
  try {
    if (!global.models || !global.models.Table) {
      return res.status(500).json({ message: 'Server configuration error: Table model not initialized' });
    }

    const { status, room_id, floor, is_active } = req.query;
    const whereClause = {};

    if (status) whereClause.status = status;
    if (room_id) whereClause.room_id = room_id;
    if (floor) whereClause.floor = floor;
    if (is_active !== undefined) whereClause.is_active = is_active === 'true';

    const tables = await global.models.Table.findAll({
      where: whereClause,
      include: [
        {
          model: global.models.Room,
          as: 'room',
          attributes: ['id', 'room_number', 'room_type', 'floor']
        }
      ],
      order: [['table_number', 'ASC']]
    });

    res.status(200).json(tables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ message: 'Failed to fetch tables', error: error.message });
  }
});

// GET available tables
router.get('/available', async (req, res) => {
  try {
    if (!global.models || !global.models.Table) {
      return res.status(500).json({ message: 'Server configuration error: Table model not initialized' });
    }

    const { capacity, floor, room_id } = req.query;
    const whereClause = {
      status: 'available',
      is_active: true
    };

    if (capacity) whereClause.capacity = { [Op.gte]: parseInt(capacity) };
    if (floor) whereClause.floor = parseInt(floor);
    if (room_id) whereClause.room_id = parseInt(room_id);

    const tables = await global.models.Table.findAll({
      where: whereClause,
      include: [
        {
          model: global.models.Room,
          as: 'room',
          attributes: ['id', 'room_number', 'room_type', 'floor']
        }
      ],
      order: [['table_number', 'ASC']]
    });

    res.status(200).json(tables);
  } catch (error) {
    console.error('Error fetching available tables:', error);
    res.status(500).json({ message: 'Failed to fetch available tables', error: error.message });
  }
});

// GET table by ID
router.get('/:id', async (req, res) => {
  try {
    if (!global.models || !global.models.Table) {
      return res.status(500).json({ message: 'Server configuration error: Table model not initialized' });
    }

    const tableId = parseInt(req.params.id, 10);
    if (isNaN(tableId)) {
      return res.status(400).json({ message: 'Invalid table ID' });
    }

    const table = await global.models.Table.findByPk(tableId, {
      include: [
        {
          model: global.models.Room,
          as: 'room',
          attributes: ['id', 'room_number', 'room_type', 'floor']
        }
      ]
    });

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    res.status(200).json(table);
  } catch (error) {
    console.error('Error fetching table by ID:', error);
    res.status(500).json({ message: 'Failed to fetch table', error: error.message });
  }
});

// POST create new table
router.post('/', async (req, res) => {
  try {
    if (!global.models || !global.models.Table) {
      return res.status(500).json({ message: 'Server configuration error: Table model not initialized' });
    }

    const {
      table_number,
      table_name,
      capacity = 4,
      room_id,
      location,
      floor,
      hourly_rate = 0,
      additional_charges = 0,
      special_instructions
    } = req.body;

    // Validate required fields
    if (!table_number) {
      return res.status(400).json({ message: 'Table number is required' });
    }

    // Check if table number already exists
    const existingTable = await global.models.Table.findOne({
      where: { table_number }
    });

    if (existingTable) {
      return res.status(400).json({ message: 'Table number already exists' });
    }

    // Validate room_id if provided
    if (room_id) {
      const room = await global.models.Room.findByPk(room_id);
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }
    }

    const table = await global.models.Table.create({
      table_number,
      table_name,
      capacity,
      room_id,
      location,
      floor,
      hourly_rate,
      additional_charges,
      special_instructions,
      status: 'available',
      is_active: true
    });

    res.status(201).json({ message: 'Table created successfully', table });
  } catch (error) {
    console.error('Error creating table:', error);
    res.status(500).json({ message: 'Error creating table', error: error.message });
  }
});

// PUT update table
router.put('/:id', async (req, res) => {
  try {
    if (!global.models || !global.models.Table) {
      return res.status(500).json({ message: 'Server configuration error: Table model not initialized' });
    }

    const tableId = parseInt(req.params.id, 10);
    if (isNaN(tableId)) {
      return res.status(400).json({ message: 'Invalid table ID' });
    }

    const table = await global.models.Table.findByPk(tableId);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    const {
      table_number,
      table_name,
      capacity,
      status,
      room_id,
      location,
      floor,
      hourly_rate,
      additional_charges,
      is_active,
      special_instructions
    } = req.body;

    // Check if table number is being changed and if it already exists
    if (table_number && table_number !== table.table_number) {
      const existingTable = await global.models.Table.findOne({
        where: { 
          table_number,
          id: { [Op.ne]: tableId }
        }
      });

      if (existingTable) {
        return res.status(400).json({ message: 'Table number already exists' });
      }
    }

    // Validate room_id if provided
    if (room_id && room_id !== table.room_id) {
      const room = await global.models.Room.findByPk(room_id);
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }
    }

    await table.update({
      table_number: table_number || table.table_number,
      table_name: table_name !== undefined ? table_name : table.table_name,
      capacity: capacity || table.capacity,
      status: status || table.status,
      room_id: room_id !== undefined ? room_id : table.room_id,
      location: location !== undefined ? location : table.location,
      floor: floor !== undefined ? floor : table.floor,
      hourly_rate: hourly_rate !== undefined ? hourly_rate : table.hourly_rate,
      additional_charges: additional_charges !== undefined ? additional_charges : table.additional_charges,
      is_active: is_active !== undefined ? is_active : table.is_active,
      special_instructions: special_instructions !== undefined ? special_instructions : table.special_instructions
    });

    res.status(200).json({ message: 'Table updated successfully', table });
  } catch (error) {
    console.error('Error updating table:', error);
    res.status(500).json({ message: 'Error updating table', error: error.message });
  }
});

// DELETE table
router.delete('/:id', async (req, res) => {
  try {
    if (!global.models || !global.models.Table) {
      return res.status(500).json({ message: 'Server configuration error: Table model not initialized' });
    }

    const tableId = parseInt(req.params.id, 10);
    if (isNaN(tableId)) {
      return res.status(400).json({ message: 'Invalid table ID' });
    }

    const table = await global.models.Table.findByPk(tableId);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    // Check if table has any orders
    const ordersCount = await global.models.Order.count({
      where: { table_id: tableId }
    });

    if (ordersCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete table with existing orders. Please reassign or complete orders first.' 
      });
    }

    await table.destroy();
    res.status(200).json({ message: 'Table deleted successfully' });
  } catch (error) {
    console.error('Error deleting table:', error);
    res.status(500).json({ message: 'Error deleting table', error: error.message });
  }
});

module.exports = router;
