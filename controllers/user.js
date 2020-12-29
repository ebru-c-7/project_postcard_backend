const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const uuid = require("uuid").v4;

const User = require("../models/User");

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error();
    error.statusCode = 422;
    error.data = errors.array(); //sending error data to app
    error.message =
      errors.array()[0].msg || "Validation is failed! Please try again.";
    return next(error);
  }

  const { email, password, name } = req.body;

  const id = uuid();

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      id,
      name,
      email,
      password: hashedPassword,
    });
    // res.status(201).json({ message: "Sign up is successful!", userId: id });
  } catch (err) {
    return next(new Error("Something went wrong. Please, try again!"));
  }

  let token;
  try {
    token = jwt.sign(
      {
        email,
        userId: id,
      },
      process.env.SECRET_CODE,
      { expiresIn: "1h" }
    );
    res.status(200).json({ token, name });
  } catch (err) {
    return next(new Error("Something went wrong. Please, try again!"));
  }
};

exports.login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error();
    error.statusCode = 422;
    error.data = errors.array(); //sending error data to app
    error.message =
      errors.array()[0].msg || "Validation is failed! Please try again.";
    return next(error);
  }

  const {
    body: { password },
    loadedUser,
  } = req;
  let token;

  try {
    const isEqual = await bcrypt.compare(password, loadedUser.password);
    if (!isEqual) {
      const error = new Error();
      error.message = "Wrong email or password! Please try again.";
      error.statusCode = 401;
      return next(error);
    }
  } catch (err) {
    return next(new Error("Something went wrong. Please, try again!"));
  }

  try {
    token = jwt.sign(
      {
        email: loadedUser.email,
        userId: loadedUser.id,
      },
      process.env.SECRET_CODE,
      { expiresIn: "1h" }
    );
    console.log("name: ", loadedUser.name);
  } catch (err) {
    return next(new Error("Something went wrong. Please, try again!"));
  }

  res.status(200).json({ token, name: loadedUser.name });
};
