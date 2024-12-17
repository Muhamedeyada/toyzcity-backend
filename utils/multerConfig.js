const multer = require("multer");
const CustomError = require("../utils/CustomError");

const memoryStorage = multer.memoryStorage();

const upload = multer({
  storage: memoryStorage,
  fileFilter: function (req, file, cb) {
    const extensions = ["image/jpg", "image/jpeg", "image/png"];
    if (extensions.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new CustomError("Only .jpg, .jpeg, and .png formats are allowed", 415),
        false
      );
    }
  },
});

module.exports = upload;
