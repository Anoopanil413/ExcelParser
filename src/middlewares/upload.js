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

// const uploadDir = path.join(__dirname, '../uploads');
// console.log(uploadDir,"uploadDir")
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }



module.exports = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 50 } 
});