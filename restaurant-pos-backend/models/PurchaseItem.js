const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const PurchaseItem = sequelize.define('PurchaseItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    purchase_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'purchases', key: 'id' },
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'products', key: 'id' },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    purchasing_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    item_discount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    item_discount_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
  }, {
    tableName: 'purchase_items',
    timestamps: false,
    indexes: [
      { fields: ['id'], unique: true }, // Primary key index
      { fields: ['purchase_id'], unique: false }, // Foreign key index
      { fields: ['product_id'], unique: false }, // Foreign key index
    ],
  });

  PurchaseItem.associate = (models) => {
    PurchaseItem.belongsTo(models.Purchase, { foreignKey: 'purchase_id', as: 'purchase', constraints: false });
    PurchaseItem.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product', constraints: false });
  };

  return PurchaseItem;
};