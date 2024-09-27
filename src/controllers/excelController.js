const fs = require('fs');

const { processExcelFile } = require('../utils/excelParcer');
const { convertExcelToJson } = require('../services/excelService');
const path = require('path');
const { spawn } = require('child_process');

async function handleExcelUpload(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const result = await convertExcelToJson(req.file.path);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error processing Excel file' });
  }
}


const processExcel = async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  
  const filePath = req.file.path;
  
  try {
    const allData = processExcelFile(filePath);
    
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting file:', err);
    });
    
    res.json(allData);
  } catch (error) {
    console.error('Error processing Excel file:', error);
    res.status(500).send('Error processing Excel file.');
  }
};

const pythonConverter = (req, res) => {
  const filePath = path.join(__dirname, '../../', req.file.path);

  const pythonScriptPath = path.join(__dirname,'..' ,'python_scripts', 'excel_parse.py');
  const projectRoot = path.resolve(__dirname, '../../');

const pythonExecutable = path.join(projectRoot, 'venv', 'Scripts', 'python.exe');

  const pythonProcess = spawn(pythonExecutable, [pythonScriptPath, filePath]);

  let dataToSend = '';
  let errorToSend = '';

  pythonProcess.stdout.on('data', (data) => {
    console.log("datadata",data)
      dataToSend += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
      errorToSend += data.toString();
  });

  pythonProcess.on('close', (code) => {
    if (code === 0) {
        try {
            const parsedData = JSON.parse(dataToSend);
            res.status(200).json({
                status: 'success',
                data: parsedData, 
            });
        } catch (parseError) {
            res.status(500).json({
                status: 'error',
                message: 'Failed to parse JSON output from Python script.',
                error: parseError.message,
                dataReceived: dataToSend,
            });
        }
    } else {

        res.status(500).json({
            status: 'error',
            message: errorToSend || 'An error occurred while processing the file',
        });
    }
      fs.unlink(filePath, (err) => {
          if (err) {
              console.error('Error deleting the file:', err);
          }
      });
  });
}
module.exports = { handleExcelUpload,processExcel,pythonConverter };