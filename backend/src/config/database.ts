import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

// Fix path to find .env in root of backend folder (../../ from src/config)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const dbDialect = process.env.DB_DIALECT || 'mssql';
const dbName    = process.env.DB_NAME     || 'FinansysDB';
const dbUser    = process.env.DB_USER     || 'user';
const dbHost    = process.env.DB_HOST     || 'localhost';
const dbPassword = process.env.DB_PASS   || 'password';

const retryMatch = [
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
];

let sequelize: Sequelize;

if (dbDialect === 'sqlite') {
  // Modo desenvolvimento local com SQLite
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.resolve(process.cwd(), 'backend/dev.sqlite'),
    logging: false
  });

} else if (dbDialect === 'postgres') {
  // Modo produÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o com PostgreSQL (Docker/VPS)
  sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    dialect: 'postgres',
    port: Number(process.env.DB_PORT) || 5432,
    pool: { max: 5, min: 0, acquire: 60000, idle: 10000 },
    dialectOptions: {},  // Sem opÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âµes MSSQL ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â pg nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o aceita o objeto "options"
    logging: false,
    retry: { match: retryMatch, max: 3 }
  });

} else {
  // Modo MSSQL / Azure SQL
  sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    dialect: 'mssql',
    pool: { max: 5, min: 0, acquire: 60000, idle: 10000 },
    dialectOptions: {
      options: {
        encrypt: true,
        trustServerCertificate: true, // Permite certs auto-assinados no Azure/VPS
        requestTimeout: 60000,
        connectTimeout: 60000
      }
    },
    logging: false,
    retry: { match: retryMatch, max: 3 }
  });
}

export default sequelize;