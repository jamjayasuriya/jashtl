const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const PurchaseReturnItem = sequelize.define('PurchaseReturnItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    purchase_return_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'purchase_returns', key: 'id' },
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'products', key: 'id' },
    },
    quantity_returned: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  }, {
    tableName: 'purchase_return_items',
    timestamps: true,
    indexes: [
      { fields: ['id'], unique: true }, // Primary key index
      { fields: ['purchase_return_id'], unique: false }, // Foreign key index
      { fields: ['product_id'], unique: false }, // Foreign key index
    ],
  });

  PurchaseReturnItem.associate = (models) => {
    PurchaseReturnItem.belongsTo(models.PurchaseReturn, { foreignKey: 'purchase_return_id', as: 'purchaseReturn', constraints: false });
    PurchaseReturnItem.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product', constraints: false });
  };

  return PurchaseReturnItem;
};