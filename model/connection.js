const Sequelize = require("sequelize")
require("dotenv").config()

const sequelize = new Sequelize(
    process.env.DATABASE,
    "root",
    process.env.PASS,
    {
        host: process.env.HOST,
        dialect: "mysql",
        logging: false
    }
)

sequelize.
    authenticate()
    .then(() => {
        console.log("Connection Established Saroj");
    })
    .catch((err) => {
        console.log("error connecting database")
        console.log(err);
    })

module.exports = sequelize