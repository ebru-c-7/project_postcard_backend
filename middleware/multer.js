const multer = require("multer");
const uuid = require("uuid").v4;

const FILE_TYPE_MAP = { 
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("fileStorage ",file);
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    console.log("filename", file);
    const fileName = file.originalname.split(".")[0] + uuid();
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, fileName + "." + extension);
  },
});

const fileFilter = (req, file, cb) => {
  console.log("filefilter", file);
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const multerModule = multer({ storage: fileStorage, fileFilter });

module.exports = multerModule;
