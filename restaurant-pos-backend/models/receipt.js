const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Receipt = sequelize.define(
    'Receipt',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      sale_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'sales',
          key: 'id',
        },
      },
      receipt_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
        //unique: true,
      },
      type: {
        type: DataTypes.ENUM('receipt', 'invoice'),
        allowNull: false,
        defaultValue: 'receipt',
      },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'customers',
          key: 'id',
        },
      },
      user_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: 'Unknown',
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      cart_discount: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      cart_discount_type: {
        type: DataTypes.ENUM('percentage', 'fixed'),
        allowNull: false,
        defaultValue: 'percentage',
      },
      tax_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      tax_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      total_paid: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      dues: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      presented_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'receipts',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
      indexes: [
        { fields: ['id'], unique: true }, // Primary key index
        { fields: ['sale_id'], unique: false }, // Foreign key index
        { fields: ['customer_id'], unique: false }, // Foreign key index
      ],
    }
  );

  Receipt.associate = (models) => {
    Receipt.belongsTo(models.Sale, { foreignKey: 'sale_id', as: 'sale', constraints: false });
    Receipt.belongsTo(models.Customer, { foreignKey: 'customer_id', as: 'customer', constraints: false });
  };

  return Receipt;
};