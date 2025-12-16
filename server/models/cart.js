import Sequelize from "sequelize"
import sequelize from "../utils/db.js"

// Модель корзин (carts)
const cart = sequelize.define(
    "Cart",
    {
        id: {
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            type: Sequelize.INTEGER,
        },
        // владелец корзины (логическая связь с users.userUId, без FK для гибкости)
        useruid: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        // строка (JSON/список idшников)
        products: {
            type: Sequelize.TEXT,
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
        tableName: "carts",
        timestamps: false,
    }
)

export default cart


