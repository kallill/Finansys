import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

class CreditCard extends Model {
  public id!: number;
  public name!: string; // ex: Nubank, Itau
  public limit!: number; 
  public closingDay!: number; // ex: 25
  public dueDay!: number; // ex: 05
  public userId!: number;
}

CreditCard.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  limit: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  closingDay: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  dueDay: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'CreditCards',
});

// Relationships
User.hasMany(CreditCard, { foreignKey: 'userId', as: 'creditCards' });
CreditCard.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default CreditCard;
