const Sequelize = require("sequelize");

const db = require("../util/database");

const Card = db.define("card", {
  id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
  },
  image: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  begin: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  body: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  end: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  type: Sequelize.BOOLEAN,
  stamp: {
    type: Sequelize.STRING,
  }
});

module.exports = Card;
