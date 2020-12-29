const fs = require("fs");
const path = require("path");
var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");
const xoauth2 = require("xoauth2");

const uuid = require("uuid").v4;
const { validationResult } = require("express-validator");

const Card = require("../models/Card");

const smtpTransporter = nodemailer.createTransport(
  smtpTransport({
    service: "Gmail",
    auth: {
      xoauth2: xoauth2.createXOAuth2Generator({
        user: process.env.GMAIL_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_SECRET,
        accessToken: process.env.ACCESS_TOKEN,
        refreshToken: process.env.REFRESH_TOKEN,
      }),
    },
    tls: {
      rejectUnauthorized: false,
    },
  })
);

const getRandomStamp = () => {
  const stamps = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const result = Math.floor(Math.random() * stamps.length);
  const stampPath = path.join("images", "stamps", `${stamps[result]}.png`);
  return stampPath;
};

exports.getCards = async (req, res, next) => {
  let cards;
  try {
    cards = await req.user.getCards({ include: "contact" }); //ADD USER TO THE REQ
    console.log(cards);
  } catch (err) {
    return next(new Error("Something went wrong. Please, try again!"));
  }

  res.status(200).json({ cards });
};

exports.createCard = async (req, res, next) => {
  console.log("create card:", req.file);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error();
    error.statusCode = 422;
    error.data = errors.array(); //sending error data to app
    error.message =
      errors.array()[0].msg || "Validation is failed! Please try again.";
    return next(error);
  }

  console.log("create card: ", req.body);
  const {
    begin,
    body,
    end,
    type,
    //contactEmail
  } = req.body;

  // let type = req.body.type === "on" ? true : false;

  let image;
  try {
    image = req.file.path;
  } catch (err) {
    return next(new Error("File couldn't be uploaded. Please try again!"));
  }

  const id = uuid();
  let card;
  let contact = req.contact;

  // try {
  //   contact = Contact.findOne({where: {email: contactEmail}});
  // } catch(err) {
  //   next(new Error("Something went wrong. Please, try again!"));
  // }

  try {
    card = await Card.build({ id, image, begin, body, end, type });
    card.contactId = contact.id;
    card.userId = req.user.id;
    card.stamp = getRandomStamp();
    console.log("stamp: ", card.stamp);
    await card.save();
  } catch (err) {
    return next(new Error("Something went wrong. Please, try again!"));
  }
  let message = "Yay! A new card is created!";

  if (card.type) {
    message = "Yay, a new card is sent!";
  }
  if (card.type) {
    fs.readFile("./email/email.html", { encoding: "utf-8" }, (err, data) => {
      let htmlFile = data;
      let link = `${process.env.FRONT_END}/card/${card.id}/${contact.id}`;
      htmlFile = htmlFile.replace(/#postcardlink#/g, link);

      if (err) {
        console.log("Error in reading file: " + err);
      } else {
        smtpTransporter.sendMail(
          {
            from: process.env.GMAIL_USER,
            to: contact.email,
            subject: "Hey, you've got mail!",
            html: htmlFile,
          },
          function (error, info) {
            if (error) {
              console.log("Error in sending: ", error);
            } else {
              console.log(
                "Email sent to" + contact.email + ": " + info.response
              );
            }
          }
        );
      }
    });
  }

  card = { ...card.dataValues, contact: contact };

  res.status(200).json({ card, message });
};

exports.deleteCard = async (req, res, next) => {
  const id = req.params.card;
  let card;

  try {
    card = await Card.findByPk(id);
  } catch (err) {
    return next(new Error("Something went wrong. Please, try again!"));
  }

  if (!card) {
    return next(new Error("No contact is found!"));
  }

  if (req.user.id != card.userId) {
    const error = new Error("Unauthorized operation!");
    error.statusCode = 401;
    return next(error);
  }

  try {
    await card.destroy();
  } catch (err) {
    return next(new Error("Something went wrong. Please, try again!"));
  }

  let imagePath;
  if (card.image) {
    imagePath = card.image;
    fs.unlink(imagePath, (err) => console.log(err));
  }
  res.status(200).json({ message: "The card is deleted!" });
};

exports.getCard = async (req, res, next) => {
  const id = req.params.card;
  const contactId = req.params.contact;
  let card;

  try {
    card = await Card.findByPk(id);
  } catch (err) {
    return next(new Error("Something went wrong. Please, try again!"));
  }

  if (!card) {
    return next(new Error("Card is not found!"));
  }

  if (contactId != card.contactId) {
    const error = new Error("Unauthorized operation!");
    error.statusCode = 401;
    return next(error);
  }
  console.log("card", card);
  res.status(200).json({ card });
};

exports.sendCard = async (req, res, next) => {
  const id = req.params.card;
  let card;

  try {
    card = await Card.findByPk(id);
  } catch (err) {
    return next(new Error("Something went wrong. Please, try again!"));
  }

  if (!card) {
    return next(new Error("No card is found!"));
  }

  if (req.user.id != card.userId) {
    const error = new Error("Unauthorized operation!");
    error.statusCode = 401;
    return next(error);
  }

  try {
    card.type = true;
    card.save();
    //send the card to the contact
  } catch (err) {
    return next(new Error("Something went wrong. Please, try again!"));
  }

  res.status(200).json({ message: "The card is sent!" });
};
