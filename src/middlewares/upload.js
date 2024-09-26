const multer = require('multer');
const path = require('path');
const config = require('../config/app.config');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== '.xlsx' && ext !== '.xls') {
    return cb(new Error('Only Excel files are allowed'));
  }
  cb(null, true);
};

module.exports = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 50 } // 5MB limit
});