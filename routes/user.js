const express = require("express");
const { body } = require("express-validator");

const User = require("../models/User");
const userController = require("../controllers/user");

const router = express.Router();

router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .custom(async (val, { req }) => {
        let user = await User.findOne({ where: { email: val } });
        if (user) {
          const error = new Error(
            "E-mail address already exists! Please login instead."
          );
          throw error;
        }
        return true;
      })
      .normalizeEmail(),
    body("password").trim().notEmpty().isLength({ min: 5 }),
    body("name").trim().notEmpty().isLength({ min: 5 }),
  ],
  userController.signup
);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .custom(async (val, { req }) => {
        let user = await User.findOne({ where: { email: val } });
        if (!user) {
          const error = new Error("Wrong email or password! Please try again.");
          throw error;
        }
        req.loadedUser = user;
        return true;
      }),
    body("password").trim().notEmpty().isLength({ min: 5 }),
  ],
  userController.login
);

module.exports = router;
