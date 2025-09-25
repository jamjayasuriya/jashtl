const { sequelize, models } = require('./models');

async function addTestData() {
  try {
    console.log('Adding comprehensive test data to database...');
    
    const { Category, Product, Customer, User } = models;

    // 1. Add Categories
    console.log('Adding categories...');
    await Category.bulkCreate([
      { name: 'Appetizers' },
      { name: 'Main Courses' },
      { name: 'Beverages' },
      { name: 'Desserts' },
      { name: 'Salads' },
      { name: 'Soups' },
      { name: 'Pizza' },
      { name: 'Pasta' },
      { name: 'Sandwiches' },
      { name: 'Hot Food' }
    ], { ignoreDuplicates: true });
    console.log('✓ Categories added');

    // 2. Add Customers
    console.log('Adding customers...');
    await Customer.bulkCreate([
      { id: 1, name: 'Running Customer', email: 'running@customer.com', phone: '000-000-0000', address: 'Default Customer', dues: 0.00 },
      { id: 2, name: 'John Smith', email: 'john@example.com', phone: '123-456-7890', address: '123 Main St', dues: 0.00 },
      { id: 3, name: 'Sarah Johnson', email: 'sarah@example.com', phone: '098-765-4321', address: '456 Oak Ave', dues: 15.50 },
      { id: 4, name: 'Mike Wilson', email: 'mike@example.com', phone: '555-123-4567', address: '789 Pine Rd', dues: 0.00 },
      { id: 5, name: 'Emily Davis', email: 'emily@example.com', phone: '444-555-6666', address: '321 Elm St', dues: 25.75 }
    ], { ignoreDuplicates: true });
    console.log('✓ Customers added');

    // 3. Add Products
    console.log('Adding products...');
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
      {
        name: 'Buffalo Cauliflower',
        description: 'Crispy cauliflower with buffalo sauce',
        price: 9.99,
        cost_price: 4.50,
        category_id: 1,
        stock_quantity: 25,
        min_stock_level: 5,
        image: 'buffalo-cauliflower.jpg',
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
      {
        name: 'Chicken Parmesan',
        description: 'Breaded chicken breast with marinara and mozzarella',
        price: 18.99,
        cost_price: 9.00,
        category_id: 2,
        stock_quantity: 25,
        min_stock_level: 5,
        image: 'chicken-parmesan.jpg',
        is_active: true,
        preparation_area: 'kitchen'
      },

      // Beverages
      {
        name: 'Fresh Orange Juice',
        description: 'Freshly squeezed orange juice',
        price: 4.99,
        cost_price: 2.00,
        category_id: 3,
        stock_quantity: 40,
        min_stock_level: 10,
        image: 'orange-juice.jpg',
        is_active: true,
        preparation_area: 'bar'
      },
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
      {
        name: 'Iced Tea',
        description: 'Refreshing iced tea',
        price: 3.49,
        cost_price: 1.25,
        category_id: 3,
        stock_quantity: 50,
        min_stock_level: 10,
        image: 'iced-tea.jpg',
        is_active: true,
        preparation_area: 'bar'
      },

      // Pizza
      {
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato, mozzarella, and basil',
        price: 16.99,
        cost_price: 8.00,
        category_id: 7,
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
        category_id: 7,
        stock_quantity: 18,
        min_stock_level: 5,
        image: 'pepperoni-pizza.jpg',
        is_active: true,
        preparation_area: 'kitchen'
      },
      {
        name: 'Vegetarian Pizza',
        description: 'Pizza with mixed vegetables and mozzarella',
        price: 17.99,
        cost_price: 8.50,
        category_id: 7,
        stock_quantity: 15,
        min_stock_level: 5,
        image: 'vegetarian-pizza.jpg',
        is_active: true,
        preparation_area: 'kitchen'
      },

      // Salads
      {
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with caesar dressing and croutons',
        price: 11.99,
        cost_price: 5.00,
        category_id: 5,
        stock_quantity: 30,
        min_stock_level: 8,
        image: 'caesar-salad.jpg',
        is_active: true,
        preparation_area: 'kitchen'
      },
      {
        name: 'Greek Salad',
        description: 'Mixed greens with feta cheese, olives, and tomatoes',
        price: 12.99,
        cost_price: 5.50,
        category_id: 5,
        stock_quantity: 25,
        min_stock_level: 6,
        image: 'greek-salad.jpg',
        is_active: true,
        preparation_area: 'kitchen'
      },

      // Desserts
      {
        name: 'Chocolate Cake',
        description: 'Rich chocolate cake with chocolate frosting',
        price: 7.99,
        cost_price: 3.50,
        category_id: 4,
        stock_quantity: 20,
        min_stock_level: 5,
        image: 'chocolate-cake.jpg',
        is_active: true,
        preparation_area: 'kitchen'
      },
      {
        name: 'Cheesecake',
        description: 'New York style cheesecake with berry compote',
        price: 8.99,
        cost_price: 4.00,
        category_id: 4,
        stock_quantity: 15,
        min_stock_level: 3,
        image: 'cheesecake.jpg',
        is_active: true,
        preparation_area: 'kitchen'
      },

      // Sandwiches
      {
        name: 'Club Sandwich',
        description: 'Triple decker sandwich with turkey, bacon, and lettuce',
        price: 14.99,
        cost_price: 7.00,
        category_id: 9,
        stock_quantity: 25,
        min_stock_level: 8,
        image: 'club-sandwich.jpg',
        is_active: true,
        preparation_area: 'kitchen'
      },
      {
        name: 'Grilled Chicken Sandwich',
        description: 'Grilled chicken breast with lettuce, tomato, and mayo',
        price: 13.99,
        cost_price: 6.50,
        category_id: 9,
        stock_quantity: 30,
        min_stock_level: 10,
        image: 'grilled-chicken-sandwich.jpg',
        is_active: true,
        preparation_area: 'kitchen'
      },

      // Pasta
      {
        name: 'Spaghetti Carbonara',
        description: 'Pasta with eggs, cheese, and pancetta',
        price: 16.99,
        cost_price: 8.00,
        category_id: 8,
        stock_quantity: 20,
        min_stock_level: 5,
        image: 'spaghetti-carbonara.jpg',
        is_active: true,
        preparation_area: 'kitchen'
      },
      {
        name: 'Fettuccine Alfredo',
        description: 'Pasta with creamy alfredo sauce',
        price: 15.99,
        cost_price: 7.50,
        category_id: 8,
        stock_quantity: 22,
        min_stock_level: 6,
        image: 'fettuccine-alfredo.jpg',
        is_active: true,
        preparation_area: 'kitchen'
      }
    ], { ignoreDuplicates: true });
    console.log('✓ Products added');

    // 4. Check if admin user exists, if not create one
    const existingUser = await User.findOne({ where: { username: 'admin' } });
    if (!existingUser) {
      console.log('Adding admin user...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await User.create({
        username: 'admin',
        email: 'admin@restaurant.com',
        password: hashedPassword,
        role: 'admin',
        is_active: true
      });
      console.log('✓ Admin user created (username: admin, password: admin123)');
    } else {
      console.log('✓ Admin user already exists');
    }

    console.log('\n🎉 Test data added successfully!');
    console.log('\nSummary:');
    const categoryCount = await Category.count();
    const productCount = await Product.count();
    const customerCount = await Customer.count();
    const userCount = await User.count();
    
    console.log(`- Categories: ${categoryCount}`);
    console.log(`- Products: ${productCount}`);
    console.log(`- Customers: ${customerCount}`);
    console.log(`- Users: ${userCount}`);
    
    console.log('\nYou can now test the POS system with this data!');
    
  } catch (error) {
    console.error('Error adding test data:', error);
  } finally {
    await sequelize.close();
  }
}

addTestData();
