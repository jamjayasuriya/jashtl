// models/ProformaInvoice.js
module.exports = (sequelize, DataTypes) => {
  const ProformaInvoice = sequelize.define('ProformaInvoice', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    invoice_no: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    guest_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    room_number: { type: DataTypes.STRING(10), allowNull: true },
    
    event_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    issue_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW, // Can be overridden in the API logic
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    bill_discount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    service_charge: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    gratuity: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    final_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('draft', 'issued', 'fulfilled', 'cancelled'),
      defaultValue: 'draft',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW,
    },
  }, {
    tableName: 'proforma_invoices',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['id'], unique: true }, // Primary key index
      { fields: ['invoice_no'], unique: true }, // Unique index for invoice_no
      { fields: ['guest_id'], unique: false }, // Foreign key index
    ],
  });

  ProformaInvoice.associate = (models) => {
    // Association with Guest model
    ProformaInvoice.belongsTo(models.Guest, {
      foreignKey: 'guest_id',
      as: 'guest',
      onDelete: 'RESTRICT',
      constraints: false,
    });

    // Association with ProformaInvoiceItem model
    ProformaInvoice.hasMany(models.ProformaInvoiceItem, {
      foreignKey: 'proforma_invoice_id',
      as: 'items',
      onDelete: 'CASCADE',
      constraints: false,
    });

    // Optional association with Event model (if implemented)
    // ProformaInvoice.belongsTo(models.Event, {
    //   foreignKey: 'event_id',
    //   as: 'event',
    //   onDelete: 'SET NULL',
    //   constraints: false,
    // });
  };

  return ProformaInvoice;
};