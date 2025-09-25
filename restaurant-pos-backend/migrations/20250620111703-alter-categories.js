'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the id index exists as a primary key; skip if already present
    const indexes = await queryInterface.showIndex('categories');
    const hasPrimaryIdIndex = indexes.some(index => index.primary && index.field === 'id');
    if (!hasPrimaryIdIndex) {
      await queryInterface.addIndex('categories', ['id'], {
        unique: true,
        name: 'categories_id_unique',
      });
    }

    // No new columns to add based on current model; adjust if needed
  },

  async down(queryInterface, Sequelize) {
    // Remove the index only if it was added
    const indexes = await queryInterface.showIndex('categories');
    const hasCustomIdIndex = indexes.some(index => index.name === 'categories_id_unique');
    if (hasCustomIdIndex) {
      await queryInterface.removeIndex('categories', ['id']);
    }
  },
};