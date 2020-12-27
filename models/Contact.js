const Sequelize = require("sequelize");

const db = require("../util/database");

const Contact = db.define("contact", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  }, 
  name: { 
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  note: Sequelize.STRING,
});

module.exports = Contact;
