const { sequelize, models } = require('./models');

async function createTables() {
  try {
    console.log('Creating sample tables...');
    
    await models.Table.bulkCreate([
      { table_number: 'T1', table_name: 'Table 1', capacity: 4, status: 'available', floor: 1, location: 'Main Hall' },
      { table_number: 'T2', table_name: 'Table 2', capacity: 6, status: 'available', floor: 1, location: 'Main Hall' },
      { table_number: 'T3', table_name: 'Table 3', capacity: 2, status: 'available', floor: 1, location: 'Window Side' },
      { table_number: 'T4', table_name: 'Table 4', capacity: 8, status: 'occupied', floor: 1, location: 'Main Hall' },
      { table_number: 'T5', table_name: 'Table 5', capacity: 4, status: 'available', floor: 2, location: 'Private Area' }
    ]);
    
    console.log('Sample tables created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  }
}

createTables();
