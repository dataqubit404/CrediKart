require('dotenv').config();
const { Sequelize } = require('sequelize');

const isProduction = process.env.NODE_ENV === 'production';

const sequelize = process.env.DATABASE_URL 
  ? new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: isProduction ? false : console.log,
    dialectOptions: {
      ssl: isProduction ? {
        require: true,
        rejectUnauthorized: false,
      } : false,
    },
  })
  : new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: isProduction ? false : console.log,
      dialectOptions: {
        ssl: isProduction ? {
          require: true,
          rejectUnauthorized: false,
        } : false,
      },
    pool: {
      max: isProduction ? 20 : 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
    },
  }
);

module.exports = sequelize;
