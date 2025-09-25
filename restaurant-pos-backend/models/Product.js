'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      // Existing associations - PRESERVED
      Product.belongsTo(models.Category, { as: 'category', foreignKey: 'category_id', constraints: false });
      Product.hasMany(models.ProductPurchase, { as: 'purchases', foreignKey: 'product_id', constraints: false });
      Product.hasMany(models.SaleProduct, { as: 'sales', foreignKey: 'product_id', constraints: false });
      Product.hasMany(models.PurchaseItem, { as: 'purchaseItems', foreignKey: 'product_id', constraints: false });
      Product.hasMany(models.PurchaseReturnItem, { as: 'purchaseReturnItems', foreignKey: 'product_id', constraints: false });
      Product.hasMany(models.StockAdjustment, { as: 'stockAdjustments', foreignKey: 'product_id', constraints: false });

      // NEW: Association with OrderItem (crucial for linking products to specific order items)
      // Assuming OrderItem model exists and has a 'product_id' foreign key.
      Product.hasMany(models.OrderItem, { foreignKey: 'product_id', constraints: false });

      // NEW: Association with KotBotItem
      Product.hasMany(models.KotBotItem, { foreignKey: 'product_id', constraints: false }); // Maintain consistency with other constraints
    }
  }

  Product.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    image_path: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Changed to allow null for products without categories
      references: {
        model: 'Categories', // Using 'Categories' as per your existing code
        key: 'id',
      },
    },
    // NEW: preparation_area field
    preparation_area: {
      type: DataTypes.ENUM('kitchen', 'bar'),
      allowNull: true, // Can be NULL for retail items
      defaultValue: null,
    },
    // Additional fields from frontend
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    barcode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    min_stock_level: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
    },
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'products', // Explicitly define tableName as your SQL script uses 'products'
    timestamps: true,
    indexes: [
      { fields: ['id'], unique: true }, // Primary key index
      { fields: ['category_id'], unique: false }, // Foreign key index
      // Consider adding an index for 'preparation_area' if you'll query by it often
      { fields: ['preparation_area'], unique: false },
    ],
  });

  return Product;
};
