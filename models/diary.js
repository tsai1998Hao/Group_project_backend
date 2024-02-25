import { DataTypes } from 'sequelize'

export default async function (sequelize) {
  return sequelize.define(
    'Diary',
    {
      diary_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      diary_pet_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      diary_date: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      diary_date_time: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      diary_act_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      diary_quantity_g: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      diary_duration_min: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      diary_body_temperature: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      diary_height_cm: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      diary_weight_kg: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      diary_memo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: 'diary', //直接提供資料表名稱
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
