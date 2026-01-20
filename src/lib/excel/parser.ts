import * as XLSX from 'xlsx'
import { FundoData, InvestidaData, TransacaoData } from '@/contexts/DataContext'

export type SheetData = {
  sheetName: string
  headers: string[]
  rows: Record<string, any>[]
  rowCount: number
}

export type ExcelData = {
  fileName: string
  sheets: SheetData[]
}

/**
 * Parse um arquivo Excel e retorna os dados estruturados
 */
export function parseExcelFile(buffer: ArrayBuffer): ExcelData {
  const workbook = XLSX.read(buffer, { type: 'array' })

  const sheets: SheetData[] = workbook.SheetNames.map(sheetName => {
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

    if (jsonData.length === 0) {
      return {
        sheetName,
        headers: [],
        rows: [],
        rowCount: 0,
      }
    }

    // Primeira linha são os headers
    const headers = (jsonData[0] || []).map((h: any) => String(h || '').trim())

    // Resto são os dados - preservar TODAS as colunas por índice
    // Isso é importante para headers mesclados onde a coluna B pode não ter header
    const rows = jsonData.slice(1).map(row => {
      const obj: Record<string, any> = {}
      // Primeiro, adicionar dados por índice numérico para garantir acesso
      row.forEach((value: any, index: number) => {
        obj[`__col_${index}`] = value ?? null
      })
      // Depois, adicionar por nome do header (se existir)
      headers.forEach((header, index) => {
        if (header) {
          obj[header] = row[index] ?? null
        }
      })
      return obj
    }).filter(row => Object.values(row).some(v => v !== null && v !== ''))

    return {
      sheetName,
      headers,
      rows,
      rowCount: rows.length,
    }
  })

  return {
    fileName: 'uploaded_file.xlsx',
    sheets,
  }
}

/**
 * Extrai dados de fundos do Excel - Específico para "Copy of Fundos_PE v3.xlsx"
 * A Coluna B (índice 1) contém os nomes dos fundos
 * NOTA: O header "Fundo" está mesclado e cobre colunas A (logos) e B (nomes)
 */
export function extractFundosData(excelData: ExcelData): FundoData[] {
  // Procura pela aba "Targets" primeiro, depois outras possibilidades
  const fundosSheet = excelData.sheets.find(s =>
    s.sheetName.toLowerCase() === 'targets'
  ) || excelData.sheets.find(s => {
    const name = s.sheetName.toLowerCase()
    return name.includes('fundo') ||
           name.includes('pe') ||
           name.includes('gestor')
  }) || excelData.sheets[0]

  if (!fundosSheet || fundosSheet.rows.length === 0) return []

  return fundosSheet.rows.map((row, index): FundoData => {
    // Mapeamento específico para a estrutura do Excel "Copy of Fundos_PE v3.xlsx"
    // IMPORTANTE: Header "Fundo" é mesclado (colunas A e B)
    // Coluna A (índice 0) = logos (ignorar)
    // Coluna B (índice 1) = nomes dos fundos

    // Acessar diretamente por índice de coluna usando __col_X
    const nome = row['__col_1'] || row['Fundo'] || row['Nome'] || `Fundo ${index + 1}`

    const ticket = row['Ticket'] || row['__col_2'] || ''
    const tipoIdeal = row['Tipo ideal de deal / empresa'] || row['__col_3'] || ''
    const setoresInteresse = row['Setores de maior interesse / restrições'] || row['__col_4'] || ''
    const portfolio = row['Portfolio'] || row['__col_5'] || ''
    const contato = row['Contatos chave'] || row['__col_6'] || ''
    const telefone = row['Telefone'] || row['__col_7'] || ''
    const email = row['Email'] || row['__col_8'] || ''
    const descritivo = row['Descritivo '] || row['Descritivo'] || row['__col_9'] || ''

    // Extrair setores do campo "Setores de maior interesse / restrições"
    // Tentar pegar apenas os setores principais, não as notas detalhadas
    const setoresExtraidos = extrairSetores(setoresInteresse)

    return {
      id: `fundo-${index + 1}`,
      nome: String(nome).trim(),
      setor: setoresExtraidos[0] || undefined,
      setores: setoresExtraidos,
      ticket: ticket,
      tipoIdeal: tipoIdeal,
      setoresInteresse: setoresInteresse,
      portfolio: portfolio,
      contato: String(contato).trim() || undefined,
      telefone: String(telefone).trim() || undefined,
      email: String(email).trim() || undefined,
      descritivo: descritivo,
    }
  }).filter(fundo => fundo.nome && fundo.nome !== `Fundo ${0}` && fundo.nome !== 'undefined') // Filtrar linhas sem nome
}

/**
 * Extrai setores principais do texto de setores/restrições
 */
function extrairSetores(texto: string): string[] {
  if (!texto) return []

  const setoresConhecidos = [
    'Tecnologia', 'Tech', 'Software', 'SaaS',
    'Saúde', 'Healthcare', 'Health',
    'Consumo', 'Consumer', 'Varejo', 'Retail',
    'Agronegócio', 'Agro', 'Agribusiness',
    'Educação', 'Education',
    'Serviços', 'Services', 'B2B',
    'Infraestrutura', 'Infra', 'Infrastructure',
    'Financeiro', 'Financial', 'Fintech',
    'Industrial', 'Indústria',
    'Logística', 'Logistics',
    'Real Estate', 'Imobiliário',
    'Energia', 'Energy',
    'Telecom',
  ]

  const textoLower = texto.toLowerCase()
  const setoresEncontrados: string[] = []

  // Mapear para nomes padronizados
  if (textoLower.includes('tech') || textoLower.includes('software') || textoLower.includes('saas')) {
    setoresEncontrados.push('Tecnologia')
  }
  if (textoLower.includes('saúde') || textoLower.includes('health') || textoLower.includes('hospital')) {
    setoresEncontrados.push('Saúde')
  }
  if (textoLower.includes('consumo') || textoLower.includes('consumer') || textoLower.includes('varejo') || textoLower.includes('retail')) {
    setoresEncontrados.push('Consumo')
  }
  if (textoLower.includes('agro') || textoLower.includes('agri')) {
    setoresEncontrados.push('Agronegócio')
  }
  if (textoLower.includes('educa')) {
    setoresEncontrados.push('Educação')
  }
  if (textoLower.includes('serviço') || textoLower.includes('service') || textoLower.includes('b2b')) {
    setoresEncontrados.push('Serviços')
  }
  if (textoLower.includes('infra')) {
    setoresEncontrados.push('Infraestrutura')
  }
  if (textoLower.includes('financ') || textoLower.includes('fintech') || textoLower.includes('banking')) {
    setoresEncontrados.push('Serv. Financeiros')
  }
  if (textoLower.includes('industr')) {
    setoresEncontrados.push('Industrial')
  }
  if (textoLower.includes('logist') || textoLower.includes('logíst')) {
    setoresEncontrados.push('Logística')
  }
  if (textoLower.includes('real estate') || textoLower.includes('imobili')) {
    setoresEncontrados.push('Real Estate')
  }
  if (textoLower.includes('energ')) {
    setoresEncontrados.push('Energia')
  }
  if (textoLower.includes('telecom')) {
    setoresEncontrados.push('Telecom')
  }

  // Remover duplicados
  return [...new Set(setoresEncontrados)]
}

/**
 * Extrai dados de investidas/add-ons do Excel
 */
export function extractInvestidasData(excelData: ExcelData): InvestidaData[] {
  // Para este Excel específico, não há aba de investidas separada
  // Retornar array vazio - os dados de exemplo serão usados
  const investidasSheet = excelData.sheets.find(s => {
    const name = s.sheetName.toLowerCase()
    return name.includes('investida') ||
           name.includes('add-on') ||
           name.includes('addon') ||
           name.includes('portfolio')
  })

  if (!investidasSheet || investidasSheet.rows.length === 0) return []

  return investidasSheet.rows.map((row, index): InvestidaData => {
    const setor = row['Setor'] || row['setor'] || row[Object.keys(row)[0]] || 'Outros'

    return {
      id: `investida-${index + 1}`,
      setor: String(setor),
      numInvestidas: Number(row['Num'] || row['Quantidade'] || row['Count'] || 1),
      segmentos: [],
    }
  })
}

/**
 * Extrai dados de transações do Excel
 */
export function extractTransacoesData(excelData: ExcelData): TransacaoData[] {
  const transacoesSheet = excelData.sheets.find(s => {
    const name = s.sheetName.toLowerCase()
    return name.includes('transac') ||
           name.includes('deal') ||
           name.includes('m&a')
  })

  if (!transacoesSheet || transacoesSheet.rows.length === 0) return []

  return transacoesSheet.rows.map((row, index): TransacaoData => {
    return {
      id: `transacao-${index + 1}`,
      data: row['Data'] || row['Date'] || undefined,
      target: row['Target'] || row['Empresa'] || undefined,
      buyer: row['Buyer'] || row['Comprador'] || undefined,
      dealValue: row['Value'] || row['Valor'] || undefined,
      setor: row['Setor'] || undefined,
    }
  })
}

/**
 * Analisa a estrutura do Excel e retorna um resumo
 */
export function analyzeExcelStructure(excelData: ExcelData) {
  return {
    totalSheets: excelData.sheets.length,
    sheets: excelData.sheets.map(sheet => ({
      name: sheet.sheetName,
      columns: sheet.headers.length,
      rows: sheet.rowCount,
      headers: sheet.headers,
      sampleData: sheet.rows.slice(0, 3),
    })),
  }
}
