const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Sale = sequelize.define(
    'Sale',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'customers',
          key: 'id',
        },
      },
      total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      item_discount: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
      },
      cart_discount: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
      },
      tax_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
      },
      total_except_credit: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      paid_bycash: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
      },
      paid_bycheque: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
      },
      paid_bycard: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
      },
      paid_byvoucher: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
      },
      paid_bygiftcard: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
      },
      on_credit: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      cart_discount_type: {
        type: DataTypes.ENUM('percentage', 'fixed'),
        defaultValue: 'percentage',
      },
      tax_rate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
      },
    },
    {
      tableName: 'sales',
      timestamps: true,
      indexes: [
        { fields: ['id'], unique: true }, // Primary key index
        { fields: ['customer_id'], unique: false }, // Foreign key index
      ],
    }
  );

  Sale.associate = (models) => {
    Sale.hasMany(models.SaleProduct, { as: 'saleProducts', foreignKey: 'sale_id', constraints: false });
    Sale.hasMany(models.SalePayment, { as: 'salePayments', foreignKey: 'sale_id', constraints: false });
    Sale.belongsTo(models.Customer, { as: 'customer', foreignKey: 'customer_id', constraints: false });
    Sale.hasMany(models.CustomerDues, { as: 'customerDues', foreignKey: 'sale_id', constraints: false });
    Sale.hasMany(models.Receipt, { as: 'receipts', foreignKey: 'sale_id', constraints: false });
    Sale.belongsTo(models.User, { foreignKey: 'user_id', as: 'user', constraints: false });
  };

  return Sale;
};