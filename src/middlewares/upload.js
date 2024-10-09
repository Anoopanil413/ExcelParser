
import multer from 'multer';
import path from 'path';
import appConfig from '../config/app.config.js';


import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, appConfig.uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const pdfstorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, appConfig.pdfUpload);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if ( ext !== '.xlsx' && ext !== '.xls') {
    return cb(new Error('Only Excel files are allowed'));
  }
  cb(null, true);
};
const pdffileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if ( ext !=='.pdf') {
    return cb(new Error('Only Excel files are allowed'));
  }
  cb(null, true);
};




export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 50 } 
});

export const uploadPdf = multer({
  storage: pdfstorage,
  fileFilter: pdffileFilter,
  limits: { fileSize: 1024 * 1024 * 50 } 
});