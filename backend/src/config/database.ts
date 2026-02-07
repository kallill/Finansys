import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

// Fix path to find .env in root of backend folder (../../ from src/config)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const dbDialect = process.env.DB_DIALECT || 'mssql';
const dbName = process.env.DB_NAME || 'FinansysDB';
const dbUser = process.env.DB_USER || 'user';
const dbHost = process.env.DB_HOST || 'dksystem.database.windows.net';
const dbPassword = process.env.DB_PASS || 'password';

let sequelize: Sequelize;
if (dbDialect === 'sqlite') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.resolve(process.cwd(), 'backend/dev.sqlite'),
    logging: false
  });
} else {
  sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    dialect: 'mssql',
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,
      idle: 10000
    },
    dialectOptions: {
      options: {
        encrypt: true,
        trustServerCertificate: true, // Allow self-signed/Azure certs on VPS
        requestTimeout: 60000,
        connectTimeout: 60000
      }
    },
    logging: false,
    retry: {
      match: [
        /ETIMEOUT/,
        /EHOSTUNREACH/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /ETIMEDOUT/,
        /ESOCKETTIMEDOUT/,
        /EHOSTDOWN/,
        /EPIPE/,
        /EAI_AGAIN/,
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/
      ],
      max: 3
    }
  });
}

export default sequelize;
