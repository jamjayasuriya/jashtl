// backend/test-rooms.js
const { sequelize, models } = require('./models');

async function testRooms() {
  try {
    console.log('Testing rooms and room bookings...');
    
    // Check if rooms exist
    const rooms = await models.Room.findAll();
    console.log('Total rooms found:', rooms.length);
    console.log('Rooms:', rooms.map(r => ({ id: r.id, room_number: r.room_number, room_service_enabled: r.room_service_enabled })));
    
    // Check if room bookings exist
    const roomBookings = await models.RoomBooking.findAll();
    console.log('Total room bookings found:', roomBookings.length);
    
    // Test the available rooms query
    const checkInDate = new Date('2025-09-23');
    const checkOutDate = new Date('2025-09-24');
    
    console.log('Testing available rooms query...');
    const availableRooms = await models.Room.findAll({
      where: {
        room_service_enabled: true
      }
    });
    
    console.log('Available rooms:', availableRooms.length);
    console.log('Available rooms details:', availableRooms.map(r => ({ 
      id: r.id, 
      room_number: r.room_number, 
      room_type: r.room_type,
      capacity: r.capacity 
    })));
    
    process.exit(0);
  } catch (error) {
    console.error('Error testing rooms:', error);
    process.exit(1);
  }
}

testRooms();
