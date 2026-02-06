import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dbName = process.env.DB_NAME || 'FinansysDB';
const dbUser = process.env.DB_USER || 'user';
const dbHost = process.env.DB_HOST || 'dksystem.database.windows.net';
const dbPassword = process.env.DB_PASS || 'password';

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  dialect: 'mssql',
  dialectOptions: {
    options: {
      encrypt: true, // Required for Azure SQL
      trustServerCertificate: false // Change to true if using self-signed certs
    }
  },
  logging: false
});

export default sequelize;
