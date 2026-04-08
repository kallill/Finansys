import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import CreditCard from './CreditCard';

class Transaction extends Model {
  public id!: number;
  public description!: string;
  public amount!: number;
  public type!: 'income' | 'expense';
  public category!: string;
  public date!: Date;
  public userId!: number;
  public status!: 'paid' | 'pending';
  public dueDate!: Date;
  public creditCardId!: number | null;
}

Transaction.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('income', 'expense'),
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  status: {
    type: DataTypes.ENUM('paid', 'pending'),
    allowNull: false,
    defaultValue: 'paid', // Retro-compatibilidade com dados antigos
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
    allowNull: false,
  },
  creditCardId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Vazio = Pago ou A pagar no Dinheiro/Conta Corrente
    references: {
      model: CreditCard,
      key: 'id',
    },
  },
}, {
  sequelize,
  tableName: 'Transactions',
});

// Relationships
User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

CreditCard.hasMany(Transaction, { foreignKey: 'creditCardId', as: 'transactions' });
Transaction.belongsTo(CreditCard, { foreignKey: 'creditCardId', as: 'creditCard' });

export default Transaction;
