import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class CRMAdmin extends Model {
  public id!: string;
  public nome!: string;
  public email!: string;
  public senha_hash!: string;
  public nivel_acesso!: 'Admin' | 'Standard';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CRMAdmin.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  senha_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nivel_acesso: {
    type: DataTypes.ENUM('Admin', 'Standard'),
    defaultValue: 'Standard',
  }
}, {
  sequelize,
  tableName: 'CRMAdmins',
});

export default CRMAdmin;
