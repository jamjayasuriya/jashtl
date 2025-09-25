'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class RoomOccupyRooms extends Model {
    static associate(models) {
      // RoomOccupy association (belongs to RoomOccupy)
      RoomOccupyRooms.belongsTo(models.RoomOccupy, {
        foreignKey: 'occupy_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      // Room association (belongs to Room)
      RoomOccupyRooms.belongsTo(models.Room, {
        foreignKey: 'room_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  RoomOccupyRooms.init(
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
      },
      room_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'rooms',
          key: 'id',
        },
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
      modelName: 'RoomOccupyRooms',
      tableName: 'room_occupy_rooms',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      paranoid: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    }
  );

  return RoomOccupyRooms;
};