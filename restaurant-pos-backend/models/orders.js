// restaurant-pos-backend/models/order.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    order_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Customers', // Name of the Customers table
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // Or 'CASCADE' depending on your requirements
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true, // Should be true if a guest or anonymous user can create an order, or SET NULL
      references: {
        model: 'Users', // Name of the Users table
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    cart_discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    cart_discount_type: {
      type: DataTypes.ENUM('percentage', 'amount'),
      allowNull: false,
      defaultValue: 'percentage',
    },
    tax_amount: { // This is the calculated tax amount
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    tax_rate: { // This is the percentage tax rate
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    status: {
      type: DataTypes.ENUM('pending', 'held', 'settled', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    table_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tables',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    room_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'rooms',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    order_type: {
      type: DataTypes.ENUM('dine_in', 'takeaway', 'room_service', 'delivery'),
      allowNull: false,
      defaultValue: 'dine_in',
    },
    is_kot_sent: { // <-- NEW FIELD ADDED HERE
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    timestamps: false, // Manage timestamps manually if needed, or set true for createdAt/updatedAt
    createdAt: 'created_at', // Map to your column name if timestamps is true
    updatedAt: 'updated_at', // Map to your column name if timestamps is true
    tableName: 'orders', // Ensure this matches your table name
    underscored: true, // Use snake_case for column names in the database
  });

  Order.associate = function(models) {
    Order.belongsTo(models.Customer, { foreignKey: 'customer_id', as: 'customer' });
    Order.belongsTo(models.User, { foreignKey: 'created_by', as: 'creator' });
    Order.belongsTo(models.Table, { foreignKey: 'table_id', as: 'table' });
    Order.belongsTo(models.Room, { foreignKey: 'room_id', as: 'room' });
    Order.hasMany(models.OrderItem, { foreignKey: 'order_id', as: 'items' });
    // Add association to KotBot if one Order can have multiple KotBots
    Order.hasMany(models.KotBot, { foreignKey: 'order_id', as: 'kotBots' });
    // Add association to Payment
    Order.hasMany(models.Payment, { foreignKey: 'order_id', as: 'payments' });
  };

  return Order;
};
