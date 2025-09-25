const { sequelize, models } = require('./models');

async function setupTables() {
  try {
    console.log('Setting up tables...');
    
    // Create tables table manually
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS tables (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_number VARCHAR(20) UNIQUE NOT NULL,
        table_name VARCHAR(100),
        capacity INTEGER DEFAULT 4,
        status VARCHAR(20) DEFAULT 'available',
        room_id INTEGER,
        location VARCHAR(100),
        floor INTEGER,
        is_active BOOLEAN DEFAULT 1,
        special_instructions TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add new columns to orders table
    await sequelize.query(`
      ALTER TABLE orders ADD COLUMN table_id INTEGER
    `).catch(() => {
      console.log('table_id column already exists');
    });

    await sequelize.query(`
      ALTER TABLE orders ADD COLUMN room_id INTEGER
    `).catch(() => {
      console.log('room_id column already exists');
    });

    await sequelize.query(`
      ALTER TABLE orders ADD COLUMN order_type VARCHAR(20) DEFAULT 'dine_in'
    `).catch(() => {
      console.log('order_type column already exists');
    });

    console.log('Database tables updated successfully');

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
    const existingTables = await sequelize.query('SELECT COUNT(*) as count FROM tables', {
      type: sequelize.QueryTypes.SELECT
    });

    if (existingTables[0].count === 0) {
      console.log('Creating sample tables...');
      for (const tableData of sampleTables) {
        await sequelize.query(`
          INSERT INTO tables (table_number, table_name, capacity, status, location, floor, is_active, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, {
          replacements: [
            tableData.table_number,
            tableData.table_name,
            tableData.capacity,
            tableData.status,
            tableData.location,
            tableData.floor,
            tableData.is_active ? 1 : 0
          ]
        });
        console.log(`Created table: ${tableData.table_number}`);
      }
    } else {
      console.log('Tables already exist, skipping creation');
    }

    // Update rooms to enable room service
    console.log('Updating rooms for room service...');
    await sequelize.query(`
      UPDATE rooms SET room_service_enabled = 1 WHERE room_service_enabled IS NULL
    `).catch(() => {
      console.log('room_service_enabled column does not exist, skipping update');
    });

    console.log('Setup completed successfully!');
  } catch (error) {
    console.error('Error setting up tables:', error);
  } finally {
    await sequelize.close();
  }
}

setupTables();
