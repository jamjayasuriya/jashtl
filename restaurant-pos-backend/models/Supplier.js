const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Supplier = sequelize.define('Supplier', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contact: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'suppliers',
    timestamps: true,
    indexes: [
      { fields: ['id'], unique: true }, // Primary key index
    ],
  });

  Supplier.associate = (models) => {
    Supplier.hasMany(models.Purchase, { foreignKey: 'supplier_id', as: 'purchases', constraints: false });
    Supplier.hasMany(models.SupplierDues, { foreignKey: 'supplier_id', as: 'dues', constraints: false });
  };

  return Supplier;
};