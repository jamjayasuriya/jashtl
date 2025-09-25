'use strict';
const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes, Op } = require('sequelize');
const sequelize = require('../config/db'); // Your existing sequelize instance import

// Helper function to load models with error handling
const loadModel = (modelPath) => {
  try {
    const model = require(modelPath)(sequelize, DataTypes);
    console.log(`Loaded model: ${path.basename(modelPath, '.js')} with name: ${model.name}`);
    const isSequelizeModel = model && typeof model === 'function' && model.prototype instanceof Sequelize.Model;
    console.log(`Is ${model.name} a Sequelize model after loading? ${isSequelizeModel}`);
    return model;
  } catch (error) {
    console.error(`Failed to load model from ${modelPath}:`, error);
    throw error;
  }
};

// Dynamically load all models in the current directory
const models = {};
const basename = path.basename(__filename);

fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js'
    );
  })
  .forEach(file => {
    const model = loadModel(path.join(__dirname, file));
    models[model.name] = model;
  });

// Log the models object to debug
console.log('Models before associations:', Object.keys(models));

// Verify that all models are proper Sequelize models
Object.keys(models).forEach(modelName => {
  const model = models[modelName];
  const isSequelizeModel = model && typeof model === 'function' && model.prototype instanceof Sequelize.Model;
  console.log(`Is ${modelName} a Sequelize model? ${isSequelizeModel}`);
  if (!isSequelizeModel) {
    console.error(`Model ${modelName} is not a proper Sequelize model:`, model);
  }
});

// Define associations with explicit ordering to handle dependencies
// Add 'KotBot' after 'Order' and 'User'
// Add 'KotBotItem' after 'KotBot' and 'Product'
const modelsWithAssociations = [
  'Category',
  'Customer',
  'Supplier',
  'Product',
  'PurchaseReturn',
  'PurchaseReturnItem',
  'CustomerDues',
  'SupplierDues',
  'Purchase',
  'PurchaseItem',
  'Sale',
  'SaleProduct',
  'SalePayment',
  'StockAdjustment',
  'ProductPurchase',
  'User',
  'Order',
  'OrderItem', // OrderItem should be after Order and Product
  'KotBot',       // NEW: Add KotBot after Order and User
  'KotBotItem',   // NEW: Add KotBotItem after KotBot and Product (which is already earlier)
  'Guest',
  'ProformaInvoice',
  'ProformaInvoiceItem',
  'Room',
  'Table',
  'RoomOccupy',
  'RoomOccupyRooms',
  'RoomBillPayments',
  'TableBooking',
  'RoomBooking',
].filter(modelName => models[modelName] && typeof models[modelName].associate === 'function');

// Log before setting up associations
console.log('Starting association setup at:', new Date().toISOString());
modelsWithAssociations.forEach((modelName) => {
  try {
    console.log(`Setting up associations for ${modelName} at ${new Date().toISOString()}`);
    if (!models[modelName]) {
      console.error(`Model ${modelName} is undefined, skipping association`);
      return;
    }
    // Add specific debugging for Purchase
    if (modelName === 'Purchase') {
      console.log('Inspecting models.PurchaseReturn:', models.PurchaseReturn);
      console.log('Is models.PurchaseReturn a Sequelize model?',
        models.PurchaseReturn && typeof models.PurchaseReturn === 'function' && models.PurchaseReturn.prototype instanceof Sequelize.Model);
      if (!models.PurchaseReturn) {
        console.error('PurchaseReturn is undefined when setting up Purchase associations');
      }
    }
    // Add specific debugging for PurchaseReturn
    if (modelName === 'PurchaseReturn') {
      console.log('Inspecting models.Purchase:', models.Purchase);
      console.log('Is models.Purchase a Sequelize model?',
        models.Purchase && typeof models.Purchase === 'function' && models.Purchase.prototype instanceof Sequelize.Model);
    }
    // Add specific debugging for PurchaseReturnItem
    if (modelName === 'PurchaseReturnItem') {
      console.log('Inspecting models.PurchaseReturn:', models.PurchaseReturn);
      console.log('Inspecting models.Product:', models.Product);
      console.log('Is models.PurchaseReturn a Sequelize model?',
        models.PurchaseReturn && typeof models.PurchaseReturn === 'function' && models.PurchaseReturn.prototype instanceof Sequelize.Model);
      console.log('Is models.Product a Sequelize model?',
        models.Product && typeof models.Product === 'function' && models.Product.prototype instanceof Sequelize.Model);
    }
    // Add specific debugging for Guest
    if (modelName === 'Guest') {
      console.log('Inspecting models.Booking:', models.Booking);
      console.log('Is models.Booking a Sequelize model?',
        models.Booking && typeof models.Booking === 'function' && models.Booking.prototype instanceof Sequelize.Model);
    }
    // Add specific debugging for ProformaInvoice
    if (modelName === 'ProformaInvoice') {
      console.log('Inspecting models.Guest:', models.Guest);
      console.log('Inspecting models.ProformaInvoiceItem:', models.ProformaInvoiceItem);
      console.log('Is models.Guest a Sequelize model?',
        models.Guest && typeof models.Guest === 'function' && models.Guest.prototype instanceof Sequelize.Model);
      console.log('Is models.ProformaInvoiceItem a Sequelize model?',
        models.ProformaInvoiceItem && typeof models.ProformaInvoiceItem === 'function' && models.ProformaInvoiceItem.prototype instanceof Sequelize.Model);
    }
    // Add specific debugging for ProformaInvoiceItem
    if (modelName === 'ProformaInvoiceItem') {
      console.log('Inspecting models.ProformaInvoice:', models.ProformaInvoice);
      console.log('Inspecting models.Product:', models.Product);
      console.log('Is models.ProformaInvoice a Sequelize model?',
        models.ProformaInvoice && typeof models.ProformaInvoice === 'function' && models.ProformaInvoice.prototype instanceof Sequelize.Model);
      console.log('Is models.Product a Sequelize model?',
        models.Product && typeof models.Product === 'function' && models.Product.prototype instanceof Sequelize.Model);
    }
    // Add specific debugging for KotBot
    if (modelName === 'KotBot') {
      console.log('Inspecting models.Order:', models.Order);
      console.log('Inspecting models.User:', models.User);
      console.log('Is models.Order a Sequelize model?',
        models.Order && typeof models.Order === 'function' && models.Order.prototype instanceof Sequelize.Model);
      console.log('Is models.User a Sequelize model?',
        models.User && typeof models.User === 'function' && models.User.prototype instanceof Sequelize.Model);
    }
    // Add specific debugging for KotBotItem
    if (modelName === 'KotBotItem') {
      console.log('Inspecting models.KotBot:', models.KotBot);
      console.log('Inspecting models.Product:', models.Product);
      console.log('Is models.KotBot a Sequelize model?',
        models.KotBot && typeof models.KotBot === 'function' && models.KotBot.prototype instanceof Sequelize.Model);
      console.log('Is models.Product a Sequelize model?',
        models.Product && typeof models.Product === 'function' && models.Product.prototype instanceof Sequelize.Model);
    }
    models[modelName].associate(models);
  } catch (error) {
    console.error(`Error setting up associations for ${modelName} at ${new Date().toISOString()}:`, error);
    throw error;
  }
});

// Log loaded models for debugging
console.log(
  'Models loaded in index.js at:', new Date().toISOString(),
  Object.keys(models).reduce((acc, key) => {
    acc[key] = models[key] ? 'Defined' : 'Not Defined';
    return acc;
  }, {})
);

// Expose models globally (if your application relies on `global.models` or `global.sequelize`)
// This might conflict with your `module.exports = exportModels;` if not managed carefully.
// If your routes rely on `global.models`, ensure this block is active.
// For now, I'll keep it commented out as your export is structured differently.
/*
global.models = models;
global.sequelize = sequelize;
*/

// Export models and sequelize instance in the expected format
const exportModels = {
  sequelize,
  Op,
  models, // Export the `models` object itself
};

// Add a check to ensure no undefined models
Object.keys(models).forEach((key) => {
  if (!models[key]) {
    console.error(`Model ${key} is undefined in models/index.js at ${new Date().toISOString()}`);
  }
});

console.log('models/index.js loaded successfully at:', new Date().toISOString());

module.exports = exportModels;
