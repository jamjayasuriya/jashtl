const { sequelize, models } = require('./models');
const fs = require('fs');
const path = require('path');

async function importData() {
  try {
    console.log('Importing data from restaurant_pos.sql...');
    
    // First, sync the database to create all tables
    await sequelize.sync({ force: true });
    console.log('Database tables created successfully!');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '..', 'restaurant_pos.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Extract INSERT statements using regex
    const insertRegex = /INSERT INTO `(\w+)` \([^)]+\) VALUES\s*([^;]+);/gi;
    let match;
    let insertCount = 0;
    
    while ((match = insertRegex.exec(sqlContent)) !== null) {
      const tableName = match[1];
      const valuesString = match[2];
      
      try {
        // Parse the values
        const values = parseValues(valuesString);
        
        if (values.length > 0) {
          // Map table names to model names
          const modelMap = {
            'categories': 'Category',
            'customers': 'Customer',
            'products': 'Product',
            'users': 'User',
            'suppliers': 'Supplier',
            'sales': 'Sale',
            'orders': 'Order',
            'order_items': 'OrderItem',
            'sale_products': 'SaleProduct',
            'sale_payments': 'SalePayment',
            'receipts': 'Receipt',
            'guests': 'Guest',
            'kot_bot': 'KotBot',
            'kot_bot_items': 'KotBotItem',
            'proforma_invoices': 'ProformaInvoice',
            'proforma_invoice_items': 'ProformaInvoiceItem',
            'purchases': 'Purchase',
            'purchase_items': 'PurchaseItem',
            'purchase_returns': 'PurchaseReturn',
            'purchase_return_items': 'PurchaseReturnItem',
            'customer_dues': 'CustomerDues',
            'supplier_dues': 'SupplierDues',
            'stock_adjustments': 'StockAdjustment',
            'goods_returns': 'GoodsReturn',
            'rooms': 'Room',
            'room_occupy': 'RoomOccupy',
            'room_occupy_rooms': 'RoomOccupyRooms',
            'room_bill_payments': 'RoomBillPayments'
          };
          
          const modelName = modelMap[tableName];
          if (modelName && models[modelName]) {
            const Model = models[modelName];
            
            // Insert data in batches
            const batchSize = 100;
            for (let i = 0; i < values.length; i += batchSize) {
              const batch = values.slice(i, i + batchSize);
              await Model.bulkCreate(batch, { ignoreDuplicates: true });
            }
            
            console.log(`✓ Imported ${values.length} records into ${tableName}`);
            insertCount += values.length;
          } else {
            console.log(`⚠ Skipped table ${tableName} (no model mapping)`);
          }
        }
      } catch (error) {
        console.log(`⚠ Error importing ${tableName}: ${error.message}`);
      }
    }
    
    console.log(`\nImport completed! Total records imported: ${insertCount}`);
    
    // Verify the data was imported
    const { Category, Product, User, Customer } = models;
    const categoryCount = await Category.count();
    const productCount = await Product.count();
    const userCount = await User.count();
    const customerCount = await Customer.count();
    
    console.log(`\nImport Summary:`);
    console.log(`- Categories: ${categoryCount}`);
    console.log(`- Products: ${productCount}`);
    console.log(`- Users: ${userCount}`);
    console.log(`- Customers: ${customerCount}`);
    
    console.log('\nDatabase initialization completed successfully!');
    console.log('You can now start the server with: npm start');
    
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    await sequelize.close();
  }
}

function parseValues(valuesString) {
  const values = [];
  const rows = valuesString.split('),(');
  
  for (let i = 0; i < rows.length; i++) {
    let row = rows[i];
    
    // Clean up the row
    if (i === 0) row = row.replace(/^\(/, '');
    if (i === rows.length - 1) row = row.replace(/\)$/, '');
    
    // Split by comma, but be careful with quoted strings
    const fields = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';
    
    for (let j = 0; j < row.length; j++) {
      const char = row[j];
      
      if ((char === "'" || char === '"') && !inQuotes) {
        inQuotes = true;
        quoteChar = char;
        current += char;
      } else if (char === quoteChar && inQuotes) {
        inQuotes = false;
        quoteChar = '';
        current += char;
      } else if (char === ',' && !inQuotes) {
        fields.push(cleanValue(current.trim()));
        current = '';
      } else {
        current += char;
      }
    }
    
    if (current.trim()) {
      fields.push(cleanValue(current.trim()));
    }
    
    if (fields.length > 0) {
      values.push(fields);
    }
  }
  
  return values;
}

function cleanValue(value) {
  // Remove quotes and handle NULL values
  if (value === 'NULL' || value === 'null') {
    return null;
  }
  
  if ((value.startsWith("'") && value.endsWith("'")) || 
      (value.startsWith('"') && value.endsWith('"'))) {
    return value.slice(1, -1);
  }
  
  return value;
}

importData();
