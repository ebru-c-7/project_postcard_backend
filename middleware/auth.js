const jwt = require("jsonwebtoken");

const User = require("../models/User");

const isAuth = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    return next(error);
  }

  const token = authHeader.split(" ")[1];
  let decodedToken;
  
  try {
    decodedToken = jwt.verify(token, process.env.SECRET_CODE);
  } catch (err) {
    err.statusCode = 500;
    return next(err);
  }

  if (!decodedToken) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    return next(error);
  }

  User.findByPk(decodedToken.userId)
    .then((user) => {
      req.user = user;
      console.log(user);
      next();
    })
    .catch((err) => next(err));
};

module.exports = isAuth;
