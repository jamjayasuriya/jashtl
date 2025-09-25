// models/ProformaInvoiceItem.js
module.exports = (sequelize, DataTypes) => {
  const ProformaInvoiceItem = sequelize.define('ProformaInvoiceItem', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    proforma_invoice_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    item_discount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    preparation_time: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    line_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'proforma_invoice_items',
    timestamps: false, // Only created_at is needed, no updates
    indexes: [
      { fields: ['id'], unique: true }, // Primary key index
      { fields: ['proforma_invoice_id'], unique: false }, // Foreign key index
      { fields: ['product_id'], unique: false }, // Foreign key index
    ],
  });

  ProformaInvoiceItem.associate = (models) => {
    // Association with ProformaInvoice model
    ProformaInvoiceItem.belongsTo(models.ProformaInvoice, {
      foreignKey: 'proforma_invoice_id',
      as: 'invoice',
      onDelete: 'CASCADE',
      constraints: false,
    });

    // Association with Product model
    ProformaInvoiceItem.belongsTo(models.Product, {
      foreignKey: 'product_id',
      as: 'product',
      onDelete: 'RESTRICT',
      constraints: false,
    });
  };

  return ProformaInvoiceItem;
};