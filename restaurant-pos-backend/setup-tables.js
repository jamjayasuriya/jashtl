const { sequelize, models } = require('./models');

async function setupTables() {
  try {
    console.log('Setting up tables and running migrations...');
    
    // Sync all models to create tables
    await sequelize.sync({ force: false });
    console.log('Database tables synced successfully');

    // Create some sample tables
    const sampleTables = [
      {
        table_number: 'T1',
        table_name: 'Window Table',
        capacity: 4,
        status: 'available',
        location: 'Main Dining',
        floor: 1,
        is_active: true
      },
      {
        table_number: 'T2',
        table_name: 'Corner Table',
        capacity: 2,
        status: 'available',
        location: 'Main Dining',
        floor: 1,
        is_active: true
      },
      {
        table_number: 'T3',
        table_name: 'Family Table',
        capacity: 6,
        status: 'available',
        location: 'Main Dining',
        floor: 1,
        is_active: true
      },
      {
        table_number: 'T4',
        table_name: 'VIP Table',
        capacity: 4,
        status: 'available',
        location: 'VIP Section',
        floor: 1,
        is_active: true
      },
      {
        table_number: 'T5',
        table_name: 'Bar Table',
        capacity: 2,
        status: 'available',
        location: 'Bar Area',
        floor: 1,
        is_active: true
      }
    ];

    // Check if tables already exist
    const existingTables = await models.Table.findAll();
    if (existingTables.length === 0) {
      console.log('Creating sample tables...');
      for (const tableData of sampleTables) {
        await models.Table.create(tableData);
        console.log(`Created table: ${tableData.table_number}`);
      }
    } else {
      console.log('Tables already exist, skipping creation');
    }

    // Update rooms to enable room service
    console.log('Updating rooms for room service...');
    const rooms = await models.Room.findAll();
    for (const room of rooms) {
      await room.update({ room_service_enabled: true });
    }
    console.log(`Updated ${rooms.length} rooms for room service`);

    console.log('Setup completed successfully!');
  } catch (error) {
    console.error('Error setting up tables:', error);
  } finally {
    await sequelize.close();
  }
}

setupTables();
