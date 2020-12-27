const { validationResult } = require("express-validator");

const Contact = require("../models/Contact");
const Card = require("../models/Card");

exports.getContacts = async (req, res, next) => {
  let contacts;
  try {
    contacts = await req.user.getContacts(); //ADD USER TO THE REQ
  } catch (err) {
    return next(new Error("Something went wrong. Please, try again!"));
  }
  res.status(200).json({ contacts });
};

exports.createContact = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error();
    error.statusCode = 422;
    error.data = errors.array(); //sending error data to app
    error.message =
      errors.array()[0].msg || "Validation is failed! Please try again.";
    return next(error);
  }

  const { name, email } = req.body;
  const note = req.body.note || "";

  let contact;

  try {
    contact = await req.user.createContact({ name, email, note }); //ADD USER TO THE REQ
    res.status(201).json({ contact, message: "Yay! The contact is created!" });
  } catch (err) {
    next(new Error("Something went wrong. Please, try again!"));
  }
};

exports.editContact = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error();
    error.statusCode = 422;
    error.data = errors.array(); //sending error data to app
    error.message =
      errors.array()[0].msg || "Validation is failed! Please try again.";
    return next(error);
  }
  const id = req.params.contact;
  const { name, email } = req.body;
  const note = req.body.note || "";

  let contact;

  try {
    contact = await Contact.findByPk(id); //ADD USER TO THE REQ
  } catch (err) {
    return next(new Error("Something went wrong. Please, try again!"));
  }

  if (!contact) {
    return next(new Error("Contact not found!"));
  }

  if (req.user.id != contact.userId) {
    const error = new Error("Unauthorized operation!");
    error.statusCode = 401;
    return next(error);
  }

  contact.name = name;
  contact.email = email;
  contact.note = note;

  try {
    await contact.save();
    res.status(201).json({ contact, message: "Yay! The contact is saved!" });
  } catch (err) {
    return next(new Error("Something went wrong. Please, try again!"));
  }
};

exports.getContact = async (req, res, next) => {
  const id = req.params.contact;
  let contact;

  try {
    contact = await Contact.findByPk(id);
  } catch (err) {
    return next(new Error("Something went wrong. Please, try again!"));
  }

  if (!contact) {
    return next(new Error("Contact is not found!"));
  }

  if (req.user.id != contact.userId) {
    const error = new Error("Unauthorized operation!");
    error.statusCode = 401;
    return next(error);
  }

  res.status(200).json({ contact });
};

exports.deleteContact = async (req, res, next) => {
  const id = req.params.contact;
  let contact;

  try {
    contact = await Contact.findByPk(id);
  } catch (err) {
    return next(new Error("Something went wrong. Please, try again!"));
  }

  if (!contact) {
    return next(new Error("No contact is found!"));
  }

  if (req.user.id != contact.userId) {
    const error = new Error("Unauthorized operation!");
    error.statusCode = 401;
    return next(error);
  }

  try {
    await Card.destroy({
      where: {
        contactId: contact.id,
      },
    });
    await contact.destroy();
    res
      .status(200)
      .json({ message: "The contact and the related cards are deleted!" });
  } catch (err) {
    return next(new Error("Something went wrong. Please, try again!"));
  }
};
