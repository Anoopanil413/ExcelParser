
import { promises as fs } from 'fs';
import { parseExcel, parseExcelNew } from '../utils/excelParcer.js';


export async function convertExcelToJson(filePath) {
  try {
    const result = parseExcel(filePath);
    await fs.unlink(filePath); 
    return result;
  } catch (error) {
    console.error('Error converting Excel to JSON:', error);
    throw error;
  }
}


export async function convertExcelToJsonNew(filePath) {
  try {
    const result = parseExcelNew(filePath);
    await fs.unlink(filePath); 
    return result;
  } catch (error) {
    console.error('Error converting Excel to JSON:', error);
    throw error;
  }
}

