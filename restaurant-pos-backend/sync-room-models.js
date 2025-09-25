const { sequelize, models } = require('./models');

async function syncRoomModels() {
  try {
    console.log('Syncing room management models with database...');
    
    // Force sync all models to create/update tables
    await sequelize.sync({ force: false, alter: true });
    
    console.log('✅ Database synced successfully!');
    console.log('✅ Room management tables created/updated');
    
    // Now add sample data
    const { Room, Guest, RoomOccupy, RoomOccupyRooms } = models;

    // 1. Add sample rooms
    const existingRooms = await Room.count();
    if (existingRooms === 0) {
      await Room.bulkCreate([
        {
          room_number: '101',
          room_type: 'single',
          daily_rate: 80.00,
          max_occupancy: 2,
          floor: 1,
          status: 'available',
          amenities: JSON.stringify(['WiFi', 'TV', 'AC', 'Mini Bar'])
        },
        {
          room_number: '102',
          room_type: 'double',
          daily_rate: 120.00,
          max_occupancy: 4,
          floor: 1,
          status: 'available',
          amenities: JSON.stringify(['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony'])
        },
        {
          room_number: '201',
          room_type: 'suite',
          daily_rate: 200.00,
          max_occupancy: 6,
          floor: 2,
          status: 'available',
          amenities: JSON.stringify(['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony', 'Jacuzzi', 'Kitchenette'])
        },
        {
          room_number: '202',
          room_type: 'family',
          daily_rate: 150.00,
          max_occupancy: 6,
          floor: 2,
          status: 'available',
          amenities: JSON.stringify(['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony', 'Extra Bed'])
        },
        {
          room_number: '301',
          room_type: 'single',
          daily_rate: 90.00,
          max_occupancy: 2,
          floor: 3,
          status: 'maintenance',
          amenities: JSON.stringify(['WiFi', 'TV', 'AC'])
        },
        {
          room_number: '302',
          room_type: 'double',
          daily_rate: 130.00,
          max_occupancy: 4,
          floor: 3,
          status: 'available',
          amenities: JSON.stringify(['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony'])
        },
        {
          room_number: '401',
          room_type: 'suite',
          daily_rate: 250.00,
          max_occupancy: 8,
          floor: 4,
          status: 'available',
          amenities: JSON.stringify(['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony', 'Jacuzzi', 'Kitchenette', 'Dining Area'])
        },
        {
          room_number: '402',
          room_type: 'family',
          daily_rate: 180.00,
          max_occupancy: 8,
          floor: 4,
          status: 'reserved',
          amenities: JSON.stringify(['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony', 'Extra Bed', 'Play Area'])
        }
      ]);
      console.log('✅ Sample rooms added');
    }

    // 2. Add sample guests if none exist
    const existingGuests = await Guest.count();
    if (existingGuests === 0) {
      await Guest.bulkCreate([
        {
          first_name: 'John',
          last_name: 'Doe',
          phone_no: '+1-555-0101',
          email: 'john.doe@email.com',
          gender: 'male',
          address: '123 Main St',
          postcode: '12345',
          city: 'New York',
          country: 'USA'
        },
        {
          first_name: 'Jane',
          last_name: 'Smith',
          phone_no: '+1-555-0102',
          email: 'jane.smith@email.com',
          gender: 'female',
          address: '456 Oak Ave',
          postcode: '12346',
          city: 'Los Angeles',
          country: 'USA'
        },
        {
          first_name: 'Mike',
          last_name: 'Johnson',
          phone_no: '+1-555-0103',
          email: 'mike.johnson@email.com',
          gender: 'male',
          address: '789 Pine St',
          postcode: '12347',
          city: 'Chicago',
          country: 'USA'
        }
      ]);
      console.log('✅ Sample guests added');
    }

    // 3. Add sample room occupancy (check-in some guests)
    const existingOccupancies = await RoomOccupy.count();
    if (existingOccupancies === 0) {
      // Get some rooms and guests
      const rooms = await Room.findAll({ where: { status: 'available' }, limit: 2 });
      const guests = await Guest.findAll({ limit: 2 });

      if (rooms.length > 0 && guests.length > 0) {
        // Create occupancy for first guest
        const occupancy1 = await RoomOccupy.create({
          guest_id: guests[0].id,
          checkin_date: new Date(),
          advance_paid: 50.00,
          room_charge: 80.00,
          status: 'active'
        });

        // Associate room with occupancy
        await RoomOccupyRooms.create({
          occupy_id: occupancy1.occupy_id,
          room_id: rooms[0].id
        });

        // Update room status to occupied
        await Room.update(
          { status: 'occupied', guest_id: guests[0].id },
          { where: { id: rooms[0].id } }
        );

        // Create occupancy for second guest if we have enough rooms
        if (rooms.length > 1) {
          const occupancy2 = await RoomOccupy.create({
            guest_id: guests[1].id,
            checkin_date: new Date(),
            advance_paid: 100.00,
            room_charge: 120.00,
            status: 'active'
          });

          await RoomOccupyRooms.create({
            occupy_id: occupancy2.occupy_id,
            room_id: rooms[1].id
          });

          await Room.update(
            { status: 'occupied', guest_id: guests[1].id },
            { where: { id: rooms[1].id } }
          );
        }

        console.log('✅ Sample room occupancies added');
      }
    }

    console.log('\n🎉 Room management system ready!');
    console.log('\n📋 Summary:');
    console.log(`  - Rooms: ${await Room.count()}`);
    console.log(`  - Guests: ${await Guest.count()}`);
    console.log(`  - Active Occupancies: ${await RoomOccupy.count({ where: { status: 'active' } })}`);
    
    console.log('\n🏨 Room Management Features:');
    console.log('1. Room Management - Add, edit, delete rooms');
    console.log('2. Check-in/Check-out - Guest management');
    console.log('3. Room Status - Available, Occupied, Maintenance, Reserved');
    console.log('4. Room Types - Single, Double, Suite, Family');
    console.log('5. Billing Integration - Room charges and POS integration');
    console.log('6. Guest Management - Guest information and history');
    
    console.log('\n🌐 Access Room Management:');
    console.log('1. Go to http://localhost:5173');
    console.log('2. Login with admin/admin123');
    console.log('3. Click "Rooms" in the navigation');
    
  } catch (error) {
    console.error('Error setting up room management:', error);
  } finally {
    await sequelize.close();
  }
}

syncRoomModels();
