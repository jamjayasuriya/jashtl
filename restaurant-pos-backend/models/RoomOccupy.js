'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class RoomOccupy extends Model {
    static associate(models) {
      // Guest association (one RoomOccupy belongs to one Guest)
      RoomOccupy.belongsTo(models.Guest, {
        foreignKey: 'guest_id',
        as: 'guest',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      // RoomOccupyRooms association (one RoomOccupy has many RoomOccupyRooms)
      RoomOccupy.hasMany(models.RoomOccupyRooms, {
        foreignKey: 'occupy_id',
        as: 'roomOccupyRooms',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      // RoomBillPayments association (one RoomOccupy has many RoomBillPayments)
      RoomOccupy.hasMany(models.RoomBillPayments, {
        foreignKey: 'occupy_id',
        as: 'payments',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      // Room association (many-to-many through RoomOccupyRooms) - TEMPORARILY DISABLED
      // RoomOccupy.belongsToMany(models.Room, {
      //   through: models.RoomOccupyRooms,
      //   foreignKey: 'occupy_id',
      //   otherKey: 'room_id',
      //   as: 'rooms',
      // });

      // Sales association (one RoomOccupy has many Sales) - REMOVED (Sale doesn't have occupy_id)
      // RoomOccupy.hasMany(models.Sale, {
      //   foreignKey: 'occupy_id',
      //   as: 'sales',
      //   onDelete: 'SET NULL',
      //   onUpdate: 'CASCADE',
      // });
    }
  }

  RoomOccupy.init(
    {
      occupy_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      guest_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'guests',
          key: 'id',
        },
      },
      checkin_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      checkout_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      total_on_pos: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
      },
      total_on_other: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
      },
      advance_paid: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
      },
      room_charge: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
      },
      status: {
        type: DataTypes.ENUM('active', 'checked_out'),
        defaultValue: 'active',
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'RoomOccupy',
      tableName: 'room_occupy',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      paranoid: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    }
  );

  return RoomOccupy;
};