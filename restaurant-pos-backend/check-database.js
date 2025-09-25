const { sequelize, models } = require('./models');

async function checkDatabase() {
  try {
    console.log('Checking database contents...');
    
    const { Category, Product, Customer, User } = models;

    // Check categories
    const categoryCount = await Category.count();
    console.log(`Categories: ${categoryCount}`);
    if (categoryCount > 0) {
      const categories = await Category.findAll();
      categories.forEach(cat => console.log(`  - ${cat.name}`));
    }

    // Check products
    const productCount = await Product.count();
    console.log(`Products: ${productCount}`);
    if (productCount > 0) {
      const products = await Product.findAll({ limit: 5 });
      products.forEach(prod => console.log(`  - ${prod.name} ($${prod.price})`));
    }

    // Check customers
    const customerCount = await Customer.count();
    console.log(`Customers: ${customerCount}`);
    if (customerCount > 0) {
      const customers = await Customer.findAll();
      customers.forEach(cust => console.log(`  - ${cust.name} (ID: ${cust.id})`));
    }

    // Check users
    const userCount = await User.count();
    console.log(`Users: ${userCount}`);

    if (productCount === 0) {
      console.log('\n❌ No products found! The POS will be empty.');
      console.log('Run: node quick-test-data.js to add test data');
    } else {
      console.log('\n✅ Database has data - POS should work!');
    }
    
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await sequelize.close();
  }
}

checkDatabase();
