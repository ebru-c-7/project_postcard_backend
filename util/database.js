const Sequelize = require("sequelize");

let {HOST, USER, DATABASE, PASSWORD} = process.env;

const connectionPool = new Sequelize(DATABASE, USER, PASSWORD, {
    dialect: "mysql",
    HOST
});

module.exports = connectionPool;