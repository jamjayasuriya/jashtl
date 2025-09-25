'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('orders', 'table_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'tables',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('orders', 'room_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'rooms',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('orders', 'order_type', {
      type: Sequelize.ENUM('dine_in', 'takeaway', 'room_service', 'delivery'),
      allowNull: false,
      defaultValue: 'dine_in',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('orders', 'order_type');
    await queryInterface.removeColumn('orders', 'room_id');
    await queryInterface.removeColumn('orders', 'table_id');
  }
};
