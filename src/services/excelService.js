const xlsx = require('xlsx');

exports.normalizeExcelData = (jsonData) => {
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

exports.processExcelFile = (filePath) => {
  const workbook = xlsx.readFile(filePath, { cellDates: true });
  
  let allData = {};
  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null });
    const normalizedData = exports.normalizeExcelData(jsonData);
    allData[sheetName] = normalizedData;
  });

  return allData;
};