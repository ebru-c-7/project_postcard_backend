const express = require("express");
const { body } = require("express-validator/check");

const contactController = require("../controllers/contact");
const Contact = require("../models/Contact");
const isAuth = require("../middleware/auth");

const router = express.Router();

router.get("/contacts", isAuth, contactController.getContacts);

router.get("/:contact", isAuth, contactController.getContact);

router.post(
  "/",
  isAuth,
  [
    body("name").notEmpty(),
    body("email")
      .isEmail()
      .custom(async (val, { req }) => {
        let contact = await req.user.getContacts({ where: { email: val } });
        if (contact[0]) {
          const error = new Error("Contact address already exists!");
          throw error;
        }
        return true;
      })
      .normalizeEmail(),
  ],
  contactController.createContact
);

router.patch(
  "/:contact",
  isAuth,
  [
    body("name").notEmpty(),
    body("email")
      .isEmail()
      .custom(async (val, { req }) => {
        let contacts;
        try {
          contacts = await req.user.getContacts({ where: { email: val } });
        } catch (err) {
          throw new Error(
            "We couldn't get the contact! Please try again later."
          );
        }

        if (contacts[0]) {
          for (let contact of contacts) {
            if (contact.id != req.params.contact) {
              console.log("ids", contact.id, req.params.contact);
              throw new Error("Contact address already exists!");
            }
          }
        }
        return true;
      })
      .normalizeEmail(),
  ],
  contactController.editContact
);

router.delete("/:contact", isAuth, contactController.deleteContact);

module.exports = router;
