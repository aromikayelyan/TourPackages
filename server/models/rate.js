import  Sequelize  from "sequelize"
import sequelize from "../utils/db.js"



const rate = sequelize.define('Rate', {
    id: {
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        type: Sequelize.INTEGER
    },
    packageId: {
        type: Sequelize.STRING,
        allowNull: false
    },
    userName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    comment:{
        type: Sequelize.STRING,
        allowNull: false
    },
    rate:{
        type: Sequelize.INTEGER,
        allowNull: false
    }
})



export default rate