const XLSX = require('xlsx');

function parseExcel(filePath) {
  const workbook = XLSX.readFile(filePath);
  const result = {};

  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { raw: false, dateNF: 'yyyy-mm-dd' });
    
    result[sheetName] = jsonData.map(row => {
      const processedRow = {};
      for (const [key, value] of Object.entries(row)) {
        processedRow[key] = parseValue(value);
      }
      return processedRow;
    });
  });

  return result;
}

function parseValue(value) {
  if (value === undefined || value === null) return null;

  // Try parsing as date
  const dateValue = new Date(value);
  if (!isNaN(dateValue.getTime())) {
    return dateValue.toISOString();
  }

  // Try parsing as number
  const numValue = Number(value);
  if (!isNaN(numValue)) {
    return numValue;
  }

  // Return as string if not a valid date or number
  return value.toString();
}

const normalizeExcelData = (jsonData) => {
  if (!Array.isArray(jsonData) || jsonData.length === 0) {
    return [];
  }

  let headers = jsonData[0].map(header => String(header || '').trim());
  let dataRows = jsonData.slice(1);

  let normalizedData = dataRows.map(row => {
    let rowObj = {};
    headers.forEach((header, index) => {
      let cell = row[index];
      
      // Convert cell to string if it's not null or undefined
      cell = (cell !== null && cell !== undefined) ? String(cell) : null;

      if (header.toLowerCase().includes('date')) {
        if (!rowObj['Dates']) rowObj['Dates'] = {};
        rowObj['Dates'][header] = cell;
      } else {
        rowObj[header] = cell;
      }
    });
    return rowObj;
  });

  return normalizedData;
};

const processExcelFile = (filePath) => {
  const workbook = XLSX.readFile(filePath, { cellDates: true });
  
  let allData = {};
  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
    const normalizedData = normalizeExcelData(jsonData);
    allData[sheetName] = normalizedData;
  });

  return allData;
};

module.exports = { parseExcel,processExcelFile};