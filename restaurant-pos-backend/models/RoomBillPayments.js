'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class RoomBillPayments extends Model {
    static associate(models) {
      // RoomBillPayments belongs to RoomOccupy
      RoomBillPayments.belongsTo(models.RoomOccupy, {
        foreignKey: 'occupy_id',
        as: 'roomOccupancy',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  RoomBillPayments.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      occupy_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'room_occupy',
          key: 'occupy_id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      payment_method: {
        type: DataTypes.ENUM('cash', 'card', 'bank_transfer', 'digital_wallet', 'other'),
        allowNull: false,
        defaultValue: 'cash',
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0.01,
        },
      },
      details: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Additional payment details or reference number',
      },
      payment_status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
        allowNull: false,
        defaultValue: 'completed',
      },
      transaction_reference: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'External transaction reference (e.g., card transaction ID)',
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
    },
    {
      sequelize,
      modelName: 'RoomBillPayments',
      tableName: 'room_bill_payments',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      paranoid: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
      indexes: [
        { fields: ['id'], unique: true },
        { fields: ['occupy_id'], unique: false },
        { fields: ['payment_method'], unique: false },
        { fields: ['payment_status'], unique: false },
        { fields: ['created_at'], unique: false },
      ],
    }
  );

  return RoomBillPayments;
};