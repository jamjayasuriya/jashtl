// backend/create-booking-tables.js
const { sequelize, models } = require('./models');

async function createBookingTables() {
  try {
    console.log('Creating booking tables...');
    
    // Create only the new booking tables without altering existing ones
    await models.TableBooking.sync({ force: false });
    await models.RoomBooking.sync({ force: false });
    
    console.log('✓ TableBooking table created successfully');
    console.log('✓ RoomBooking table created successfully');
    
    // Test the tables by creating a sample record
    try {
      const testTableBooking = await models.TableBooking.create({
        table_id: 1,
        customer_id: 1,
        booking_date: new Date(),
        end_date: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours later
        duration: 120,
        party_size: 2,
        status: 'confirmed',
        created_by: 1
      });
      console.log('✓ Test table booking created:', testTableBooking.id);
      
      // Clean up test record
      await testTableBooking.destroy();
      console.log('✓ Test table booking cleaned up');
    } catch (testError) {
      console.log('Note: Could not create test table booking (this is normal if tables/rooms don\'t exist yet)');
    }
    
    try {
      const testRoomBooking = await models.RoomBooking.create({
        room_id: 1,
        customer_id: 1,
        check_in_date: new Date().toISOString().split('T')[0],
        check_out_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        duration: 1,
        guests: 2,
        status: 'confirmed',
        created_by: 1
      });
      console.log('✓ Test room booking created:', testRoomBooking.id);
      
      // Clean up test record
      await testRoomBooking.destroy();
      console.log('✓ Test room booking cleaned up');
    } catch (testError) {
      console.log('Note: Could not create test room booking (this is normal if tables/rooms don\'t exist yet)');
    }
    
    console.log('Booking tables creation completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating booking tables:', error);
    process.exit(1);
  }
}

createBookingTables();
