import { DataTypes } from 'sequelize'

export default async function (sequelize) {
  return sequelize.define(
    'Pet',
    {
      pet_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      pet_owner_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      pet_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      pet_breed: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      pet_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      pet_birthday: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      pet_chip_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      pet_gender: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      pet_avatar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: 'pet', //直接提供資料表名稱
      // timestamps: true, // 使用時間戳
      timestamps: false, // 不: 使用時間戳
      paranoid: false, // 軟性刪除
      // underscored: true, // 所有自動建立欄位，使用snake_case命名
      underscored: false, // 不: 所有自動建立欄位，使用snake_case命名
      // createdAt: 'created_at', // 建立的時間戳
      // updatedAt: 'updated_at', // 更新的時間戳
    }
  )
}
