const { Sequelize } = require('sequelize');
const path = require('path');

// Database configuration
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false
});

// Define Room model
const Room = sequelize.define('Room', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  room_number: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  room_type: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'single'
  },
  daily_rate: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  max_occupancy: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 2
  },
  amenities: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  floor: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  status: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'available'
  },
  room_service_enabled: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'rooms',
  timestamps: true
});

async function createSampleRooms() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Check if rooms already exist
    const existingRooms = await Room.count();
    if (existingRooms > 0) {
      console.log(`${existingRooms} rooms already exist. Skipping creation.`);
      return;
    }

    // Sample rooms data
    const sampleRooms = [
      {
        room_number: '101',
        room_type: 'single',
        daily_rate: 50.00,
        max_occupancy: 2,
        amenities: JSON.stringify(['WiFi', 'TV', 'AC', 'Mini Bar']),
        floor: 1,
        status: 'available',
        room_service_enabled: true
      },
      {
        room_number: '102',
        room_type: 'double',
        daily_rate: 75.00,
        max_occupancy: 4,
        amenities: JSON.stringify(['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony']),
        floor: 1,
        status: 'available',
        room_service_enabled: true
      },
      {
        room_number: '201',
        room_type: 'suite',
        daily_rate: 120.00,
        max_occupancy: 6,
        amenities: JSON.stringify(['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony', 'Jacuzzi']),
        floor: 2,
        status: 'available',
        room_service_enabled: true
      },
      {
        room_number: '202',
        room_type: 'single',
        daily_rate: 50.00,
        max_occupancy: 2,
        amenities: JSON.stringify(['WiFi', 'TV', 'AC']),
        floor: 2,
        status: 'available',
        room_service_enabled: true
      },
      {
        room_number: '301',
        room_type: 'deluxe',
        daily_rate: 100.00,
        max_occupancy: 4,
        amenities: JSON.stringify(['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony', 'Room Service']),
        floor: 3,
        status: 'available',
        room_service_enabled: true
      },
      {
        room_number: '302',
        room_type: 'single',
        daily_rate: 50.00,
        max_occupancy: 2,
        amenities: JSON.stringify(['WiFi', 'TV', 'AC']),
        floor: 3,
        status: 'maintenance',
        room_service_enabled: false
      }
    ];

    // Create rooms
    await Room.bulkCreate(sampleRooms);
    console.log(`${sampleRooms.length} sample rooms created successfully!`);

  } catch (error) {
    console.error('Error creating sample rooms:', error);
  } finally {
    await sequelize.close();
  }
}

createSampleRooms();
