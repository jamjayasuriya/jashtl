const { sequelize, models } = require('./models');

async function initializeDatabase() {
  try {
    console.log('Initializing SQLite database...');
    
    // Sync all models to create tables
    await sequelize.sync({ force: true });
    console.log('Database tables created successfully!');
    
    // Add some sample data
    const { Category, Product, User, Customer } = models;
    
    // Create sample categories
    await Category.bulkCreate([
      { name: 'Hot food' },
      { name: 'Beverages' },
      { name: 'Food' },
      { name: 'Appetizers' },
      { name: 'Main Courses' },
      { name: 'Desserts' }
    ]);
    console.log('Sample categories created!');
    
    // Create sample products
    await Product.bulkCreate([
      {
        name: 'Burger',
        description: 'Delicious beef burger',
        price: 12.99,
        cost_price: 8.00,
        category_id: 1,
        stock_quantity: 50,
        min_stock_level: 10,
        image: 'burger.jpg',
        is_active: true
      },
      {
        name: 'Caesar Salad',
        description: 'Fresh caesar salad',
        price: 8.99,
        cost_price: 5.00,
        category_id: 1,
        stock_quantity: 30,
        min_stock_level: 5,
        image: 'ceasarsalad.jpg',
        is_active: true
      },
      {
        name: 'Garlic Bread',
        description: 'Crispy garlic bread',
        price: 4.99,
        cost_price: 2.50,
        category_id: 1,
        stock_quantity: 25,
        min_stock_level: 5,
        image: 'garlicbread.jpg',
        is_active: true
      },
      {
        name: 'Margherita Pizza',
        description: 'Classic margherita pizza',
        price: 15.99,
        cost_price: 10.00,
        category_id: 1,
        stock_quantity: 20,
        min_stock_level: 5,
        image: 'margheritapizza.jpg',
        is_active: true
      }
    ]);
    console.log('Sample products created!');
    
    // Create admin user (password: admin123)
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await User.create({
      username: 'admin',
      email: 'admin@restaurant.com',
      password: hashedPassword,
      role: 'admin',
      is_active: true
    });
    console.log('Admin user created! (username: admin, password: admin123)');
    
    // Create default customer with ID 1 (expected by frontend)
    await Customer.create({
      id: 1,
      name: 'Running Customer',
      email: 'running@customer.com',
      phone: '000-000-0000',
      address: 'Default Customer',
      dues: 0.00
    });
    console.log('Default customer created! (ID: 1, name: Running Customer)');
    
    console.log('Database initialization completed successfully!');
    console.log('You can now start the server with: npm start');
    
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await sequelize.close();
  }
}

initializeDatabase();
