const express = require('express');
const multer = require('multer');
const path = require('path');
const { processExcel, handleExcelUpload, pythonConverter } = require('./controllers/excelController');
const fs = require('fs');
const appConfig = require('./config/app.config');
const upload = require('./middlewares/upload');


const app = express();




app.post('/upload-excel', upload.single('file'), processExcel);

app.post('/convert', upload.single('file'), handleExcelUpload);


app.post('/upload', upload.single('file'), pythonConverter);


app.get('/', (req,res)=>{
  res.json({message:"Hello World!"})
});


app.listen(appConfig.port, () => {
  console.log(`Server running on port ${appConfig.port}`);
});