const { sequelize, models } = require('./models');

async function addDefaultCustomer() {
  try {
    console.log('Adding default customer to existing database...');
    
    // Check if customer with ID 1 already exists
    const existingCustomer = await models.Customer.findByPk(1);
    if (existingCustomer) {
      console.log('Default customer (ID: 1) already exists:', existingCustomer.name);
      return;
    }

    // Create default customer with ID 1
    await models.Customer.create({
      id: 1,
      name: 'Running Customer',
      email: 'running@customer.com',
      phone: '000-000-0000',
      address: 'Default Customer',
      dues: 0.00
    });
    console.log('✓ Default customer created successfully! (ID: 1, name: Running Customer)');
    
  } catch (error) {
    console.error('Error adding default customer:', error);
  } finally {
    await sequelize.close();
  }
}

addDefaultCustomer();
