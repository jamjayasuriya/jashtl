const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Guest = sequelize.define('Guest', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    phone_no: {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: true,
      validate: {
        is: {
          args: /^[0-9+\-\s()]*$/,
          msg: 'Please enter a valid phone number',
        },
      },
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: 'Please enter a valid email address' },
      },
    },
    gender: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    postcode: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    booking_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
    },
  }, {
    tableName: 'guests',
    timestamps: false, // Override to use custom created_at and updated_at
  });

  Guest.associate = (models) => {
    // Guest has many rooms (current room)
    Guest.hasMany(models.Room, {
      foreignKey: 'current_guest_id',
      as: 'rooms',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    // Guest has many room occupancies
    Guest.hasMany(models.RoomOccupy, {
      foreignKey: 'guest_id',
      as: 'roomOccupancies',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Optional association with bookings if created later
    if (models.Booking) {
      Guest.belongsTo(models.Booking, { foreignKey: 'booking_id', as: 'booking' });
    }
    // Potential association with Sales or Transactions (to be defined later)
    // if (models.Sale) {
    //   Guest.hasMany(models.Sale, { foreignKey: 'guest_id' });
    // }
  };

  return Guest;
};