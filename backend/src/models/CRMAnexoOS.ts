import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class CRMAnexoOS extends Model {
  public id!: string;
  public os_id!: string;
  public url_arquivo!: string;
  public tipo!: 'imagem' | 'pdf';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CRMAnexoOS.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  os_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  url_arquivo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tipo: {
    type: DataTypes.ENUM('imagem', 'pdf'),
    allowNull: false,
    defaultValue: 'imagem'
  }
}, {
  sequelize,
  tableName: 'CRMAnexosOS',
});

export default CRMAnexoOS;