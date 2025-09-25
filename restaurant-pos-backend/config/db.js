const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  retry: {
    match: [
      /SQLITE_BUSY/,
      /SQLITE_LOCKED/,
      /database is locked/
    ],
    max: 3
  },
  dialectOptions: {
    // SQLite specific options
    timeout: 30000,
    retry: {
      match: [
        /SQLITE_BUSY/,
        /SQLITE_LOCKED/,
        /database is locked/
      ],
      max: 3
    }
  }
});

module.exports = sequelize;