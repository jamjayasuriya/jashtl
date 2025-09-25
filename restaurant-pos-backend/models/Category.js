module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'categories',
    timestamps: false,
    indexes: [
      { fields: ['id'], unique: true }, // Primary key index
    ],
  });

  Category.associate = (models) => {
    Category.hasMany(models.Product, { foreignKey: 'category_id', as: 'products', constraints: false });
  };

  return Category;
};