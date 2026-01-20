const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '..', 'Copy of Fundos_PE v3.xlsx');

console.log('Analisando arquivo:', filePath);
console.log('='.repeat(80));

try {
  const workbook = XLSX.readFile(filePath);

  console.log('\n📊 ABAS DO ARQUIVO:');
  console.log(workbook.SheetNames.join(', '));
  console.log('='.repeat(80));

  workbook.SheetNames.forEach(sheetName => {
    console.log(`\n\n📋 ABA: "${sheetName}"`);
    console.log('-'.repeat(60));

    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (jsonData.length === 0) {
      console.log('  (vazia)');
      return;
    }

    // Headers
    const headers = jsonData[0] || [];
    console.log('\n📝 COLUNAS:');
    headers.forEach((h, i) => {
      console.log(`  ${i}: "${h}"`);
    });

    // Primeiras linhas de dados
    console.log('\n📄 PRIMEIRAS 3 LINHAS:');
    for (let i = 1; i <= Math.min(3, jsonData.length - 1); i++) {
      console.log(`\n  Linha ${i}:`);
      const row = jsonData[i];
      headers.forEach((h, j) => {
        const value = row[j];
        if (value !== undefined && value !== null && value !== '') {
          const display = String(value).substring(0, 80);
          console.log(`    ${h}: ${display}${String(value).length > 80 ? '...' : ''}`);
        }
      });
    }

    console.log(`\n  Total de linhas (sem header): ${jsonData.length - 1}`);
  });

} catch (error) {
  console.error('Erro:', error.message);
}
