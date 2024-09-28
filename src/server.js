
import express from 'express';

import {processExcel, handleExcelUpload, pythonConverter, handleExcelUploadNew} from './controllers/excelController.js';
import appConfig from './config/app.config.js';
import {upload} from './middlewares/upload.js';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();




app.post('/upload-excel', upload.single('file'), processExcel);

app.post('/convert', upload.single('file'), handleExcelUpload);
app.post('/convertnew', upload.single('file'), handleExcelUploadNew);


app.post('/upload', upload.single('file'), pythonConverter);


app.get('/', (req,res)=>{
  res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});


app.listen(appConfig.port, () => {
  console.log(`Server running on port ${appConfig.port}`);
});