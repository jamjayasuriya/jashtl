'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Purchase extends Model {
    static associate(models) {
      Purchase.belongsTo(models.Supplier, { as: 'supplier', foreignKey: 'supplier_id', constraints: false });
      Purchase.hasMany(models.PurchaseItem, { as: 'items', foreignKey: 'purchase_id', constraints: false });
      Purchase.hasMany(models.PurchaseReturn, { as: 'returns', foreignKey: 'purchase_id', constraints: false });
    }
  }

  Purchase.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    grn_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    invoice_no: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    supplier_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Suppliers', key: 'id' },
    },
    purchase_type: {
      type: DataTypes.ENUM('cash', 'credit'),
      allowNull: false,
    },
    payment_type: {
      type: DataTypes.ENUM('cash', 'cheque', 'bank_transfer'),
      allowNull: true,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    bill_discount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    bill_discount_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
    final_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    purchase_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    remarks: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'partially_returned', 'returned'),
      allowNull: false,
      defaultValue: 'active',
    },
  }, {
    sequelize,
    modelName: 'Purchase',
    tableName: 'purchases',
    timestamps: true,
    hooks: {
      afterCreate: async (purchase, options) => {
        if (purchase.purchase_type === 'credit') {
          const transaction = options.transaction || (await sequelize.transaction());
          try {
            const [supplierDue, created] = await sequelize.models.SupplierDues.findOrCreate({
              where: { supplier_id: purchase.supplier_id },
              defaults: {
                supplier_id: purchase.supplier_id,
                amount_due: parseFloat(purchase.final_amount),
                last_updated: new Date(),
              },
              transaction,
            });

            if (!created) {
              supplierDue.amount_due = parseFloat(supplierDue.amount_due) + parseFloat(purchase.final_amount);
              supplierDue.last_updated = new Date();
              await supplierDue.save({ transaction });
            }

            if (!options.transaction) {
              await transaction.commit();
            }
          } catch (error) {
            if (!options.transaction) {
              await transaction.rollback();
            }
            console.error('afterCreate hook error:', error);
            throw new Error(`Failed to update SupplierDues: ${error.message}`);
          }
        }
      },
      afterUpdate: async (purchase, options) => {
        const transaction = options.transaction || (await sequelize.transaction());
        try {
          const previousPurchaseType = purchase.previous('purchase_type');
          const previousFinalAmount = parseFloat(purchase.previous('final_amount') || 0);
          const newFinalAmount = parseFloat(purchase.final_amount || 0);

          console.log('afterUpdate - purchase data:', {
            previousPurchaseType,
            purchase_type: purchase.purchase_type,
            previousFinalAmount,
            newFinalAmount,
            final_amount_raw: purchase.final_amount,
          });

          if (isNaN(previousFinalAmount) || isNaN(newFinalAmount)) {
            throw new Error(`Invalid final_amount values: previous=${previousFinalAmount}, new=${newFinalAmount}`);
          }

          let supplierDue = await sequelize.models.SupplierDues.findOne({
            where: { supplier_id: purchase.supplier_id },
            transaction,
          });

          console.log('SupplierDues found:', supplierDue ? supplierDue.toJSON() : 'Not found');

          if (previousPurchaseType !== 'credit' && purchase.purchase_type === 'credit') {
            if (!supplierDue) {
              supplierDue = await sequelize.models.SupplierDues.create(
                {
                  supplier_id: purchase.supplier_id,
                  amount_due: newFinalAmount || 0,
                  last_updated: new Date(),
                },
                { transaction }
              );
            } else {
              const currentAmountDue = parseFloat(supplierDue.amount_due) || 0;
              supplierDue.amount_due = currentAmountDue + newFinalAmount;
              supplierDue.last_updated = new Date();
              await supplierDue.save({ transaction });
            }
          } else if (previousPurchaseType === 'credit' && purchase.purchase_type !== 'credit') {
            if (supplierDue) {
              const currentAmountDue = parseFloat(supplierDue.amount_due) || 0;
              supplierDue.amount_due = currentAmountDue - previousFinalAmount;
              supplierDue.last_updated = new Date();
              if (supplierDue.amount_due <= 0) {
                await supplierDue.destroy({ transaction });
              } else {
                await supplierDue.save({ transaction });
              }
            }
          } else if (purchase.purchase_type === 'credit') {
            if (supplierDue) {
              const currentAmountDue = parseFloat(supplierDue.amount_due) || 0;
              const amountDifference = newFinalAmount - previousFinalAmount;
              supplierDue.amount_due = currentAmountDue + amountDifference;
              supplierDue.last_updated = new Date();
              if (supplierDue.amount_due <= 0) {
                await supplierDue.destroy({ transaction });
              } else {
                await supplierDue.save({ transaction });
              }
            } else {
              await sequelize.models.SupplierDues.create(
                {
                  supplier_id: purchase.supplier_id,
                  amount_due: newFinalAmount || 0,
                  last_updated: new Date(),
                },
                { transaction }
              );
            }
          }

          if (!options.transaction) {
            await transaction.commit();
          }
        } catch (error) {
          if (!options.transaction) {
            await transaction.rollback();
          }
          console.error('afterUpdate hook error:', error);
          throw new Error(`Failed to update SupplierDues: ${error.message}`);
        }
      },
    },
    indexes: [
      { fields: ['id'], unique: true }, // Primary key index
      { fields: ['grn_number'], unique: true }, // Unique index for grn_number
      { fields: ['invoice_no'], unique: true }, // Unique index for invoice_no
      { fields: ['supplier_id'], unique: false }, // Foreign key index
    ],
  });

  return Purchase;
};