    'use strict';
    module.exports = {
      up: async (queryInterface, Sequelize) => {
        // This command ensures the status column's ENUM, allowNull, and defaultValue are correctly set in the database.
        // It will alter the column if its definition does not match.
        await queryInterface.changeColumn('orders', 'status', {
          type: Sequelize.ENUM('pending', 'held', 'settled', 'cancelled'),
          allowNull: false,
          defaultValue: 'pending',
        });
      },
      down: async (queryInterface, Sequelize) => {
        // In the 'down' migration, you would typically revert to the previous state.
        // If you had no 'status' column before, or it had different properties,
        // you would define them here. For simplicity, we'll revert to a basic definition.
        // NOTE: This 'down' might lose specific ENUM values if they were different before.
        await queryInterface.changeColumn('orders', 'status', {
          type: Sequelize.STRING, // Revert to a generic string type for 'down'
          allowNull: true,
          defaultValue: null,
        });
      }
    };
    