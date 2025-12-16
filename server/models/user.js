import Sequelize from "sequelize"
import sequelize from "../utils/db.js"

// Модель пользователей (users)
const user = sequelize.define(
    "User",
    {
        id: {
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            type: Sequelize.INTEGER,
        },
        Username: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        // логический UID (строка)
        userUId: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true, // чтобы внешние ключи могли на него ссылаться
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        // по смыслу лучше varchar
        email: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        created_at: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        updated_at: {
            type: Sequelize.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "users",
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ["userUId"],
            },
        ],
    }
)

export default user


