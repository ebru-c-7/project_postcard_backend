const path = require("path");
const fs = require("fs");

const express = require("express");
const bodyParser = require("body-parser");

const db = require("./util/database");
const Card = require("./models/Card");
const Contact = require("./models/Contact");
const User = require("./models/User");
const cardRoutes = require("./routes/card");
const userRoutes = require("./routes/user");
const contactRoutes = require("./routes/contact");

const app = express();

app.use(bodyParser.json());

app.use("/images", express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/card", cardRoutes);
app.use("/user", userRoutes);
app.use("/contact", contactRoutes);

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path,()=>{
      console.log("file deleted");
    });
  }

  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;

  console.log("error console");
  console.log("message: ",message);
  console.log("data: ", data)
  res.status(status).json({ message, data });
});

User.hasMany(Card);
Card.belongsTo(User, { constraints: true, onDelete: "CASCADE" });

User.hasMany(Contact);
Contact.belongsTo(User, { constraints: true, onDelete: "CASCADE" });

Contact.hasMany(Card);
Card.belongsTo(Contact);

// app.listen(5000);

db.sync()
  .then((res) => {
    app.listen(5000);
  })
  .catch((err) => console.log(err));
