// backend/models/kotbotitem.js
module.exports = (sequelize, DataTypes) => {
  const KotBotItem = sequelize.define('KotBotItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    kot_bot_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'kot_bot', // 'kot_bot' refers to table name
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE', // If parent KotBot is deleted, delete its items
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products', // 'products' refers to table name
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT', // Prevent deleting product if it's part of a KOT/BOT item
    },
    name: { // Denormalized product name for historical record on KOT/BOT
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    instructions: { // Specific instructions for this item on the KOT/BOT
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: '',
    },
  }, {
    tableName: 'kot_bot_items', // Match your SQL table name
    timestamps: true,
    createdAt: 'created_at', // Match your SQL column names
    updatedAt: 'updated_at', // Match your SQL column names
  });

  KotBotItem.associate = (models) => {
    KotBotItem.belongsTo(models.KotBot, { foreignKey: 'kot_bot_id', as: 'kotBot' });
    KotBotItem.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
  };

  return KotBotItem;
};
