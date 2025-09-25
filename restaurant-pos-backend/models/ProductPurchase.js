module.exports = (sequelize, DataTypes) => {
  const ProductPurchase = sequelize.define('ProductPurchase', {
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
    purchasing_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    purchase_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'product_purchases',
    timestamps: false,
    indexes: [
      { fields: ['id'], unique: true }, // Primary key index
      { fields: ['product_id'], unique: false }, // Foreign key index
    ],
  });

  ProductPurchase.associate = (models) => {
    ProductPurchase.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product', constraints: false });
  };

  return ProductPurchase;
};