import xlsx from 'xlsx';
import * as cptable from 'xlsx/dist/cpexcel.full.mjs';


const { read, readFile, utils,set_cptable } = xlsx;
// set_cptable(cptable);


export function parseExcel(filePath) {
  const workbook = readFile(filePath);
  const result = {};

  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const jsonData = utils.sheet_to_json(sheet, { raw: false, dateNF: 'yyyy-mm-dd' });
    
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

export function parseExcelNew(filePath) {
  const workbook = readFile(filePath);
  const result = {};

  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const jsonData = utils.sheet_to_json(sheet, { header: 1, raw: false, dateNF: 'yyyy-mm-dd' });

    result[sheetName] = {};

    const firstRow = jsonData[0];
    
    if (firstRow && typeof firstRow[0] === 'string' && firstRow[0].trim() === 'TYPE') {
      console.log(`Applying logic for TYPE sheet: ${sheetName}`);
      result[sheetName] = processTypeSheet(jsonData);
    } else {
      console.log(`Unknown structure for sheet: ${sheetName}, applying default parsing`);
      result[sheetName] = processDefaultSheet(jsonData);
    }
  });

  return result;
}


function processTypeSheet(jsonData) {
  let result = {};
  let currentType = null;
  let subheadings = [];
  let foundTypeRow = false;

  jsonData.forEach((row) => {
    if (!foundTypeRow && typeof row[0] === 'string' && row[0].trim() === 'TYPE') {
      currentType = row[0];
      result[currentType] = {};
      foundTypeRow = true;
    }
    
    else if (foundTypeRow && typeof row[0] === 'string' && row[0].trim() === 'Use combobox') {
      subheadings = row;
      subheadings.forEach(subheading => {
        if (subheading) result[currentType][subheading] = [];
      });
    }

    else if (foundTypeRow && subheadings.length > 0) {
      subheadings.forEach((subheading, colIndex) => {
        if (result[currentType][subheading]) {
          result[currentType][subheading].push(parseValue(row[colIndex]));
        }
      });
    }
  });

  return result;
}

function processDefaultSheet(jsonData) {
  let result = [];
  
  jsonData.forEach(row => {
    const rowData = {};
    row.forEach((cell, colIndex) => {
      rowData[`col${colIndex}`] = parseValue(cell);
    });
    result.push(rowData);
  });

  return result;
}

export function parseValue(value) {
  if (value === undefined || value === null) return null;
  const dateValue = new Date(value);
  if (!isNaN(dateValue.getTime())) {
    return dateValue.toISOString();
  }
  const numValue = Number(value);
  if (!isNaN(numValue)) {
    return numValue;
  }
  return value.toString();
}

export function parseNewValue(value) {
  if (value === undefined || value === null) return null;
  const dateValue = new Date(value);
  if (!isNaN(dateValue.getTime())) {
    return dateValue.toISOString();
  }
  const numValue = Number(value);
  if (!isNaN(numValue)) {
    return numValue;
  }
  return value.toString();
}

export const normalizeExcelData = (jsonData) => {
  if (!Array.isArray(jsonData) || jsonData.length === 0) {
    return [];
  }

  let headers = jsonData[0].map(header => String(header || '').trim());
  let dataRows = jsonData.slice(1);

  let normalizedData = dataRows.map(row => {
    let rowObj = {};
    headers.forEach((header, index) => {
      let cell = row[index];
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

export const processExcelFile = (filePath) => {
  const workbook = readFile(filePath, { cellDates: true }); 
  
  let allData = {};
  workbook.SheetNames.forEach(sheetName => { 
    const sheet = workbook.Sheets[sheetName];
    const jsonData = utils.sheet_to_json(sheet, { header: 1, defval: null });
    const normalizedData = normalizeExcelData(jsonData);
    allData[sheetName] = normalizedData;
  });

  return allData;
};

