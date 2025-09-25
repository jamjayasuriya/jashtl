// backend/models/TableBooking.js
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class TableBooking extends Model {
    static associate(models) {
      // TableBooking belongs to Table
      TableBooking.belongsTo(models.Table, {
        foreignKey: 'table_id',
        as: 'table'
      });

      // TableBooking belongs to Customer
      TableBooking.belongsTo(models.Customer, {
        foreignKey: 'customer_id',
        as: 'customer'
      });

      // TableBooking belongs to User (created by)
      TableBooking.belongsTo(models.User, {
        foreignKey: 'created_by',
        as: 'creator'
      });
    }
  }

  TableBooking.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    table_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tables',
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
    booking_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 120, // Duration in minutes
      comment: 'Duration in minutes'
    },
    party_size: {
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
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'),
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
    }
  }, {
    sequelize,
    modelName: 'TableBooking',
    tableName: 'table_bookings',
    timestamps: true,
    indexes: [
      { fields: ['table_id'] },
      { fields: ['customer_id'] },
      { fields: ['booking_date'] },
      { fields: ['status'] },
      { fields: ['created_by'] },
      { 
        fields: ['table_id', 'booking_date', 'end_date'],
        name: 'table_booking_time_index'
      }
    ]
  });

  return TableBooking;
};
