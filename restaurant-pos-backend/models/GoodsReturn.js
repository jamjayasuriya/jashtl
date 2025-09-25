'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class GoodsReturn extends Model {
    static associate(models) {
      GoodsReturn.belongsTo(models.Purchase, {
        foreignKey: 'purchase_id',
        as: 'purchase',
        constraints: false,
      });
      GoodsReturn.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product',
        constraints: false,
      });
    }
  }

  GoodsReturn.init(
    {
      purchase_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Purchases',
          key: 'id',
        },
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Products',
          key: 'id',
        },
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      reason: {
        type: DataTypes.STRING,
      },
      return_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'GoodsReturn',
      tableName: 'goods_returns',
      indexes: [
        { fields: ['id'], unique: true }, // Primary key index (auto-incremented)
        { fields: ['purchase_id'], unique: false }, // Foreign key index
        { fields: ['product_id'], unique: false }, // Foreign key index
      ],
    }
  );

  return GoodsReturn;
};