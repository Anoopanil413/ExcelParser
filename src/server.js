
import express from 'express';

import {processExcel, handleExcelUpload, pythonConverter, handleExcelUploadNew} from './controllers/excelController.js';
import appConfig from './config/app.config.js';
import {upload,uploadPdf} from './middlewares/upload.js';
import path from 'path';

import { fileURLToPath } from 'url';
import { pdfParserCont, pdfParserEffect } from './controllers/pdfController.js';
import { precisePdfExtractor } from './controllers/pdftojson.js';
import { handleAdobeConverter } from './controllers/adobeExtracter.js';

import 'dotenv/config'
// dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();




app.post('/upload-excel', upload.single('file'), processExcel);

app.post('/convert', upload.single('file'), handleExcelUpload);
app.post('/convertnew', upload.single('file'), handleExcelUploadNew);


app.post('/upload', upload.single('file'), pythonConverter);

app.post('/pdf',uploadPdf.single('file'), pdfParserCont)
app.post('/pdftest',uploadPdf.single('file'), pdfParserEffect)
app.post('/pdftojson',uploadPdf.single('file'), precisePdfExtractor)
app.post('/adobe',uploadPdf.single('file'), handleAdobeConverter)


app.get('/', (req,res)=>{
  res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});



app.listen(appConfig.port, () => {
  console.log(`Server running on port ${appConfig.port}`);
});