const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const PurchaseReturn = sequelize.define('PurchaseReturn', {
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
    invoice_no: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    return_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'purchase_returns',
    timestamps: true,
    indexes: [
      { fields: ['id'], unique: true }, // Primary key index
      { fields: ['purchase_id'], unique: false }, // Foreign key index
    ],
  });

  PurchaseReturn.associate = (models) => {
    PurchaseReturn.belongsTo(models.Purchase, { foreignKey: 'purchase_id', as: 'purchase', constraints: false });
    PurchaseReturn.hasMany(models.PurchaseReturnItem, { foreignKey: 'purchase_return_id', as: 'items', constraints: false });
  };

  return PurchaseReturn;
};