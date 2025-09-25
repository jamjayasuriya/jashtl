// restaurant-pos-backend/models/orderitem.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define('OrderItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Orders', // Name of the Orders table
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Products', // Name of the Products table
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    name: { // Product name at the time of order
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    price: { // Price per unit at the time of order
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    item_discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    item_discount_type: {
      type: DataTypes.ENUM('percentage', 'amount'),
      allowNull: false,
      defaultValue: 'percentage',
    },
    item_total: { // Calculated total for this item line (price * quantity - item_discount)
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    instructions: { // <-- NEW FIELD ADDED HERE
      type: DataTypes.STRING,
      allowNull: true, // Allow null if no instructions are given
      defaultValue: '', // Default to an empty string
    },
    is_kot_selected: { // <-- NEW FIELD ADDED HERE (Ensure this is also present if not already)
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
    timestamps: false, // Set to true if you want Sequelize to manage createdAt/updatedAt automatically
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    tableName: 'order_items', // Ensure this matches your table name
    underscored: true, // Use snake_case for column names in the database
  });

  OrderItem.associate = function(models) {
    OrderItem.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
    OrderItem.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
  };

  return OrderItem;
};
