const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '..', 'Copy of Fundos_PE v3.xlsx');
const workbook = XLSX.readFile(filePath);

console.log('=== ABAS DO EXCEL ===');
console.log(workbook.SheetNames);

workbook.SheetNames.forEach((sheetName) => {
  console.log('\n=== ABA:', sheetName, '===');
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  console.log('Total linhas:', data.length);
  console.log('\nPrimeiras 5 linhas:');
  data.slice(0, 5).forEach((row, i) => {
    console.log(`Linha ${i}:`, JSON.stringify(row));
  });

  if (data.length > 0) {
    console.log('\n--- Coluna por coluna (primeiras 5 linhas) ---');
    const maxCols = Math.min(10, data[0] ? data[0].length : 0);
    for (let col = 0; col < maxCols; col++) {
      const colLetter = String.fromCharCode(65 + col);
      const values = data.slice(0, 5).map(row => row[col]);
      console.log(`Coluna ${colLetter} (índice ${col}):`, values);
    }
  }
});
