const { sequelize, models } = require('./models');
const fs = require('fs');
const path = require('path');

async function importSQLData() {
  try {
    console.log('Importing data from restaurant_pos.sql...');
    
    // First, sync the database to create all tables
    await sequelize.sync({ force: true });
    console.log('Database tables created successfully!');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '..', 'restaurant_pos.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split the SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'));
    
    console.log(`Found ${statements.length} SQL statements to process...`);
    
    // Process each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty statements
      if (statement.startsWith('--') || statement.startsWith('/*') || statement.length === 0) {
        continue;
      }
      
      try {
        // Convert MySQL-specific syntax to SQLite-compatible syntax
        let sqliteStatement = statement
          // Remove MySQL-specific syntax
          .replace(/ENGINE=InnoDB[^;]*/gi, '')
          .replace(/DEFAULT CHARSET=[^;]*/gi, '')
          .replace(/COLLATE=[^;]*/gi, '')
          .replace(/AUTO_INCREMENT=\d+/gi, '')
          .replace(/int\(\d+\)/gi, 'INTEGER')
          .replace(/varchar\(\d+\)/gi, 'TEXT')
          .replace(/text/gi, 'TEXT')
          .replace(/datetime/gi, 'DATETIME')
          .replace(/decimal\(\d+,\d+\)/gi, 'REAL')
          .replace(/tinyint\(\d+\)/gi, 'INTEGER')
          .replace(/enum\([^)]+\)/gi, 'TEXT')
          .replace(/longtext/gi, 'TEXT')
          .replace(/timestamp/gi, 'DATETIME')
          .replace(/current_timestamp\(\)/gi, 'CURRENT_TIMESTAMP')
          .replace(/current_timestamp/gi, 'CURRENT_TIMESTAMP')
          // Remove MySQL-specific table options
          .replace(/,\s*PRIMARY KEY \([^)]+\)/gi, '')
          .replace(/,\s*KEY [^(]+\([^)]+\)/gi, '')
          .replace(/,\s*UNIQUE KEY [^(]+\([^)]+\)/gi, '')
          .replace(/,\s*FULLTEXT KEY [^(]+\([^)]+\)/gi, '')
          .replace(/,\s*CONSTRAINT [^(]+\([^)]+\)/gi, '')
          .replace(/,\s*FOREIGN KEY [^(]+\([^)]+\)/gi, '')
          .replace(/,\s*INDEX [^(]+\([^)]+\)/gi, '')
          // Clean up extra commas
          .replace(/,\s*\)/g, ')')
          .replace(/,\s*$/g, '');
        
        // Skip if it's a CREATE TABLE statement (we already have the models)
        if (sqliteStatement.toUpperCase().includes('CREATE TABLE')) {
          continue;
        }
        
        // Skip if it's an ALTER TABLE statement
        if (sqliteStatement.toUpperCase().includes('ALTER TABLE')) {
          continue;
        }
        
        // Skip if it's a SET statement
        if (sqliteStatement.toUpperCase().includes('SET ')) {
          continue;
        }
        
        // Skip if it's a START TRANSACTION or COMMIT
        if (sqliteStatement.toUpperCase().includes('START TRANSACTION') || 
            sqliteStatement.toUpperCase().includes('COMMIT')) {
          continue;
        }
        
        // Process INSERT statements
        if (sqliteStatement.toUpperCase().includes('INSERT INTO')) {
          // Clean up the INSERT statement
          sqliteStatement = sqliteStatement
            .replace(/`/g, '') // Remove backticks
            .replace(/NOW\(\)/gi, "datetime('now')")
            .replace(/CURRENT_TIMESTAMP/gi, "datetime('now')");
          
          try {
            await sequelize.query(sqliteStatement);
            console.log(`✓ Processed statement ${i + 1}/${statements.length}`);
          } catch (error) {
            console.log(`⚠ Skipped statement ${i + 1}: ${error.message.substring(0, 100)}...`);
          }
        }
        
      } catch (error) {
        console.log(`⚠ Error processing statement ${i + 1}: ${error.message.substring(0, 100)}...`);
      }
    }
    
    console.log('Data import completed!');
    
    // Verify the data was imported
    const { Category, Product, User } = models;
    const categoryCount = await Category.count();
    const productCount = await Product.count();
    const userCount = await User.count();
    
    console.log(`\nImport Summary:`);
    console.log(`- Categories: ${categoryCount}`);
    console.log(`- Products: ${productCount}`);
    console.log(`- Users: ${userCount}`);
    
    console.log('\nDatabase initialization completed successfully!');
    console.log('You can now start the server with: npm start');
    
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    await sequelize.close();
  }
}

importSQLData();
