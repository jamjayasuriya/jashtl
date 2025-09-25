const { sequelize, models } = require('./models');

async function addDrinkProducts() {
  try {
    console.log('Adding drink products...');
    
    const { Category, Product } = models;
    
    // Get drink categories
    const drinkCategories = await Category.findAll({
      where: {
        name: [
          'Hot Beverages',
          'Cold Beverages', 
          'Alcoholic Drinks',
          'Soft Drinks',
          'Fresh Juices',
          'Coffee & Tea',
          'Energy Drinks',
          'Water & Sports Drinks'
        ]
      }
    });
    
    console.log('Found drink categories:', drinkCategories.map(c => c.name));
    
    // Define drink products
    const drinkProducts = [
      // Hot Beverages
      { name: 'Hot Chocolate', price: 250.00, category: 'Hot Beverages', preparation_area: 'kitchen', description: 'Rich and creamy hot chocolate' },
      { name: 'Cappuccino', price: 180.00, category: 'Coffee & Tea', preparation_area: 'kitchen', description: 'Espresso with steamed milk foam' },
      { name: 'Latte', price: 200.00, category: 'Coffee & Tea', preparation_area: 'kitchen', description: 'Espresso with steamed milk' },
      { name: 'Americano', price: 150.00, category: 'Coffee & Tea', preparation_area: 'kitchen', description: 'Espresso with hot water' },
      { name: 'Espresso', price: 120.00, category: 'Coffee & Tea', preparation_area: 'kitchen', description: 'Strong black coffee' },
      { name: 'Green Tea', price: 100.00, category: 'Coffee & Tea', preparation_area: 'kitchen', description: 'Traditional green tea' },
      { name: 'Black Tea', price: 80.00, category: 'Coffee & Tea', preparation_area: 'kitchen', description: 'Classic black tea' },
      
      // Cold Beverages
      { name: 'Iced Coffee', price: 200.00, category: 'Cold Beverages', preparation_area: 'kitchen', description: 'Cold brewed coffee' },
      { name: 'Iced Tea', price: 120.00, category: 'Cold Beverages', preparation_area: 'kitchen', description: 'Refreshing iced tea' },
      { name: 'Milkshake - Vanilla', price: 300.00, category: 'Cold Beverages', preparation_area: 'kitchen', description: 'Creamy vanilla milkshake' },
      { name: 'Milkshake - Chocolate', price: 320.00, category: 'Cold Beverages', preparation_area: 'kitchen', description: 'Rich chocolate milkshake' },
      { name: 'Milkshake - Strawberry', price: 310.00, category: 'Cold Beverages', preparation_area: 'kitchen', description: 'Sweet strawberry milkshake' },
      
      // Soft Drinks
      { name: 'Coca Cola', price: 150.00, category: 'Soft Drinks', preparation_area: null, description: 'Classic cola drink' },
      { name: 'Pepsi', price: 150.00, category: 'Soft Drinks', preparation_area: null, description: 'Refreshing cola' },
      { name: 'Sprite', price: 150.00, category: 'Soft Drinks', preparation_area: null, description: 'Lemon-lime soda' },
      { name: 'Fanta Orange', price: 150.00, category: 'Soft Drinks', preparation_area: null, description: 'Orange flavored soda' },
      { name: 'Mountain Dew', price: 160.00, category: 'Soft Drinks', preparation_area: null, description: 'Citrus flavored soda' },
      
      // Fresh Juices
      { name: 'Orange Juice', price: 200.00, category: 'Fresh Juices', preparation_area: 'kitchen', description: 'Freshly squeezed orange juice' },
      { name: 'Apple Juice', price: 180.00, category: 'Fresh Juices', preparation_area: 'kitchen', description: 'Fresh apple juice' },
      { name: 'Mango Juice', price: 220.00, category: 'Fresh Juices', preparation_area: 'kitchen', description: 'Sweet mango juice' },
      { name: 'Pineapple Juice', price: 200.00, category: 'Fresh Juices', preparation_area: 'kitchen', description: 'Tropical pineapple juice' },
      { name: 'Mixed Fruit Juice', price: 250.00, category: 'Fresh Juices', preparation_area: 'kitchen', description: 'Blend of fresh fruits' },
      
      // Energy Drinks
      { name: 'Red Bull', price: 300.00, category: 'Energy Drinks', preparation_area: null, description: 'Energy drink' },
      { name: 'Monster Energy', price: 350.00, category: 'Energy Drinks', preparation_area: null, description: 'High energy drink' },
      { name: 'Rockstar Energy', price: 320.00, category: 'Energy Drinks', preparation_area: null, description: 'Energy boost drink' },
      
      // Water & Sports Drinks
      { name: 'Mineral Water', price: 80.00, category: 'Water & Sports Drinks', preparation_area: null, description: 'Pure mineral water' },
      { name: 'Sparkling Water', price: 100.00, category: 'Water & Sports Drinks', preparation_area: null, description: 'Carbonated water' },
      { name: 'Gatorade', price: 200.00, category: 'Water & Sports Drinks', preparation_area: null, description: 'Sports drink' },
      { name: 'Powerade', price: 180.00, category: 'Water & Sports Drinks', preparation_area: null, description: 'Sports hydration drink' },
      
      // Alcoholic Drinks (if applicable)
      { name: 'Beer - Local', price: 400.00, category: 'Alcoholic Drinks', preparation_area: 'bar', description: 'Local beer' },
      { name: 'Beer - Imported', price: 500.00, category: 'Alcoholic Drinks', preparation_area: 'bar', description: 'Imported beer' },
      { name: 'Wine - Red', price: 800.00, category: 'Alcoholic Drinks', preparation_area: 'bar', description: 'Red wine' },
      { name: 'Wine - White', price: 750.00, category: 'Alcoholic Drinks', preparation_area: 'bar', description: 'White wine' },
      { name: 'Whiskey', price: 1200.00, category: 'Alcoholic Drinks', preparation_area: 'bar', description: 'Premium whiskey' },
      { name: 'Vodka', price: 1000.00, category: 'Alcoholic Drinks', preparation_area: 'bar', description: 'Premium vodka' }
    ];
    
    // Add products
    for (const productData of drinkProducts) {
      const category = drinkCategories.find(c => c.name === productData.category);
      if (category) {
        const exists = await Product.findOne({ where: { name: productData.name } });
        if (!exists) {
          await Product.create({
            name: productData.name,
            price: productData.price,
            category_id: category.id,
            preparation_area: productData.preparation_area,
            description: productData.description,
            stock: Math.floor(Math.random() * 50) + 10, // Random stock between 10-60
            status: 'active',
            sku: `DRINK-${productData.name.toUpperCase().replace(/\s+/g, '-')}`,
            min_stock_level: 5
          });
          console.log(`✓ Added drink: ${productData.name} (${productData.category})`);
        } else {
          console.log(`- Drink already exists: ${productData.name}`);
        }
      } else {
        console.log(`⚠ Category not found: ${productData.category}`);
      }
    }
    
    console.log('✓ Drink products setup completed!');
    
    // Show summary by category
    console.log('\nDrink products by category:');
    for (const category of drinkCategories) {
      const products = await Product.findAll({
        where: { category_id: category.id },
        attributes: ['name', 'price']
      });
      console.log(`\n${category.name} (${products.length} items):`);
      products.forEach(product => {
        console.log(`  - ${product.name}: Rs. ${product.price}`);
      });
    }
    
  } catch (error) {
    console.error('Error adding drink products:', error);
  } finally {
    await sequelize.close();
  }
}

addDrinkProducts();
