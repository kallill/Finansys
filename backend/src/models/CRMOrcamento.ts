import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class CRMOrcamento extends Model {
  public id!: number;
  public cliente_id!: number | null;
  public empresa_nome!: string;
  public preparado_por!: string;
  public total_tabela!: number;
  public total_ofertado!: number;
  public status!: 'rascunho' | 'enviado' | 'aprovado' | 'rejeitado';
  public itens!: any;
  public is_template!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CRMOrcamento.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  cliente_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  empresa_nome: {

    type: DataTypes.STRING,
    allowNull: false,
  },
  preparado_por: {
    type: DataTypes.STRING,
    defaultValue: 'Cerasus',
  },
  total_tabela: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  total_ofertado: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('rascunho', 'enviado', 'aprovado', 'rejeitado'),
    defaultValue: 'rascunho',
  },
  itens: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  is_template: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, {
  sequelize,
  tableName: 'CRM_Orcamentos',
});

export default CRMOrcamento;
