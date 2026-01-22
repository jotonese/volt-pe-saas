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
 * Extrai a informação mais recente de uma célula de texto com múltiplas datas
 * Formato: "02/25: info aqui. 03/24: outra info. 05/22: info mais antiga"
 */
function extrairInfoMaisRecente(texto: string): string {
  if (!texto) return ''

  // Padrão para encontrar datas no formato MM/YY: ou MM/YYYY:
  const pattern = /(\d{2}\/\d{2,4}):\s*/g
  const matches = [...texto.matchAll(pattern)]

  if (matches.length === 0) {
    // Não tem padrão de data, retornar texto completo
    return texto
  }

  // Pegar a primeira entrada (mais recente)
  const firstMatch = matches[0]
  const startIndex = firstMatch.index! + firstMatch[0].length

  // Encontrar onde termina (próxima data ou fim)
  let endIndex = texto.length
  if (matches.length > 1) {
    endIndex = matches[1].index!
  }

  return texto.substring(startIndex, endIndex).trim()
}

/**
 * Extrai valores monetários de um texto (R$ X-Ymi, USD Xmi, etc)
 * Retorna o valor encontrado na informação mais recente
 */
function extrairValorMonetario(texto: string): string | undefined {
  if (!texto) return undefined

  // Primeiro, pegar a info mais recente
  const infoRecente = extrairInfoMaisRecente(texto)

  // Padrões para encontrar valores monetários
  const patterns = [
    // R$ 100-300 mi, R$ 100 a 300 mi
    /R\$\s*(\d+(?:[.,]\d+)?)\s*[-–a]\s*(\d+(?:[.,]\d+)?)\s*(?:mi|milhões|M\b)/gi,
    // USD 50-100mi, US$ 50-100mi
    /(?:USD|US\$)\s*(\d+(?:[.,]\d+)?)\s*[-–a]\s*(\d+(?:[.,]\d+)?)\s*(?:mi|milhões|M\b)/gi,
    // R$ 100 mi, R$ 100 milhões
    /R\$\s*(\d+(?:[.,]\d+)?)\s*(?:mi|milhões|M\b)/gi,
    // USD 50mi, US$ 50mi
    /(?:USD|US\$)\s*(\d+(?:[.,]\d+)?)\s*(?:mi|milhões|M\b)/gi,
    // R$ 3,6 bi
    /R\$\s*(\d+(?:[.,]\d+)?)\s*(?:bi|bilhões|B\b)/gi,
    // Cheques de R$ 100 mi
    /cheques?\s+(?:de\s+)?R\$\s*(\d+(?:[.,]\d+)?)\s*(?:mi|milhões)/gi,
    // Tickets R$ 100-150 milhões
    /tickets?\s+(?:de\s+)?R\$\s*(\d+(?:[.,]\d+)?)\s*[-–a]?\s*(\d+(?:[.,]\d+)?)?\s*(?:mi|milhões)/gi,
  ]

  for (const pattern of patterns) {
    const match = infoRecente.match(pattern)
    if (match && match[0]) {
      return match[0].trim()
    }
  }

  // Se não encontrou na info recente, buscar no texto completo
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

  const infoRecente = extrairInfoMaisRecente(texto)
  const textos = [infoRecente, texto]

  for (const t of textos) {
    // Padrões para faturamento
    const faturamentoPatterns = [
      /fat(?:uramento)?\s*(?:mín(?:imo)?|de|acima de|>|maior que|líquido)?\s*(?:de|deve ser maior que)?\s*(R\$\s*\d+(?:[.,]\d+)?\s*(?:[-–a]\s*\d+(?:[.,]\d+)?)?\s*(?:mi|milhões|M\b))/gi,
      /faturamento\s+(?:mínimo\s+)?(?:de\s+)?(R\$\s*\d+(?:[.,]\d+)?)/gi,
      /EBITDA\s*(?:mínimo)?\s*(?:de)?\s*(R\$\s*\d+(?:[.,]\d+)?(?:\s*[-–a]\s*\d+(?:[.,]\d+)?)?\s*(?:mi|milhões)?)/gi,
    ]

    for (const pattern of faturamentoPatterns) {
      const match = t.match(pattern)
      if (match && match[1]) {
        return match[1].trim()
      }
    }
  }

  return undefined
}

/**
 * Extrai ticket/cheque de um texto de conversa
 */
function extrairTicket(texto: string): string | undefined {
  if (!texto) return undefined

  const infoRecente = extrairInfoMaisRecente(texto)

  // Primeiro tentar extrair da info mais recente
  let valor = extrairValorMonetario(infoRecente)
  if (valor) return valor

  // Se não, do texto completo
  return extrairValorMonetario(texto)
}

/**
 * Extrai segmentos de interesse de um texto de conversa
 * Retorna array de segmentos específicos mencionados
 */
function extrairSegmentosDeInteresse(texto: string): string[] {
  if (!texto) return []

  const segmentos: string[] = []
  const textoLower = texto.toLowerCase()

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
    'Agtech': ['agtech', 'ag tech', 'agrotech', 'agrotecnologia'],
    'Logtech': ['logtech', 'log tech'],
    'HRtech': ['hrtech', 'hr tech'],
    'Legaltech': ['legaltech', 'legal tech'],
    'Insurtech': ['insurtech', 'insur tech'],
    'Govtech': ['govtech', 'gov tech'],
    'Marketplace': ['marketplace'],
    'E-commerce': ['e-commerce', 'ecommerce', 'comércio eletrônico'],
    'Cloud': ['cloud', 'nuvem'],
    'IA/ML': ['inteligência artificial', ' ia ', ' ai ', 'machine learning', ' ml '],
    'Data Analytics': ['analytics', 'data analytics', 'big data'],
    'ERP': [' erp ', 'gestão empresarial'],
    'CRM': [' crm '],
    'Software': ['software', 'sistemas'],
    'TMT': [' tmt ', 'tecnologia, mídia'],
    'Fibra Ótica': ['fibra', 'fibra ótica', 'provedores internet'],
    // Saúde
    'Hospitais': ['hospital', 'hospitais', 'hospitalar'],
    'Clínicas': ['clínica', 'clinica', 'clínicas'],
    'Laboratórios': ['laboratório', 'laboratorio', 'lab de', 'labs de', 'medicina diagnóstica'],
    'Diagnóstico': ['diagnóstico', 'diagnostico', 'diagnose'],
    'Farmacêutico': ['farmacêutic', 'farmaceutic', 'pharma', 'medicamento'],
    'Equipamentos Médicos': ['equipamento médico', 'equipamentos médicos', 'dispositivos médicos'],
    'Dental/Odonto': ['dental', 'odonto', 'odontológic'],
    'Oftalmologia': ['oftalmolog', 'oftalmologia'],
    'Oncologia': ['oncolog', 'oncologia'],
    'Veterinário': ['veterinár', 'veterinario', 'pet health', 'animal health', 'saúde animal'],
    'Bem-estar/Wellness': ['bem-estar', 'wellness', 'bem estar', 'saudabilidade'],
    'Nutrição Clínica': ['nutrição clínica', 'nutricao clinica'],
    // Consumo
    'Beleza/Cosméticos': ['beleza', 'cosmético', 'cosmetico', 'beauty', 'hpc', 'personal care'],
    'Moda': ['moda', 'vestuário', 'vestuario', 'fashion'],
    'Alimentos': ['alimento', 'food', 'comida', 'bebida'],
    'Alimentos Saudáveis': ['alimento saudável', 'alimentação saudável', 'saudáveis'],
    'Pet': ['pet ', 'animal de estimação', 'ração animal'],
    'Varejo': ['varejo', 'retail'],
    'Varejo Alimentar': ['varejo alimentar', 'supermercado', 'atacarejo'],
    'Supermercados': ['supermercado', 'supermarket'],
    'Restaurantes': ['restaurante', 'food service', 'catering'],
    'Chocolates/Doces': ['chocolate', 'doces', 'confeitos'],
    'Suplementos/Vitaminas': ['suplemento', 'vitamina', 'minerais'],
    // Agro
    'Agronegócio': ['agronegócio', 'agro ', 'agribusiness'],
    'Insumos Agrícolas': ['insumo', 'input agrícola', 'distribuição de insumos'],
    'Fertilizantes': ['fertilizante', 'adubo', 'nutrientes foliares'],
    'Bioinsumos': ['bioinsumo', 'biológico', 'biodefensivo', 'defensivo biológico'],
    'Defensivos': ['defensivo', 'agroquímico', 'agroquimico'],
    'Sementes': ['semente', 'seed'],
    'Nutrição Animal': ['nutrição animal', 'nutricao animal', 'ração'],
    'Pecuária': ['pecuária', 'pecuaria', 'gado', 'leiteira'],
    'Pós-colheita': ['pós-colheita', 'pos-colheita', 'armazenagem'],
    // Educação
    'Educação': ['educação', 'educacao', 'ensino'],
    'Ensino Básico/K-12': ['ensino básico', 'ensino basico', 'k-12', 'k12', 'fundamental', 'educação básica'],
    'Ensino Superior': ['ensino superior', 'universidade', 'faculdade', 'ies'],
    'Cursos Livres': ['curso livre', 'cursos livres', 'profissionalizante', 'técnico'],
    'Idiomas': ['idioma', 'inglês', 'ingles', 'language'],
    'EAD': [' ead ', 'ensino a distância', 'educação a distância'],
    // Serviços
    'BPO': [' bpo ', 'terceirização', 'terceirizacao', 'outsourcing'],
    'Facilities': ['facilities', 'facility', 'predial', 'manutenção'],
    'Segurança': ['segurança patrimonial', 'seguranca', 'security', 'vigilância'],
    'Logística': ['logística', 'logistica', 'transporte', 'frete'],
    'Consultoria': ['consultoria', 'consulting'],
    'Locação/Rental': ['locação', 'rental', 'aluguel de equipamento'],
    // Financeiro
    'Serviços Financeiros': ['serviço financeiro', 'financial service', 'serviços financeiros'],
    'Meios de Pagamento': ['pagamento', 'payment', 'adquirência', 'adquirencia'],
    'Crédito': ['crédito', 'credito', 'lending', 'empréstimo'],
    'Seguros': ['seguro', 'insurance'],
    'Corretora': ['corretora', 'broker'],
    'Gestão de Ativos': ['asset management', 'gestão de ativos', 'gestão de recursos'],
    'Consórcios': ['consórcio', 'consorcio'],
    'Previdência': ['previdência', 'previdencia'],
    // Infraestrutura
    'Saneamento': ['saneamento', 'água', 'esgoto'],
    'Energia': ['energia', 'energy', 'elétric', 'eletric'],
    'Energia Renovável': ['renovável', 'renovavel', 'solar', 'eólica', 'eolica', 'fotovoltaica'],
    'Geração Distribuída': ['geração distribuída', 'geracao distribuida'],
    'Telecom': ['telecom', 'telecomunicaç'],
    'Data Center': ['data center', 'datacenter'],
    'Infraestrutura': ['infraestrutura', 'infra '],
    // Industrial
    'Industrial': ['industrial', 'industrials', 'manufatura', 'fábrica'],
    'Embalagens': ['embalagem', 'embalagens'],
    'Materiais de Construção': ['material de construção', 'materiais de construção', 'construção civil'],
    'Autopeças': ['autopeça', 'autopeca', 'autopeças'],
    'Químicos': ['químic', 'quimic', 'chemical'],
    // Outros
    'Real Estate': ['real estate', 'imobili', 'imóve'],
    'Mineração': ['mineração', 'mineracao', 'mining'],
    'Smart Cities': ['smart city', 'smart cities', 'cidade inteligente'],
    'ESG': [' esg ', 'sustentabilidade', 'economia circular'],
    'Bioeconomia': ['bioeconomia', 'bio economia'],
    'Carbono': ['carbono', 'crédito de carbono'],
  }

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
      textoLower.includes('digital') || textoLower.includes('ti ') || textoLower.includes('tecnologia') ||
      textoLower.includes('tmt')) {
    setoresEncontrados.push('Tecnologia')
  }
  if (textoLower.includes('saúde') || textoLower.includes('saude') || textoLower.includes('health') ||
      textoLower.includes('hospital') || textoLower.includes('clínica') || textoLower.includes('clinica') ||
      textoLower.includes('médic') || textoLower.includes('medic') || textoLower.includes('diagnóstic') ||
      textoLower.includes('farmac') || textoLower.includes('oncolog')) {
    setoresEncontrados.push('Saúde')
  }
  if (textoLower.includes('consumo') || textoLower.includes('consumer') || textoLower.includes('varejo') ||
      textoLower.includes('retail') || textoLower.includes('cpg') || textoLower.includes('alimento') ||
      textoLower.includes('beleza') || textoLower.includes('moda')) {
    setoresEncontrados.push('Consumo')
  }
  if (textoLower.includes('agro') || textoLower.includes('agri') || textoLower.includes('rural') ||
      textoLower.includes('fazenda') || textoLower.includes('agrícola') || textoLower.includes('agricola') ||
      textoLower.includes('pecuár') || textoLower.includes('bioinsumo')) {
    setoresEncontrados.push('Agronegócio')
  }
  if (textoLower.includes('educa') || textoLower.includes('ensino') || textoLower.includes('escola') ||
      textoLower.includes('universidade') || textoLower.includes('faculdade') || textoLower.includes('ead')) {
    setoresEncontrados.push('Educação')
  }
  if (textoLower.includes('serviço') || textoLower.includes('servico') || textoLower.includes('service') ||
      textoLower.includes('b2b') || textoLower.includes('bpo') || textoLower.includes('facilities') ||
      textoLower.includes('terceirização')) {
    setoresEncontrados.push('Serviços')
  }
  if (textoLower.includes('infra') || textoLower.includes('saneamento') || textoLower.includes('energia') ||
      textoLower.includes('utilities') || textoLower.includes('telecom')) {
    setoresEncontrados.push('Infraestrutura')
  }
  if (textoLower.includes('financ') || textoLower.includes('fintech') || textoLower.includes('banking') ||
      textoLower.includes('banco') || textoLower.includes('seguro') || textoLower.includes('pagamento') ||
      textoLower.includes('crédito')) {
    setoresEncontrados.push('Serv. Financeiros')
  }
  if (textoLower.includes('industr') || textoLower.includes('manufatura') || textoLower.includes('fábrica') ||
      textoLower.includes('fabrica') || textoLower.includes('embalagem') || textoLower.includes('químic')) {
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

  return [...new Set(setoresEncontrados)]
}

/**
 * Extrai tipo de deal ideal (controle, minoritário, etc)
 */
function extrairTipoDeal(texto: string): string | undefined {
  if (!texto) return undefined

  const infoRecente = extrairInfoMaisRecente(texto)
  const textoLower = infoRecente.toLowerCase()

  const tipos: string[] = []

  if (textoLower.includes('controle') || textoLower.includes('100%')) {
    tipos.push('Controle')
  }
  if (textoLower.includes('minoritár') || textoLower.includes('minoritario')) {
    tipos.push('Minoritário')
  }
  if (textoLower.includes('majoritár') || textoLower.includes('majoritario')) {
    tipos.push('Majoritário')
  }
  if (textoLower.includes('growth') || textoLower.includes('late stage')) {
    tipos.push('Growth')
  }
  if (textoLower.includes('vc') || textoLower.includes('venture') || textoLower.includes('seed') || textoLower.includes('series a')) {
    tipos.push('VC')
  }

  return tipos.length > 0 ? tipos.join(', ') : undefined
}

/**
 * Extrai empresas do portfolio mencionadas
 */
function extrairPortfolio(texto: string): string[] {
  if (!texto) return []

  // Pegar nomes de empresas do texto (geralmente antes de parênteses ou entre vírgulas)
  const empresas: string[] = []

  // Padrão: Nome (descrição), Nome2 (descrição2)
  const pattern = /([A-Z][A-Za-zÀ-ÿ\s&\-\.]+?)(?:\s*\([^)]+\))?(?:,|;|\.|$)/g
  let match

  while ((match = pattern.exec(texto)) !== null) {
    const nome = match[1].trim()
    // Filtrar palavras muito curtas ou que não parecem nomes de empresa
    if (nome.length > 2 && !nome.match(/^(Add|Para|Mas|Das|São|Não|Que|Com|Por|Uma|Tem|Ver|Sim|Já|etc)$/i)) {
      empresas.push(nome)
    }
  }

  return empresas.slice(0, 15) // Limitar a 15 empresas
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
                 row['__col_0'] || `Fundo ${index + 1}`

    // Ticket (coluna específica) - extrair valor monetário do texto
    const ticketRaw = getRowValue(row, headers, 'Ticket', 'Ticket Médio', 'Cheque')
    const ticketMedio = extrairTicket(String(ticketRaw || ''))

    // Tipo ideal de deal/empresa
    const tipoIdealRaw = getRowValue(row, headers, 'Tipo ideal', 'Tipo de deal', 'Deal ideal', 'Tipo ideal de deal')
    const tipoIdeal = extrairTipoDeal(String(tipoIdealRaw || ''))

    // Setores de maior interesse - este campo contém os segmentos detalhados
    const setoresRaw = getRowValue(row, headers, 'Setores', 'Setores de maior interesse', 'Setor', 'Interesse', 'restrições')
    const setoresTexto = String(setoresRaw || '')

    // Extrair setores macro e segmentos específicos
    const setoresExtraidos = extrairSetores(setoresTexto)
    const segmentosExtraidos = extrairSegmentosDeInteresse(setoresTexto)

    // Tentar extrair faturamento mínimo do texto de setores ou tipo ideal
    const faturamentoMinimo = extrairFaturamentoMinimo(setoresTexto) ||
                              extrairFaturamentoMinimo(String(tipoIdealRaw || '')) ||
                              extrairFaturamentoMinimo(String(ticketRaw || ''))

    // Portfolio
    const portfolioRaw = getRowValue(row, headers, 'Portfolio', 'Portfólio', 'Empresas')
    const portfolioEmpresas = extrairPortfolio(String(portfolioRaw || ''))

    // Contatos
    const contato = getRowValue(row, headers, 'Contatos chave', 'Contato', 'Contatos', 'Responsável')
    const telefone = getRowValue(row, headers, 'Telefone', 'Tel', 'Phone', 'Celular')
    const email = getRowValue(row, headers, 'E-mail', 'Email', 'Mail', 'E-Mail')

    // Log para debug do primeiro fundo
    if (index < 3) {
      console.log(`=== FUNDO ${index + 1}: ${nome} ===`)
      console.log({
        ticketMedio,
        tipoIdeal,
        setoresExtraidos,
        segmentosExtraidos: segmentosExtraidos.slice(0, 10),
        faturamentoMinimo,
      })
    }

    return {
      id: `fundo-${index + 1}`,
      nome: String(nome).trim(),
      setores: setoresExtraidos,
      segmentos: segmentosExtraidos,
      ticketMedio: ticketMedio || undefined,
      faturamentoMinimo: faturamentoMinimo || undefined,
      dealIdeal: tipoIdeal || undefined,
      portfolio: portfolioEmpresas.join(', ') || undefined,
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
