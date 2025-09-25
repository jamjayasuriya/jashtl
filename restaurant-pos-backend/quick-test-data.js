const { sequelize, models } = require('./models');

async function addQuickTestData() {
  try {
    console.log('Adding quick test data...');
    
    const { Category, Product, Customer } = models;

    // Add a few categories if they don't exist
    const categories = await Category.findAll();
    if (categories.length === 0) {
      await Category.bulkCreate([
        { name: 'Appetizers' },
        { name: 'Main Courses' },
        { name: 'Beverages' },
        { name: 'Pizza' }
      ]);
      console.log('✓ Categories added');
    }

    // Add default customer if not exists
    const existingCustomer = await Customer.findByPk(1);
    if (!existingCustomer) {
      await Customer.create({
        id: 1,
        name: 'Running Customer',
        email: 'running@customer.com',
        phone: '000-000-0000',
        address: 'Default Customer',
        dues: 0.00
      });
      console.log('✓ Default customer added');
    }

    // Add some basic products
    const products = await Product.findAll();
    if (products.length === 0) {
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
          is_active: true,
          preparation_area: 'kitchen'
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
          is_active: true,
          preparation_area: 'kitchen'
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
          is_active: true,
          preparation_area: 'kitchen'
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
          is_active: true,
          preparation_area: 'kitchen'
        },
        {
          name: 'Coca Cola',
          description: 'Refreshing cola drink',
          price: 2.99,
          cost_price: 1.00,
          category_id: 1,
          stock_quantity: 100,
          min_stock_level: 20,
          image: 'coca-cola.jpg',
          is_active: true,
          preparation_area: 'bar'
        },
        {
          name: 'Coffee',
          description: 'Freshly brewed coffee',
          price: 3.99,
          cost_price: 1.50,
          category_id: 1,
          stock_quantity: 60,
          min_stock_level: 15,
          image: 'coffee.jpg',
          is_active: true,
          preparation_area: 'bar'
        }
      ]);
      console.log('✓ Products added');
    }

    console.log('✅ Quick test data setup complete!');
    
  } catch (error) {
    console.error('Error adding test data:', error);
  } finally {
    await sequelize.close();
  }
}

addQuickTestData();
