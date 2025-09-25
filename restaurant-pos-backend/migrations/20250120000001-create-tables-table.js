'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tables', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      table_number: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      table_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      capacity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 4,
      },
      status: {
        type: Sequelize.ENUM('available', 'occupied', 'reserved', 'maintenance'),
        allowNull: false,
        defaultValue: 'available',
      },
      room_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'rooms',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      location: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      floor: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      special_instructions: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add indexes
    await queryInterface.addIndex('tables', ['table_number'], { unique: true });
    await queryInterface.addIndex('tables', ['status']);
    await queryInterface.addIndex('tables', ['room_id']);
    await queryInterface.addIndex('tables', ['floor']);
    await queryInterface.addIndex('tables', ['is_active']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tables');
  }
};
