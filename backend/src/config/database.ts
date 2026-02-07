import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });

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
    dialectOptions: {
      options: {
        encrypt: true,
        trustServerCertificate: false
      }
    },
    logging: false
  });
}

export default sequelize;
