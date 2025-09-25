// backend/sync-models.js
const { sequelize, models } = require('./models');

async function syncModels() {
  try {
    console.log('Starting model synchronization...');
    
    // Sync all models (create tables if they don't exist)
    await sequelize.sync({ alter: true });
    
    console.log('Model synchronization completed successfully!');
    console.log('Available models:', Object.keys(models));
    
    // Test the new booking models
    if (models.TableBooking) {
      console.log('✓ TableBooking model is available');
    }
    
    if (models.RoomBooking) {
      console.log('✓ RoomBooking model is available');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error synchronizing models:', error);
    process.exit(1);
  }
}

syncModels();
