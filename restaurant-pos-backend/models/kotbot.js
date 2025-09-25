// restaurant-pos-backend/models/kotbot.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const KotBot = sequelize.define('KotBot', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // <--- This should be true, as per our last fix
      references: {
        model: 'Orders',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    kot_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.ENUM('KOT', 'BOT'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('sent', 'preparing', 'ready', 'cancelled'),
      allowNull: false,
      defaultValue: 'sent',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: '',
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    timestamps: false, // Or true, based on your preference and manual timestamp handling
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    tableName: 'kot_bot', // <--- ENSURE THIS IS 'kot_bot' (singular)
    underscored: true,
  });

  KotBot.associate = function(models) {
    KotBot.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
    KotBot.belongsTo(models.User, { foreignKey: 'created_by', as: 'creator' });
    KotBot.hasMany(models.KotBotItem, { foreignKey: 'kot_bot_id', as: 'kotBotItems' });
  };

  return KotBot;
};
