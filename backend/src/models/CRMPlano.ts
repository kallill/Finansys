import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class CRMPlano extends Model {
  public id!: string;
  public nome!: string;
  public valor!: number;
  public recursos_inclusos!: any; // JSON
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CRMPlano.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  valor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  recursos_inclusos: {
    type: DataTypes.JSON,
    allowNull: true,
  }
}, {
  sequelize,
  tableName: 'CRMPlanos',
});

export default CRMPlano;