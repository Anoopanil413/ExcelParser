import fs from 'fs'
import { processExcelFile } from '../utils/excelParcer.js';
import {convertExcelToJson, convertExcelToJsonNew} from '../services/excelService.js';
import path from 'path';
import { spawn } from 'child_process';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



export async function handleExcelUpload(req, res) {
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

export async function handleExcelUploadNew(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const result = await convertExcelToJsonNew(req.file.path);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error processing Excel file' });
  }
}

export const processExcel = async (req, res) => {
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

export const pythonConverter = (req, res) => {
  const filePath = path.join(__dirname, '../../', req.file.path);

  const pythonScriptPath = path.join(__dirname,'..' ,'python_scripts', 'excel_parse.py');
  const projectRoot = path.resolve(__dirname, '../../');

const pythonExecutable = path.join(projectRoot, 'venv', 'Scripts', 'python.exe');

  const pythonProcess = spawn(pythonExecutable, [pythonScriptPath, filePath]);

  let dataToSend = '';
  let errorToSend = '';

  pythonProcess.stdout.on('data', (data) => {
    console.log("ctual data",data)

      dataToSend += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    console.log("datadata",data)

      errorToSend += data.toString();
  });

  pythonProcess.on('close', (code) => {
    console.log("code",code)
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
