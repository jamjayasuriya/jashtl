const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Customer extends Model {
    static associate(models) {
      // Customer has many Orders
      Customer.hasMany(models.Order, {
        foreignKey: 'customer_id',
        as: 'orders',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });

      // Customer has many TableBookings
      Customer.hasMany(models.TableBooking, {
        foreignKey: 'customer_id',
        as: 'tableBookings',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      // Customer has many RoomBookings
      Customer.hasMany(models.RoomBooking, {
        foreignKey: 'customer_id',
        as: 'roomBookings',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  Customer.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false, // Removed unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true, // Keep unique on email
      validate: {
        isEmail: { msg: 'Please enter a valid email address' },
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: {
          args: /^[0-9+\-\s()]*$/,
          msg: 'Please enter a valid phone number',
        },
      },
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    dues: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
  }, {
    sequelize,
    tableName: 'customers',
    timestamps: true,
  });

  Customer.associate = (models) => {
    Customer.hasMany(models.Sale, { foreignKey: 'customer_id' });
    Customer.hasMany(models.CustomerDues, { foreignKey: 'customer_id', as: 'customerDues' });
  };

  return Customer;
};