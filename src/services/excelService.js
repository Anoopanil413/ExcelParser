const fs = require('fs').promises;
const { parseExcel } = require('../utils/excelParcer');

async function convertExcelToJson(filePath) {
  try {
    const result = parseExcel(filePath);
    await fs.unlink(filePath); 
    return result;
  } catch (error) {
    console.error('Error converting Excel to JSON:', error);
    throw error;
  }
}

module.exports = { convertExcelToJson };