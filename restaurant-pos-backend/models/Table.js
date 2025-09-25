'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Table extends Model {
    static associate(models) {
      // Table has many Orders
      Table.hasMany(models.Order, {
        foreignKey: 'table_id',
        as: 'orders',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });

      // Table can belong to a Room (for room service)
      Table.belongsTo(models.Room, {
        foreignKey: 'room_id',
        as: 'room',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });

      // Table has many TableBookings
      Table.hasMany(models.TableBooking, {
        foreignKey: 'table_id',
        as: 'bookings',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  Table.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      table_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len: [1, 20],
        },
      },
      table_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
          len: [0, 100],
        },
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 4,
        validate: {
          min: 1,
          max: 20,
        },
      },
      status: {
        type: DataTypes.ENUM('available', 'occupied', 'reserved', 'maintenance'),
        allowNull: false,
        defaultValue: 'available',
      },
      room_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'rooms',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      location: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
          len: [0, 100],
        },
      },
      floor: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 0,
          max: 10,
        },
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      hourly_rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00,
      },
      additional_charges: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00,
      },
      special_instructions: {
        type: DataTypes.TEXT,
        allowNull: true,
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
      modelName: 'Table',
      tableName: 'tables',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      underscored: true,
      indexes: [
        { fields: ['table_number'], unique: true },
        { fields: ['status'] },
        { fields: ['room_id'] },
        { fields: ['floor'] },
        { fields: ['is_active'] },
      ],
    }
  );

  return Table;
};
