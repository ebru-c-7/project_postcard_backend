const express = require("express");
const { body } = require("express-validator/check");

const cardController = require("../controllers/card");
const isAuth = require("../middleware/auth");
const Contact = require("../models/Contact");
const multerModule = require("../middleware/multer");

const router = express.Router();

router.get("/cards", isAuth, cardController.getCards);

router.get("/:card/:contact", cardController.getCard);

router.post(
  "/",
  isAuth,
  multerModule.single("image"),
  [
    body("contactEmail")
      .isEmail()
      .custom(async (val, { req }) => {
        let contacts = await req.user.getContacts({ where: { email: val } });
        if (!contacts[0]) {
          throw new Error("Contact couldn't be found!");
        }
        req.contact = contacts[0];
        return true;
      })
      .normalizeEmail(),
    body("begin").trim().notEmpty().isLength({max: 16}),
    body("body").trim().notEmpty().isLength({max: 251}),
    body("end").trim().notEmpty().isLength({max: 26}),
  ],
  cardController.createCard
);

router.delete("/:card", isAuth, cardController.deleteCard);

router.patch("/:card", isAuth, cardController.sendCard);

module.exports = router;
