const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const StockAdjustment = sequelize.define('StockAdjustment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
    adjustment_type: {
      type: DataTypes.ENUM('count', 'discarding'),
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    adjustment_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'stock_adjustments',
    timestamps: false,
    indexes: [
      { fields: ['id'], unique: true }, // Primary key index
      { fields: ['product_id'], unique: false }, // Foreign key index
    ],
  });

  StockAdjustment.associate = (models) => {
    StockAdjustment.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product', constraints: false });
  };

  return StockAdjustment;
};