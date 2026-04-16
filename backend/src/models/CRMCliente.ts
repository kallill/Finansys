import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class CRMCliente extends Model {
  public id!: string;
  public nome_razao_social!: string;
  public cnpj_cpf!: string;
  public contato!: string;
  public status!: 'Prospect' | 'Ativo' | 'Inativo';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CRMCliente.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nome_razao_social: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cnpj_cpf: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  contato: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Prospect', 'Ativo', 'Inativo'),
    defaultValue: 'Prospect',
  }
}, {
  sequelize,
  tableName: 'CRMClientes',
});

export default CRMCliente;
