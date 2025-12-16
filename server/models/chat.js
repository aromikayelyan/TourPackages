import Sequelize from "sequelize"
import sequelize from "../utils/db.js"

// Модель чатов (chats)
const chat = sequelize.define(
    "Chat",
    {
        id: {
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            type: Sequelize.INTEGER,
        },
        // первый пользователь чата (логическая связь с users.userUId)
        user1id: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        // второй пользователь чата (логическая связь с users.userUId)
        uuser2id: {
            type: Sequelize.STRING,
            allowNull: false,
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
        tableName: "chats",
        timestamps: false,
    }
)

export default chat


