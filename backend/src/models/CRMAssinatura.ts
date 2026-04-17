import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class CRMAssinatura extends Model {
  public id!: string;
  public cliente_id!: string;
  public plano_id!: string;
  public data_vencimento!: Date;
  public status_pagamento!: 'Pago' | 'Pendente' | 'Atrasado';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CRMAssinatura.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  cliente_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  plano_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  data_vencimento: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status_pagamento: {
    type: DataTypes.ENUM('Pago', 'Pendente', 'Atrasado'),
    defaultValue: 'Pendente',
  }
}, {
  sequelize,
  tableName: 'CRMAssinaturas',
});

export default CRMAssinatura;