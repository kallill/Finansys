import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class CRMOrdemServico extends Model {
  public id!: string;
  public cliente_id!: string;
  public descricao!: string;
  public data_inicio!: Date;
  public data_conclusao!: Date | null;
  public status!: 'Aberta' | 'Em Andamento' | 'ConcluÃ­da';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CRMOrdemServico.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  cliente_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  data_inicio: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  data_conclusao: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Aberta', 'Em Andamento', 'ConcluÃ­da'),
    defaultValue: 'Aberta',
  }
}, {
  sequelize,
  tableName: 'CRMOrdemServicos',
});

export default CRMOrdemServico;
