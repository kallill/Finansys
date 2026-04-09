import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class LearnedPattern extends Model {
  public id!: number;
  public phrase!: string;
  public intent!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

LearnedPattern.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    phrase: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    intent: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    params: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'LearnedPattern',
  }
);

export default LearnedPattern;
