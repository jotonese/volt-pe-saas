import { NextRequest, NextResponse } from 'next/server'
import { parseExcelFile, extractFundosData, extractInvestidasData, extractTransacoesData } from '@/lib/excel/parser'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      )
    }

    // Verificar tipo do arquivo
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { error: 'Formato inválido. Use arquivos .xlsx ou .xls' },
        { status: 400 }
      )
    }

    // Ler o arquivo
    const buffer = await file.arrayBuffer()

    // Parse do Excel
    const excelData = parseExcelFile(buffer)
    excelData.fileName = file.name

    // DEBUG: Log da estrutura do Excel
    console.log('=== DEBUG EXCEL STRUCTURE ===')
    excelData.sheets.forEach(sheet => {
      console.log(`\nAba: ${sheet.sheetName}`)
      console.log('Headers:', sheet.headers)
      console.log('Primeira linha de dados:', sheet.rows[0])
      console.log('Segunda linha de dados:', sheet.rows[1])
    })

    // Extrair dados
    const fundos = extractFundosData(excelData)
    const investidas = extractInvestidasData(excelData)
    const transacoes = extractTransacoesData(excelData)

    // DEBUG: Log dos fundos extraídos
    console.log('=== FUNDOS EXTRAÍDOS ===')
    console.log('Total:', fundos.length)
    console.log('Primeiros 3 fundos:', fundos.slice(0, 3))

    // Preparar preview das sheets com formato esperado pela página
    const sheets = excelData.sheets.map(sheet => ({
      sheetName: sheet.sheetName,
      headers: sheet.headers,
      rowCount: sheet.rowCount,
      sampleRows: sheet.rows.slice(0, 5), // Primeiras 5 linhas como amostra
    }))

    return NextResponse.json({
      fileName: file.name,
      fileSize: file.size,
      sheets,
      extractedData: {
        fundos,
        investidas,
        transacoes,
      },
    })
  } catch (error) {
    console.error('Erro ao processar Excel:', error)
    return NextResponse.json(
      { error: 'Erro ao processar arquivo: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
