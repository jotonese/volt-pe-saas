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

    // Resto são os dados
    const rows = jsonData.slice(1).map(row => {
      const obj: Record<string, any> = {}
      row.forEach((value: any, index: number) => {
        obj[`__col_${index}`] = value ?? null
      })
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
 * Encontra o índice de uma coluna pelo nome (case-insensitive, parcial)
 */
function findColumnIndex(headers: string[], ...possibleNames: string[]): number {
  for (const name of possibleNames) {
    const nameLower = name.toLowerCase()
    const index = headers.findIndex(h =>
      h && h.toLowerCase().includes(nameLower)
    )
    if (index !== -1) return index
  }
  return -1
}

/**
 * Obtém valor de uma linha por nome de coluna ou índice
 */
function getRowValue(row: Record<string, any>, headers: string[], ...possibleNames: string[]): any {
  for (const name of possibleNames) {
    if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
      return row[name]
    }
  }

  const colIndex = findColumnIndex(headers, ...possibleNames)
  if (colIndex !== -1) {
    const colValue = row[`__col_${colIndex}`]
    if (colValue !== undefined && colValue !== null && colValue !== '') {
      return colValue
    }
  }

  return ''
}

/**
 * Extrai valores monetários de um texto (R$ X-Ymi, USD Xmi, etc)
 * Retorna o primeiro valor encontrado ou range
 */
function extrairValorMonetario(texto: string): string | undefined {
  if (!texto) return undefined

  // Padrões para encontrar valores monetários
  const patterns = [
    // R$ 100-300mi, R$ 100 a 300 mi
    /R\$\s*(\d+(?:[.,]\d+)?)\s*[-–a]\s*(\d+(?:[.,]\d+)?)\s*(?:mi|milhões|M)/gi,
    // USD 50-100mi, US$ 50-100mi
    /(?:USD|US\$)\s*(\d+(?:[.,]\d+)?)\s*[-–a]\s*(\d+(?:[.,]\d+)?)\s*(?:mi|milhões|M)/gi,
    // R$ 100mi, R$ 100 milhões
    /R\$\s*(\d+(?:[.,]\d+)?)\s*(?:mi|milhões|M)/gi,
    // USD 50mi, US$ 50mi
    /(?:USD|US\$)\s*(\d+(?:[.,]\d+)?)\s*(?:mi|milhões|M)/gi,
    // 100-300mi (sem prefixo de moeda)
    /(\d+(?:[.,]\d+)?)\s*[-–a]\s*(\d+(?:[.,]\d+)?)\s*(?:mi|milhões)/gi,
    // 100mi, 100 milhões
    /(\d+(?:[.,]\d+)?)\s*(?:mi(?:lhões)?)/gi,
  ]

  for (const pattern of patterns) {
    const match = texto.match(pattern)
    if (match && match[0]) {
      return match[0].trim()
    }
  }

  return undefined
}

/**
 * Extrai faturamento mínimo de um texto de conversa
 */
function extrairFaturamentoMinimo(texto: string): string | undefined {
  if (!texto) return undefined

  const textoLower = texto.toLowerCase()

  // Procurar por padrões de faturamento
  const faturamentoPatterns = [
    /faturamento\s*(?:mínimo|min|de|acima de|>|maior que)?\s*(?:de)?\s*(R\$\s*\d+(?:[.,]\d+)?\s*(?:[-–a]\s*\d+(?:[.,]\d+)?)?\s*(?:mi|milhões|M))/gi,
    /(?:mínimo|min)\s*(?:de)?\s*faturamento\s*(?:de)?\s*(R\$\s*\d+(?:[.,]\d+)?\s*(?:[-–a]\s*\d+(?:[.,]\d+)?)?\s*(?:mi|milhões|M))/gi,
    /receita\s*(?:mínima|de|acima de)?\s*(R\$\s*\d+(?:[.,]\d+)?\s*(?:[-–a]\s*\d+(?:[.,]\d+)?)?\s*(?:mi|milhões|M))/gi,
  ]

  for (const pattern of faturamentoPatterns) {
    const match = texto.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  // Se não encontrou padrão específico de faturamento, mas tem "faturamento" no texto
  if (textoLower.includes('faturamento') || textoLower.includes('receita')) {
    return extrairValorMonetario(texto)
  }

  return undefined
}

/**
 * Extrai ticket/cheque de um texto de conversa
 */
function extrairTicket(texto: string): string | undefined {
  if (!texto) return undefined

  // Procurar por padrões de ticket
  const ticketPatterns = [
    /ticket\s*(?:médio|de|mínimo)?\s*(?:de)?\s*((?:R\$|USD|US\$)\s*\d+(?:[.,]\d+)?\s*(?:[-–a]\s*\d+(?:[.,]\d+)?)?\s*(?:mi|milhões|M))/gi,
    /cheque\s*(?:médio|de|mínimo)?\s*(?:de)?\s*((?:R\$|USD|US\$)\s*\d+(?:[.,]\d+)?\s*(?:[-–a]\s*\d+(?:[.,]\d+)?)?\s*(?:mi|milhões|M))/gi,
    /sweet\s*spot\s*(?:de)?\s*((?:R\$|USD|US\$)\s*\d+(?:[.,]\d+)?\s*(?:[-–a]\s*\d+(?:[.,]\d+)?)?\s*(?:mi|milhões|M))/gi,
  ]

  for (const pattern of ticketPatterns) {
    const match = texto.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  // Se a coluna é especificamente de ticket, pegar qualquer valor monetário
  return extrairValorMonetario(texto)
}

/**
 * Extrai segmentos de interesse de um texto de conversa
 * Retorna array de segmentos específicos mencionados
 */
function extrairSegmentosDeInteresse(texto: string): string[] {
  if (!texto) return []

  const segmentos: string[] = []

  // Lista de segmentos/subsetores específicos para identificar
  const segmentosConhecidos: { [key: string]: string[] } = {
    // Tecnologia
    'SaaS': ['saas', 'software as a service'],
    'SaaS B2B': ['saas b2b', 'b2b saas'],
    'Cybersecurity': ['cybersecurity', 'cibersegurança', 'segurança cibernética', 'cyber'],
    'IoT': ['iot', 'internet das coisas', 'internet of things'],
    'Fintech': ['fintech', 'tech financeira'],
    'Healthtech': ['healthtech', 'health tech', 'tech em saúde'],
    'Edtech': ['edtech', 'ed tech', 'tech em educação'],
    'Proptech': ['proptech', 'prop tech'],
    'Agtech': ['agtech', 'ag tech', 'agrotech'],
    'Logtech': ['logtech', 'log tech'],
    'HRtech': ['hrtech', 'hr tech'],
    'Legaltech': ['legaltech', 'legal tech'],
    'Insurtech': ['insurtech', 'insur tech'],
    'Marketplace': ['marketplace', 'plataforma'],
    'E-commerce': ['e-commerce', 'ecommerce', 'comércio eletrônico'],
    'Cloud': ['cloud', 'nuvem'],
    'IA': ['inteligência artificial', 'ia ', 'ai ', 'machine learning', 'ml'],
    'Data Analytics': ['analytics', 'data analytics', 'big data'],
    'ERP': ['erp', 'gestão empresarial'],
    'CRM': ['crm'],
    // Saúde
    'Hospitais': ['hospital', 'hospitais', 'hospitalar'],
    'Clínicas': ['clínica', 'clinica', 'clínicas'],
    'Laboratórios': ['laboratório', 'laboratorio', 'lab ', 'labs'],
    'Diagnóstico': ['diagnóstico', 'diagnostico', 'diagnose'],
    'Farmacêutico': ['farmacêutic', 'farmaceutic', 'pharma'],
    'Equipamentos Médicos': ['equipamento médico', 'equipamentos médicos', 'dispositivos médicos'],
    'Dental': ['dental', 'odonto', 'odontológic'],
    'Oftalmologia': ['oftalmolog', 'oftalmologia', 'olhos'],
    'Veterinário': ['veterinár', 'veterinario', 'pet health', 'animal health'],
    'Bem-estar': ['bem-estar', 'wellness', 'bem estar'],
    // Consumo
    'Beleza': ['beleza', 'cosmético', 'cosmetico', 'beauty'],
    'Moda': ['moda', 'vestuário', 'vestuario', 'fashion', 'roupa'],
    'Alimentos': ['alimento', 'food', 'comida', 'bebida'],
    'Pet': ['pet', 'animal de estimação'],
    'Varejo': ['varejo', 'retail', 'loja'],
    'Supermercados': ['supermercado', 'supermarket'],
    'Restaurantes': ['restaurante', 'food service'],
    // Agro
    'Insumos': ['insumo', 'input'],
    'Fertilizantes': ['fertilizante', 'adubo'],
    'Sementes': ['semente', 'seed'],
    'Defensivos': ['defensivo', 'agroquímico', 'agroquimico'],
    'Nutrição Animal': ['nutrição animal', 'nutricao animal', 'ração', 'racao'],
    'Biológicos': ['biológico', 'biologico', 'bio'],
    // Educação
    'Ensino Básico': ['ensino básico', 'ensino basico', 'fundamental', 'médio'],
    'Ensino Superior': ['ensino superior', 'universidade', 'faculdade'],
    'Cursos Livres': ['curso livre', 'cursos livres', 'profissionalizante'],
    'Idiomas': ['idioma', 'inglês', 'ingles', 'language'],
    // Serviços
    'BPO': ['bpo', 'terceirização', 'terceirizacao', 'outsourcing'],
    'Facilities': ['facilities', 'facility', 'predial'],
    'Segurança': ['segurança', 'seguranca', 'security', 'vigilância'],
    'Logística': ['logística', 'logistica', 'transporte', 'frete'],
    'Consultoria': ['consultoria', 'consulting'],
    // Financeiro
    'Meios de Pagamento': ['pagamento', 'payment', 'adquirência', 'adquirencia'],
    'Crédito': ['crédito', 'credito', 'lending', 'empréstimo'],
    'Seguros': ['seguro', 'insurance'],
    'Corretora': ['corretora', 'broker'],
    'Gestão de Ativos': ['asset management', 'gestão de ativos'],
    // Infraestrutura
    'Saneamento': ['saneamento', 'água', 'agua', 'esgoto'],
    'Energia': ['energia', 'energy', 'elétric', 'eletric'],
    'Energia Renovável': ['renovável', 'renovavel', 'solar', 'eólica', 'eolica'],
    'Telecom': ['telecom', 'telecomunicaç'],
    'Data Center': ['data center', 'datacenter'],
  }

  const textoLower = texto.toLowerCase()

  // Procurar cada segmento conhecido
  for (const [segmento, keywords] of Object.entries(segmentosConhecidos)) {
    for (const keyword of keywords) {
      if (textoLower.includes(keyword)) {
        if (!segmentos.includes(segmento)) {
          segmentos.push(segmento)
        }
        break
      }
    }
  }

  return segmentos
}

/**
 * Extrai setores principais (macro) do texto
 */
function extrairSetores(texto: string): string[] {
  if (!texto) return []

  const textoLower = texto.toLowerCase()
  const setoresEncontrados: string[] = []

  // Mapear para nomes padronizados de setores macro
  if (textoLower.includes('tech') || textoLower.includes('software') || textoLower.includes('saas') ||
      textoLower.includes('digital') || textoLower.includes('ti ') || textoLower.includes('tecnologia')) {
    setoresEncontrados.push('Tecnologia')
  }
  if (textoLower.includes('saúde') || textoLower.includes('saude') || textoLower.includes('health') ||
      textoLower.includes('hospital') || textoLower.includes('clínica') || textoLower.includes('clinica') ||
      textoLower.includes('médic') || textoLower.includes('medic')) {
    setoresEncontrados.push('Saúde')
  }
  if (textoLower.includes('consumo') || textoLower.includes('consumer') || textoLower.includes('varejo') ||
      textoLower.includes('retail') || textoLower.includes('cpg')) {
    setoresEncontrados.push('Consumo')
  }
  if (textoLower.includes('agro') || textoLower.includes('agri') || textoLower.includes('rural') ||
      textoLower.includes('fazenda') || textoLower.includes('agrícola') || textoLower.includes('agricola')) {
    setoresEncontrados.push('Agronegócio')
  }
  if (textoLower.includes('educa') || textoLower.includes('ensino') || textoLower.includes('escola') ||
      textoLower.includes('universidade') || textoLower.includes('faculdade')) {
    setoresEncontrados.push('Educação')
  }
  if (textoLower.includes('serviço') || textoLower.includes('servico') || textoLower.includes('service') ||
      textoLower.includes('b2b') || textoLower.includes('bpo')) {
    setoresEncontrados.push('Serviços')
  }
  if (textoLower.includes('infra') || textoLower.includes('saneamento') || textoLower.includes('energia') ||
      textoLower.includes('utilities')) {
    setoresEncontrados.push('Infraestrutura')
  }
  if (textoLower.includes('financ') || textoLower.includes('fintech') || textoLower.includes('banking') ||
      textoLower.includes('banco') || textoLower.includes('seguro') || textoLower.includes('pagamento')) {
    setoresEncontrados.push('Serv. Financeiros')
  }
  if (textoLower.includes('industr') || textoLower.includes('manufatura') || textoLower.includes('fábrica') ||
      textoLower.includes('fabrica')) {
    setoresEncontrados.push('Industrial')
  }
  if (textoLower.includes('logist') || textoLower.includes('logíst') || textoLower.includes('transporte') ||
      textoLower.includes('frete')) {
    setoresEncontrados.push('Logística')
  }
  if (textoLower.includes('real estate') || textoLower.includes('imobili') || textoLower.includes('imóve') ||
      textoLower.includes('imove') || textoLower.includes('propriedade')) {
    setoresEncontrados.push('Real Estate')
  }
  if (textoLower.includes('telecom') || textoLower.includes('telecomunica')) {
    setoresEncontrados.push('Telecom')
  }

  return [...new Set(setoresEncontrados)]
}

/**
 * Extrai dados de fundos do Excel
 */
export function extractFundosData(excelData: ExcelData): FundoData[] {
  // Procura pela primeira aba que tenha dados
  const fundosSheet = excelData.sheets.find(s => {
    const name = s.sheetName.toLowerCase()
    return name.includes('fundo') ||
           name.includes('target') ||
           name.includes('pe') ||
           name.includes('gestor')
  }) || excelData.sheets[0]

  if (!fundosSheet || fundosSheet.rows.length === 0) return []

  const headers = fundosSheet.headers

  console.log('=== HEADERS ENCONTRADOS ===')
  console.log(headers)

  return fundosSheet.rows.map((row, index): FundoData => {
    // Nome do fundo
    const nome = getRowValue(row, headers, 'Fundo', 'Nome', 'Nome do Fundo') ||
                 row['__col_0'] || row['__col_1'] || `Fundo ${index + 1}`

    // Ticket (coluna específica) - extrair valor monetário do texto
    const ticketRaw = getRowValue(row, headers, 'Ticket', 'Ticket Médio', 'Cheque')
    const ticketMedio = extrairTicket(String(ticketRaw || '')) || String(ticketRaw || '').trim()

    // Tipo ideal de deal/empresa
    const tipoIdeal = getRowValue(row, headers, 'Tipo ideal', 'Tipo de deal', 'Deal ideal', 'Tipo ideal de deal')

    // Setores de maior interesse - este campo contém os segmentos detalhados
    const setoresRaw = getRowValue(row, headers, 'Setores', 'Setores de maior interesse', 'Setor', 'Interesse')
    const setoresTexto = String(setoresRaw || '')

    // Extrair setores macro e segmentos específicos
    const setoresExtraidos = extrairSetores(setoresTexto)
    const segmentosExtraidos = extrairSegmentosDeInteresse(setoresTexto)

    // Tentar extrair faturamento mínimo do texto de setores ou ticket
    const faturamentoMinimo = extrairFaturamentoMinimo(setoresTexto) ||
                              extrairFaturamentoMinimo(String(ticketRaw || ''))

    // Portfolio
    const portfolio = getRowValue(row, headers, 'Portfolio', 'Portfólio', 'Empresas')

    // Contatos
    const contato = getRowValue(row, headers, 'Contatos chave', 'Contato', 'Contatos', 'Responsável')
    const telefone = getRowValue(row, headers, 'Telefone', 'Tel', 'Phone', 'Celular')
    const email = getRowValue(row, headers, 'E-mail', 'Email', 'Mail', 'E-Mail')

    // Log para debug do primeiro fundo
    if (index === 0) {
      console.log('=== PRIMEIRO FUNDO MAPEADO ===')
      console.log({
        nome,
        ticketMedio,
        tipoIdeal,
        setoresTexto,
        setoresExtraidos,
        segmentosExtraidos,
        faturamentoMinimo,
        portfolio,
        contato,
        telefone,
        email
      })
    }

    return {
      id: `fundo-${index + 1}`,
      nome: String(nome).trim(),
      setores: setoresExtraidos,
      segmentos: segmentosExtraidos, // Segmentos específicos/subsetores
      ticketMedio: ticketMedio || undefined,
      faturamentoMinimo: faturamentoMinimo || undefined,
      dealIdeal: String(tipoIdeal || '').trim() || undefined,
      portfolio: String(portfolio || '').trim() || undefined,
      contato: String(contato || '').trim() || undefined,
      telefone: String(telefone || '').trim() || undefined,
      email: String(email || '').trim() || undefined,
    }
  }).filter(fundo => {
    const nomeValido = fundo.nome &&
                       fundo.nome.trim() !== '' &&
                       !fundo.nome.startsWith('Fundo ') &&
                       fundo.nome !== 'undefined' &&
                       fundo.nome.toLowerCase() !== 'fundo'
    return nomeValido
  })
}

/**
 * Extrai dados de investidas/add-ons do Excel
 */
export function extractInvestidasData(excelData: ExcelData): InvestidaData[] {
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
