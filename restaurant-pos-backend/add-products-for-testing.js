const { sequelize, models } = require('./models');

async function addProductsForTesting() {
  try {
    console.log('Adding products for POS testing...');
    
    const { Category, Product, Customer } = models;

    // 1. Add categories if they don't exist
    const existingCategories = await Category.findAll();
    if (existingCategories.length === 0) {
      await Category.bulkCreate([
        { name: 'Appetizers' },
        { name: 'Main Courses' },
        { name: 'Beverages' },
        { name: 'Pizza' },
        { name: 'Salads' },
        { name: 'Desserts' }
      ]);
      console.log('✅ Categories added');
    }

    // 2. Add default customer
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
      console.log('✅ Default customer added');
    }

    // 3. Add products
    const existingProducts = await Product.findAll();
    if (existingProducts.length === 0) {
      await Product.bulkCreate([
        // Appetizers
        {
          name: 'Chicken Wings',
          description: 'Crispy chicken wings with your choice of sauce',
          price: 12.99,
          cost_price: 6.50,
          category_id: 1,
          stock_quantity: 50,
          min_stock_level: 10,
          image: 'chicken-wings.jpg',
          is_active: true,
          preparation_area: 'kitchen'
        },
        {
          name: 'Mozzarella Sticks',
          description: 'Golden fried mozzarella sticks with marinara sauce',
          price: 8.99,
          cost_price: 4.00,
          category_id: 1,
          stock_quantity: 30,
          min_stock_level: 5,
          image: 'mozzarella-sticks.jpg',
          is_active: true,
          preparation_area: 'kitchen'
        },
        
        // Main Courses
        {
          name: 'Grilled Salmon',
          description: 'Fresh Atlantic salmon with lemon herb butter',
          price: 24.99,
          cost_price: 12.00,
          category_id: 2,
          stock_quantity: 20,
          min_stock_level: 5,
          image: 'grilled-salmon.jpg',
          is_active: true,
          preparation_area: 'kitchen'
        },
        {
          name: 'Beef Steak',
          description: '8oz ribeye steak cooked to perfection',
          price: 28.99,
          cost_price: 15.00,
          category_id: 2,
          stock_quantity: 15,
          min_stock_level: 3,
          image: 'beef-steak.jpg',
          is_active: true,
          preparation_area: 'kitchen'
        },
        
        // Beverages
        {
          name: 'Coca Cola',
          description: 'Classic Coca Cola soft drink',
          price: 2.99,
          cost_price: 1.00,
          category_id: 3,
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
          category_id: 3,
          stock_quantity: 60,
          min_stock_level: 15,
          image: 'coffee.jpg',
          is_active: true,
          preparation_area: 'bar'
        },
        
        // Pizza
        {
          name: 'Margherita Pizza',
          description: 'Classic pizza with tomato, mozzarella, and basil',
          price: 16.99,
          cost_price: 8.00,
          category_id: 4,
          stock_quantity: 20,
          min_stock_level: 5,
          image: 'margherita-pizza.jpg',
          is_active: true,
          preparation_area: 'kitchen'
        },
        {
          name: 'Pepperoni Pizza',
          description: 'Pizza topped with pepperoni and mozzarella',
          price: 18.99,
          cost_price: 9.00,
          category_id: 4,
          stock_quantity: 18,
          min_stock_level: 5,
          image: 'pepperoni-pizza.jpg',
          is_active: true,
          preparation_area: 'kitchen'
        },
        
        // Salads
        {
          name: 'Caesar Salad',
          description: 'Fresh romaine lettuce with caesar dressing',
          price: 11.99,
          cost_price: 5.00,
          category_id: 5,
          stock_quantity: 30,
          min_stock_level: 8,
          image: 'caesar-salad.jpg',
          is_active: true,
          preparation_area: 'kitchen'
        },
        
        // Desserts
        {
          name: 'Chocolate Cake',
          description: 'Rich chocolate cake with chocolate frosting',
          price: 7.99,
          cost_price: 3.50,
          category_id: 6,
          stock_quantity: 20,
          min_stock_level: 5,
          image: 'chocolate-cake.jpg',
          is_active: true,
          preparation_area: 'kitchen'
        }
      ]);
      console.log('✅ Products added');
    }

    console.log('\n🎉 Test data ready!');
    console.log('\n📋 Products available in POS:');
    const products = await Product.findAll({
      include: [{ model: Category, as: 'category' }]
    });
    
    products.forEach(product => {
      console.log(`  - ${product.name} ($${product.price}) - Stock: ${product.stock_quantity} - ${product.preparation_area || 'Retail'}`);
    });

    console.log('\n🛒 How to add products to cart:');
    console.log('1. Click "Add" button on any product for quick add');
    console.log('2. Click on product card for detailed options');
    console.log('3. Use search and category filters to find products');
    console.log('4. View cart on the right side of POS');
    
  } catch (error) {
    console.error('Error adding test data:', error);
  } finally {
    await sequelize.close();
  }
}

addProductsForTesting();
