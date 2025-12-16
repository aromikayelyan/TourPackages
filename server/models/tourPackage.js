import Sequelize from "sequelize"
import sequelize from "../utils/db.js"

// Модель пакетов (packages)
const tourPackage = sequelize.define(
    "Package",
    {
        id: {
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            type: Sequelize.INTEGER,
        },
        uid: {
            // логический UID, на него ссылаются rate.packageId
            type: Sequelize.STRING,
            allowNull: false,
            unique: true, // нужен индекс/уникальность для внешних ключей
        },
        name: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        price: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        description: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        availableSeats: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        duration: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        forSlide: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
        },
        images: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        startDate: {
            type: Sequelize.DATEONLY,
            allowNull: true,
            validate: {
                isDate: true,
            },
        },
        endDate: {
            type: Sequelize.DATEONLY,
            allowNull: true,
            validate: {
                isDate: true,
                isAfterStart(value) {
                    const start = this.getDataValue("startDate")
                    if (value && start && value < start) {
                        throw new Error("endDate не может быть раньше startDate")
                    }
                },
            },
        },
        // владелец тура (пользователь, который создал тур)
        creatorUserUId: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        // created_at / updated_at из схемы
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
        tableName: "packages",
        timestamps: false, // используем свои поля created_at / updated_at
        indexes: [
            {
                unique: true,
                fields: ["uid"],
            },
        ],
    }
)

export default tourPackage



