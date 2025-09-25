'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Room extends Model {
    static associate(models) {
      // Room belongs to Guest (current guest in room)
      Room.belongsTo(models.Guest, {
        foreignKey: 'current_guest_id',
        as: 'guest',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });

      // Room has many RoomOccupyRooms (through room_occupy_rooms table)
      Room.hasMany(models.RoomOccupyRooms, {
        foreignKey: 'room_id',
        as: 'roomOccupancies',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      // Room belongs to many RoomOccupy through RoomOccupyRooms
      Room.belongsToMany(models.RoomOccupy, {
        through: models.RoomOccupyRooms,
        foreignKey: 'room_id',
        otherKey: 'occupy_id',
        as: 'occupancies',
      });

      // Room has many RoomBookings
      Room.hasMany(models.RoomBooking, {
        foreignKey: 'room_id',
        as: 'bookings',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  Room.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      room_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len: [1, 20],
        },
      },
      status: {
        type: DataTypes.ENUM('available', 'occupied', 'maintenance', 'reserved'),
        allowNull: false,
        defaultValue: 'available',
      },
      current_guest_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'guests',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      room_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      floor: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      check_in_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      check_out_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      room_service_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 2,
      },
      amenities: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price_per_night: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00,
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
      modelName: 'Room',
      tableName: 'rooms',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      underscored: true,
      indexes: [
        { fields: ['room_number'], unique: true },
        { fields: ['status'] },
        { fields: ['room_type'] },
        { fields: ['floor'] },
      ],
    }
  );

  return Room;
};