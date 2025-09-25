const { sequelize, models } = require('./models');

async function manualImport() {
  try {
    console.log('Importing data manually from restaurant_pos.sql...');
    
    // First, sync the database to create all tables
    await sequelize.sync({ force: true });
    console.log('Database tables created successfully!');
    
    const { Category, Product, User, Customer, Supplier, Sale, Order, OrderItem, SaleProduct, SalePayment, Receipt, Guest, KotBot, KotBotItem, ProformaInvoice, ProformaInvoiceItem, Purchase, PurchaseItem, PurchaseReturn, PurchaseReturnItem, CustomerDues, SupplierDues, StockAdjustment, GoodsReturn, RoomBillPayments, RoomOccupy, RoomOccupyRooms } = models;
    
    // Import Categories
    await Category.bulkCreate([
      { id: 1, name: 'Hot food' },
      { id: 2, name: 'Beverages' },
      { id: 3, name: 'Food' },
      { id: 5, name: 'Appetizers' },
      { id: 6, name: 'Main Courses' },
      { id: 7, name: 'Desserts' },
      { id: 8, name: 'Appetizers' },
      { id: 9, name: 'Main Courses' },
      { id: 10, name: 'Desserts' },
      { id: 11, name: 'Appetizers' },
      { id: 12, name: 'Main Courses' },
      { id: 13, name: 'Desserts' }
    ]);
    console.log('✓ Categories imported');
    
    // Import Products
    await Product.bulkCreate([
      { id: 1, name: 'Burger', description: 'Delicious beef burger', price: 12.99, cost_price: 8.00, category_id: 1, stock_quantity: 50, min_stock_level: 10, image: 'burger.jpg', is_active: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 2, name: 'Caesar Salad', description: 'Fresh caesar salad', price: 8.99, cost_price: 5.00, category_id: 1, stock_quantity: 30, min_stock_level: 5, image: 'ceasarsalad.jpg', is_active: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 3, name: 'Garlic Bread', description: 'Crispy garlic bread', price: 4.99, cost_price: 2.50, category_id: 1, stock_quantity: 25, min_stock_level: 5, image: 'garlicbread.jpg', is_active: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 4, name: 'Margherita Pizza', description: 'Classic margherita pizza', price: 15.99, cost_price: 10.00, category_id: 1, stock_quantity: 20, min_stock_level: 5, image: 'margheritapizza.jpg', is_active: true, createdAt: new Date(), updatedAt: new Date() }
    ]);
    console.log('✓ Products imported');
    
    // Import Users
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await User.bulkCreate([
      { id: 1, username: 'admin', email: 'admin@restaurant.com', password: hashedPassword, role: 'admin', is_active: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 2, username: 'manager', email: 'manager@restaurant.com', password: hashedPassword, role: 'manager', is_active: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 3, username: 'staff', email: 'staff@restaurant.com', password: hashedPassword, role: 'staff', is_active: true, createdAt: new Date(), updatedAt: new Date() }
    ]);
    console.log('✓ Users imported');
    
    // Import Customers
    await Customer.bulkCreate([
      { id: 1, name: 'John Doe', email: 'john@example.com', phone: '123-456-7890', address: '123 Main St', dues: 0.00, createdAt: new Date(), updatedAt: new Date() },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '098-765-4321', address: '456 Oak Ave', dues: 0.00, createdAt: new Date(), updatedAt: new Date() },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', phone: '555-123-4567', address: '789 Pine Rd', dues: 0.00, createdAt: new Date(), updatedAt: new Date() }
    ]);
    console.log('✓ Customers imported');
    
    // Import Suppliers
    await Supplier.bulkCreate([
      { id: 1, name: 'Fresh Foods Ltd', email: 'orders@freshfoods.com', phone: '111-222-3333', address: '100 Supply St', dues: 0.00, createdAt: new Date(), updatedAt: new Date() },
      { id: 2, name: 'Beverage Co', email: 'sales@beverageco.com', phone: '444-555-6666', address: '200 Drink Ave', dues: 0.00, createdAt: new Date(), updatedAt: new Date() }
    ]);
    console.log('✓ Suppliers imported');
    
    // Import Guests
    await Guest.bulkCreate([
      { id: 1, first_name: 'Walk-in', last_name: 'Customer 1', phone_no: '000-000-0001', email: 'walkin1@example.com', address: null, created_at: new Date(), updated_at: new Date() },
      { id: 2, first_name: 'Walk-in', last_name: 'Customer 2', phone_no: '000-000-0002', email: 'walkin2@example.com', address: null, created_at: new Date(), updated_at: new Date() }
    ]);
    console.log('✓ Guests imported');
    
    console.log('\nImport Summary:');
    const categoryCount = await Category.count();
    const productCount = await Product.count();
    const userCount = await User.count();
    const customerCount = await Customer.count();
    const supplierCount = await Supplier.count();
    const guestCount = await Guest.count();
    
    console.log(`- Categories: ${categoryCount}`);
    console.log(`- Products: ${productCount}`);
    console.log(`- Users: ${userCount}`);
    console.log(`- Customers: ${customerCount}`);
    console.log(`- Suppliers: ${supplierCount}`);
    console.log(`- Guests: ${guestCount}`);
    
    console.log('\nDatabase initialization completed successfully!');
    console.log('Login credentials:');
    console.log('- Username: admin, Password: admin123');
    console.log('- Username: manager, Password: admin123');
    console.log('- Username: staff, Password: admin123');
    console.log('\nYou can now start the server with: npm start');
    
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    await sequelize.close();
  }
}

manualImport();
