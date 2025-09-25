const { sequelize, models } = require('./models');
const bcrypt = require('bcryptjs');

async function checkLoginSetup() {
  try {
    console.log('Checking login setup...');
    
    const { User } = models;

    // Check if users exist
    const userCount = await User.count();
    console.log(`Total users in database: ${userCount}`);

    if (userCount === 0) {
      console.log('❌ No users found! Creating admin user...');
      
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'admin',
        email: 'admin@restaurant.com',
        password: hashedPassword,
        role: 'admin',
        is_active: true
      });
      console.log('✅ Admin user created (username: admin, password: admin123)');
    } else {
      // List existing users
      const users = await User.findAll({
        attributes: ['id', 'username', 'email', 'role', 'is_active']
      });
      console.log('Existing users:');
      users.forEach(user => {
        console.log(`  - ${user.username} (${user.role}) - Active: ${user.is_active}`);
      });
    }

    // Test password verification
    const adminUser = await User.findOne({ where: { username: 'admin' } });
    if (adminUser) {
      const isValidPassword = await bcrypt.compare('admin123', adminUser.password);
      console.log(`Admin password verification: ${isValidPassword ? '✅ Valid' : '❌ Invalid'}`);
    }

    console.log('\nLogin credentials:');
    console.log('Username: admin');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error checking login setup:', error);
  } finally {
    await sequelize.close();
  }
}

checkLoginSetup();
