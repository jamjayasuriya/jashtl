const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CustomerDues = sequelize.define(
    'CustomerDues',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'customers',
          key: 'id',
        },
      },
      sale_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'sales',
          key: 'id',
        },
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
    },
    {
      tableName: 'customer_dues',
      timestamps: false,
      indexes: [
        { fields: ['id'], unique: true }, // Primary key index
        { fields: ['customer_id'], unique: false }, // Foreign key index
        { fields: ['sale_id'], unique: false }, // Foreign key index
      ],
    }
  );

  CustomerDues.associate = (models) => {
    CustomerDues.belongsTo(models.Customer, { as: 'customer', foreignKey: 'customer_id', constraints: false });
    CustomerDues.belongsTo(models.Sale, { as: 'sale', foreignKey: 'sale_id', constraints: false });
  };

  return CustomerDues;
};