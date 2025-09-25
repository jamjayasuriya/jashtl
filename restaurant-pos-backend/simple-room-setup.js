const { sequelize, models } = require('./models');

async function simpleRoomSetup() {
  try {
    console.log('Setting up room management with simple approach...');
    
    // Just create the room tables without altering existing ones
    const { Room, RoomBillPayments, RoomOccupy, RoomOccupyRooms } = models;

    // Try to create rooms table manually
    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS rooms (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          room_number VARCHAR(20) NOT NULL UNIQUE,
          status VARCHAR(20) DEFAULT 'available',
          guest_id INTEGER,
          daily_rate DECIMAL(10,2) DEFAULT 0.00,
          room_type VARCHAR(20) DEFAULT 'single',
          max_occupancy INTEGER DEFAULT 2,
          amenities TEXT,
          floor INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Rooms table created');
    } catch (err) {
      console.log('Rooms table might already exist:', err.message);
    }

    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS room_bill_payments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          occupy_id INTEGER NOT NULL,
          payment_method VARCHAR(50) NOT NULL DEFAULT 'cash',
          amount DECIMAL(10,2) NOT NULL,
          details VARCHAR(255),
          payment_status VARCHAR(20) DEFAULT 'completed',
          transaction_reference VARCHAR(100),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Room bill payments table created');
    } catch (err) {
      console.log('Room bill payments table might already exist:', err.message);
    }

    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS room_occupy_rooms (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          occupy_id INTEGER NOT NULL,
          room_id INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Room occupy rooms table created');
    } catch (err) {
      console.log('Room occupy rooms table might already exist:', err.message);
    }

    // Now add sample data
    try {
      // Check if rooms exist
      const roomCount = await sequelize.query('SELECT COUNT(*) as count FROM rooms', { type: sequelize.QueryTypes.SELECT });
      
      if (roomCount[0].count === 0) {
        await sequelize.query(`
          INSERT INTO rooms (room_number, room_type, daily_rate, max_occupancy, floor, status, amenities) VALUES
          ('101', 'single', 80.00, 2, 1, 'available', '["WiFi", "TV", "AC", "Mini Bar"]'),
          ('102', 'double', 120.00, 4, 1, 'available', '["WiFi", "TV", "AC", "Mini Bar", "Balcony"]'),
          ('201', 'suite', 200.00, 6, 2, 'available', '["WiFi", "TV", "AC", "Mini Bar", "Balcony", "Jacuzzi", "Kitchenette"]'),
          ('202', 'family', 150.00, 6, 2, 'available', '["WiFi", "TV", "AC", "Mini Bar", "Balcony", "Extra Bed"]'),
          ('301', 'single', 90.00, 2, 3, 'maintenance', '["WiFi", "TV", "AC"]'),
          ('302', 'double', 130.00, 4, 3, 'available', '["WiFi", "TV", "AC", "Mini Bar", "Balcony"]'),
          ('401', 'suite', 250.00, 8, 4, 'available', '["WiFi", "TV", "AC", "Mini Bar", "Balcony", "Jacuzzi", "Kitchenette", "Dining Area"]'),
          ('402', 'family', 180.00, 8, 4, 'reserved', '["WiFi", "TV", "AC", "Mini Bar", "Balcony", "Extra Bed", "Play Area"]')
        `);
        console.log('✅ Sample rooms added');
      } else {
        console.log('✅ Rooms already exist');
      }
    } catch (err) {
      console.log('Error adding rooms:', err.message);
    }

    // Add sample guests if they don't exist
    try {
      const guestCount = await sequelize.query('SELECT COUNT(*) as count FROM guests', { type: sequelize.QueryTypes.SELECT });
      
      if (guestCount[0].count === 0) {
        await sequelize.query(`
          INSERT INTO guests (first_name, last_name, phone_no, email, gender, address, postcode, city, country) VALUES
          ('John', 'Doe', '+1-555-0101', 'john.doe@email.com', 'male', '123 Main St', '12345', 'New York', 'USA'),
          ('Jane', 'Smith', '+1-555-0102', 'jane.smith@email.com', 'female', '456 Oak Ave', '12346', 'Los Angeles', 'USA'),
          ('Mike', 'Johnson', '+1-555-0103', 'mike.johnson@email.com', 'male', '789 Pine St', '12347', 'Chicago', 'USA')
        `);
        console.log('✅ Sample guests added');
      } else {
        console.log('✅ Guests already exist');
      }
    } catch (err) {
      console.log('Error adding guests:', err.message);
    }

    console.log('\n🎉 Room management setup complete!');
    console.log('\n📋 Summary:');
    
    try {
      const roomCount = await sequelize.query('SELECT COUNT(*) as count FROM rooms', { type: sequelize.QueryTypes.SELECT });
      console.log(`  - Rooms: ${roomCount[0].count}`);
    } catch (err) {
      console.log('  - Rooms: Error checking count');
    }
    
    try {
      const guestCount = await sequelize.query('SELECT COUNT(*) as count FROM guests', { type: sequelize.QueryTypes.SELECT });
      console.log(`  - Guests: ${guestCount[0].count}`);
    } catch (err) {
      console.log('  - Guests: Error checking count');
    }
    
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

simpleRoomSetup();
