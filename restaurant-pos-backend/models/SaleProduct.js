const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const SaleProduct = sequelize.define('SaleProduct', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sale_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'sales',
        key: 'id',
      },
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    item_discount: {
      type: DataTypes.DECIMAL(10, 2), // Store as Rs.
      defaultValue: 0,
    },
    item_discount_percentage: {
      type: DataTypes.DECIMAL(5, 2), // Store the percentage for reference
      defaultValue: 0,
    },
    item_total: {
      type: DataTypes.DECIMAL(10, 2), // Store quantity * price
      allowNull: false,
      defaultValue: 0.00,
    },
  }, {
    tableName: 'sale_products',
    timestamps: false,
    indexes: [
      { fields: ['id'], unique: true }, // Primary key index
      { fields: ['sale_id'], unique: false }, // Foreign key index
      { fields: ['product_id'], unique: false }, // Foreign key index
    ],
  });

  // Define associations
  SaleProduct.associate = (models) => {
    SaleProduct.belongsTo(models.Sale, { as: 'sale', foreignKey: 'sale_id', constraints: false });
    SaleProduct.belongsTo(models.Product, { as: 'product', foreignKey: 'product_id', constraints: false });
  };

  return SaleProduct;
};