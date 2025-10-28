import Sequelize from "sequelize"
import sequelize from "../utils/db.js"


const tourPackage = sequelize.define('Package',
    {
        id: {
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            type: Sequelize.INTEGER
        },
        uid: {
            type: Sequelize.STRING,
            allowNull: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: true
        },
        price: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        description: {
            type: Sequelize.STRING,
            allowNull: true
        },
        availableSeats: {
            type: Sequelize.INTEGER,
            allowNull: true
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
                    const start = this.getDataValue("startDate");
                    if (value && start && value < start) {
                        throw new Error("endDate не может быть раньше startDate");
                    }
                },
            },
        },
    })



export default tourPackage



