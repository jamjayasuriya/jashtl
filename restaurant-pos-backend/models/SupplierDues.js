const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const SupplierDues = sequelize.define('SupplierDues', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    supplier_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'suppliers', key: 'id' },
    },
    amount_due: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    last_updated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'supplier_dues',
    timestamps: false,
  });

  SupplierDues.associate = (models) => {
    SupplierDues.belongsTo(models.Supplier, { foreignKey: 'supplier_id', as: 'supplier' });
  };

  return SupplierDues;
};