// backend/models/RoomBooking.js
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class RoomBooking extends Model {
    static associate(models) {
      // RoomBooking belongs to Room
      RoomBooking.belongsTo(models.Room, {
        foreignKey: 'room_id',
        as: 'room'
      });

      // RoomBooking belongs to Customer
      RoomBooking.belongsTo(models.Customer, {
        foreignKey: 'customer_id',
        as: 'customer'
      });

      // RoomBooking belongs to User (created by)
      RoomBooking.belongsTo(models.User, {
        foreignKey: 'created_by',
        as: 'creator'
      });
    }
  }

  RoomBooking.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    room_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'rooms',
        key: 'id'
      }
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'customers',
        key: 'id'
      }
    },
    check_in_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    check_out_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Duration in days'
    },
    guests: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    special_requests: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    contact_phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    contact_email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    room_service_preferences: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON string of room service preferences'
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'),
      allowNull: false,
      defaultValue: 'pending'
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0
    },
    paid_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'RoomBooking',
    tableName: 'room_bookings',
    timestamps: true,
    indexes: [
      { fields: ['room_id'] },
      { fields: ['customer_id'] },
      { fields: ['check_in_date'] },
      { fields: ['status'] },
      { fields: ['created_by'] },
      { 
        fields: ['room_id', 'check_in_date', 'check_out_date'],
        name: 'room_booking_dates_index'
      }
    ]
  });

  return RoomBooking;
};
