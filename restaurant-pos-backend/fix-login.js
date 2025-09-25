const { sequelize, models } = require('./models');
const bcrypt = require('bcryptjs');

async function fixLogin() {
  try {
    console.log('🔧 Fixing login issues...');
    
    const { User } = models;

    // 1. Check database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    // 2. Check if users table exists and has data
    const userCount = await User.count();
    console.log(`📊 Total users in database: ${userCount}`);

    if (userCount === 0) {
      console.log('❌ No users found! Creating default users...');
      
      // Create admin user
      const adminPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'admin',
        email: 'admin@restaurant.com',
        password: adminPassword,
        role: 'admin',
        is_active: true
      });
      console.log('✅ Admin user created');

      // Create manager user
      const managerPassword = await bcrypt.hash('manager123', 10);
      await User.create({
        username: 'manager',
        email: 'manager@restaurant.com',
        password: managerPassword,
        role: 'manager',
        is_active: true
      });
      console.log('✅ Manager user created');

      // Create staff user
      const staffPassword = await bcrypt.hash('staff123', 10);
      await User.create({
        username: 'staff',
        email: 'staff@restaurant.com',
        password: staffPassword,
        role: 'staff',
        is_active: true
      });
      console.log('✅ Staff user created');
    }

    // 3. Verify users and test passwords
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'role', 'is_active']
    });

    console.log('\n📋 Available users:');
    for (const user of users) {
      console.log(`  - ${user.username} (${user.role}) - Active: ${user.is_active}`);
      
      // Test password
      const testPassword = user.username === 'admin' ? 'admin123' : 
                          user.username === 'manager' ? 'manager123' : 'staff123';
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log(`    Password test: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    }

    console.log('\n🔑 Login Credentials:');
    console.log('Username: admin, Password: admin123');
    console.log('Username: manager, Password: manager123');
    console.log('Username: staff, Password: staff123');

    console.log('\n🌐 Make sure your backend server is running:');
    console.log('cd restaurant-pos-backend && npm start');
    console.log('Server should be running on http://localhost:3000');

    console.log('\n🌐 Make sure your frontend is running:');
    console.log('cd restaurant-pos-frontend && npm run dev');
    console.log('Frontend should be running on http://localhost:5173');

    console.log('\n✅ Login setup complete!');
    
  } catch (error) {
    console.error('❌ Error fixing login:', error);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Make sure database file exists');
    console.log('2. Check if all dependencies are installed (npm install)');
    console.log('3. Verify server is running on port 3000');
    console.log('4. Check browser console for errors');
  } finally {
    await sequelize.close();
  }
}

fixLogin();
