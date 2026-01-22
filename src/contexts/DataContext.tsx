'use client'

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from 'react'

// Chave para localStorage
const STORAGE_KEY = 'volt_pe_data'

// Tipos de fundo
export type TipoFundo = 'PE' | 'VC' | 'Wealth' | 'Family Office' | 'Outros'

// Critérios do fundo (informações coletadas nas interações)
export type CriteriosFundo = {
  ticketMedio?: string
  ebitdaMinimo?: string
  faturamentoMinimo?: string
  dealIdeal?: string
  posicao?: string
  setores?: string[]
  disponibilidadeFundo?: string // Ex: "metade do fundo disponível", "2/3 disponível"
}

// Tipo de interação
export type InteracaoData = {
  id: string
  fundoId: string
  fundoNome: string
  data: string // DD/MM/YYYY
  hora: string
  participantes: string[]
  resumo: string
  // Critérios atualizados nesta interação
  criterios?: CriteriosFundo
}

// Tipos de dados do fundo
export type FundoData = {
  id: string
  nome: string
  tipoFundo?: TipoFundo
  setor?: string
  setores?: string[]
  ticketMedio?: string
  ticketMin?: string
  ticketMax?: string
  ebitdaMinimo?: string
  faturamentoMinimo?: string
  dealIdeal?: string
  posicao?: string // Minoritário, Majoritário, Controle
  chequeMinimo?: number
  chequeMaximo?: number
  segmentos?: string[]
  numGestores?: number
  contato?: string
  email?: string
  telefone?: string
  website?: string
  ultimaReuniao?: string
  portfolio?: string
  [key: string]: any
}

export type InvestidaData = {
  id: string
  setor: string
  numInvestidas: number
  segmentos: string[]
  [key: string]: any
}

export type TransacaoData = {
  id: string
  data?: string
  target?: string
  buyer?: string
  dealValue?: string | number
  setor?: string
  [key: string]: any
}

// Empresa do portfolio de um fundo
export type PortfolioEmpresa = {
  id: string
  fundoId: string
  fundoNome: string
  nome: string
  setor: string
  anoInvestimento?: number
  status: 'Ativo' | 'Saída' | 'Em processo de saída'
  descricao?: string
  buscandoAddOn?: boolean
  segmentosAddOn?: string[] // Segmentos que a empresa busca para add-on
  ticketAddOn?: string // Ticket para add-ons
  website?: string
}

export type ImportedData = {
  fundos: FundoData[]
  investidas: InvestidaData[]
  transacoes: TransacaoData[]
  interacoes: InteracaoData[]
  portfolio: PortfolioEmpresa[]
  lastImport?: Date
  fileName?: string
}

// Fundo com dados integrados das interações
export type FundoComInteracoes = FundoData & {
  ultimaInteracao?: InteracaoData
  totalInteracoes: number
  criteriosAtuais?: CriteriosFundo
  disponibilidadeFundo?: string
}

type DataContextType = {
  data: ImportedData
  isLoading: boolean
  error: string | null
  importData: (newData: Partial<ImportedData>, fileName?: string) => void
  clearData: () => void
  hasData: boolean
  // Funções para fundos
  addFundo: (fundo: Omit<FundoData, 'id'>) => string
  updateFundo: (id: string, fundo: Partial<FundoData>) => void
  deleteFundo: (id: string) => void
  // Funções para interações
  addInteracao: (interacao: Omit<InteracaoData, 'id'>) => void
  updateInteracao: (id: string, interacao: Partial<InteracaoData>) => void
  deleteInteracao: (id: string) => void
  getInteracoesByFundo: (fundoId: string) => InteracaoData[]
  // Funções para portfolio
  addPortfolioEmpresa: (empresa: Omit<PortfolioEmpresa, 'id'>) => void
  updatePortfolioEmpresa: (id: string, empresa: Partial<PortfolioEmpresa>) => void
  deletePortfolioEmpresa: (id: string) => void
  // Funções para fundos integrados
  getFundosComInteracoes: () => FundoComInteracoes[]
  getFundoComInteracoes: (fundoId: string) => FundoComInteracoes | undefined
  // Export para Excel
  exportToExcel: () => void
}

const defaultData: ImportedData = {
  fundos: [],
  investidas: [],
  transacoes: [],
  interacoes: [],
  portfolio: [],
}

// Arrays vazios - dados serão adicionados pelo usuário
const fundosExemplo: FundoData[] = []

const interacoesExemplo: InteracaoData[] = []

const portfolioExemplo: PortfolioEmpresa[] = []

// Função para converter data DD/MM/YYYY para objeto Date
function parseData(data: string): Date {
  const [dia, mes, ano] = data.split('/').map(Number)
  return new Date(ano, mes - 1, dia)
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ImportedData>({
    ...defaultData,
    fundos: fundosExemplo,
    interacoes: interacoesExemplo,
    portfolio: portfolioExemplo,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  // Carregar dados do localStorage ao iniciar
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY)
      if (savedData) {
        const parsed = JSON.parse(savedData)
        setData(prev => ({
          ...prev,
          fundos: parsed.fundos || fundosExemplo,
          interacoes: parsed.interacoes || interacoesExemplo,
          portfolio: parsed.portfolio || portfolioExemplo,
          investidas: parsed.investidas || [],
          transacoes: parsed.transacoes || [],
        }))
      }
    } catch (err) {
      console.error('Erro ao carregar dados do localStorage:', err)
    }
    setIsHydrated(true)
  }, [])

  // Salvar dados no localStorage sempre que mudar
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          fundos: data.fundos,
          interacoes: data.interacoes,
          portfolio: data.portfolio,
          investidas: data.investidas,
          transacoes: data.transacoes,
        }))
      } catch (err) {
        console.error('Erro ao salvar dados no localStorage:', err)
      }
    }
  }, [data, isHydrated])

  const importData = useCallback((newData: Partial<ImportedData>, fileName?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      setData(prev => ({
        ...prev,
        ...newData,
        lastImport: new Date(),
        fileName,
      }))
    } catch (err) {
      setError('Erro ao importar dados')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearData = useCallback(() => {
    setData({
      ...defaultData,
      fundos: fundosExemplo,
      interacoes: interacoesExemplo,
      portfolio: portfolioExemplo,
    })
    setError(null)
    // Limpar localStorage também
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (err) {
      console.error('Erro ao limpar localStorage:', err)
    }
  }, [])

  // Adicionar fundo
  const addFundo = useCallback((fundo: Omit<FundoData, 'id'>): string => {
    const newId = `fundo_${Date.now()}`
    setData(prev => ({
      ...prev,
      fundos: [...prev.fundos, { ...fundo, id: newId }],
    }))
    return newId
  }, [])

  // Atualizar fundo
  const updateFundo = useCallback((id: string, updates: Partial<FundoData>) => {
    setData(prev => ({
      ...prev,
      fundos: prev.fundos.map(f =>
        f.id === id ? { ...f, ...updates } : f
      ),
    }))
  }, [])

  // Deletar fundo
  const deleteFundo = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      fundos: prev.fundos.filter(f => f.id !== id),
      interacoes: prev.interacoes.filter(int => int.fundoId !== id),
      portfolio: prev.portfolio.filter(p => p.fundoId !== id),
    }))
  }, [])

  // Adicionar interação
  const addInteracao = useCallback((interacao: Omit<InteracaoData, 'id'>) => {
    const newId = `int_${Date.now()}`
    setData(prev => ({
      ...prev,
      interacoes: [{ ...interacao, id: newId }, ...prev.interacoes],
    }))
  }, [])

  // Atualizar interação
  const updateInteracao = useCallback((id: string, updates: Partial<InteracaoData>) => {
    setData(prev => ({
      ...prev,
      interacoes: prev.interacoes.map(int =>
        int.id === id ? { ...int, ...updates } : int
      ),
    }))
  }, [])

  // Deletar interação
  const deleteInteracao = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      interacoes: prev.interacoes.filter(int => int.id !== id),
    }))
  }, [])

  // Obter interações por fundo
  const getInteracoesByFundo = useCallback((fundoId: string) => {
    return data.interacoes
      .filter(int => int.fundoId === fundoId)
      .sort((a, b) => parseData(b.data).getTime() - parseData(a.data).getTime())
  }, [data.interacoes])

  // Adicionar empresa ao portfolio
  const addPortfolioEmpresa = useCallback((empresa: Omit<PortfolioEmpresa, 'id'>) => {
    const newId = `port_${Date.now()}`
    setData(prev => ({
      ...prev,
      portfolio: [...prev.portfolio, { ...empresa, id: newId }],
    }))
  }, [])

  // Atualizar empresa do portfolio
  const updatePortfolioEmpresa = useCallback((id: string, updates: Partial<PortfolioEmpresa>) => {
    setData(prev => ({
      ...prev,
      portfolio: prev.portfolio.map(p =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }))
  }, [])

  // Deletar empresa do portfolio
  const deletePortfolioEmpresa = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      portfolio: prev.portfolio.filter(p => p.id !== id),
    }))
  }, [])

  // Obter fundos com dados integrados das interações
  const getFundosComInteracoes = useCallback((): FundoComInteracoes[] => {
    return data.fundos.map(fundo => {
      const interacoesFundo = data.interacoes
        .filter(int => int.fundoId === fundo.id)
        .sort((a, b) => parseData(b.data).getTime() - parseData(a.data).getTime())

      const ultimaInteracao = interacoesFundo[0]

      // Buscar os critérios mais recentes (da última interação que tem critérios)
      let criteriosAtuais: CriteriosFundo | undefined
      for (const interacao of interacoesFundo) {
        if (interacao.criterios) {
          criteriosAtuais = interacao.criterios
          break
        }
      }

      return {
        ...fundo,
        // Sobrescrever com dados das interações se existirem
        ticketMedio: criteriosAtuais?.ticketMedio || fundo.ticketMedio,
        ebitdaMinimo: criteriosAtuais?.ebitdaMinimo || fundo.ebitdaMinimo,
        faturamentoMinimo: criteriosAtuais?.faturamentoMinimo || fundo.faturamentoMinimo,
        dealIdeal: criteriosAtuais?.dealIdeal || fundo.dealIdeal,
        posicao: criteriosAtuais?.posicao || fundo.posicao,
        setores: criteriosAtuais?.setores || fundo.setores,
        disponibilidadeFundo: criteriosAtuais?.disponibilidadeFundo,
        ultimaInteracao,
        totalInteracoes: interacoesFundo.length,
        criteriosAtuais,
      }
    })
  }, [data.fundos, data.interacoes])

  // Obter um fundo específico com interações
  const getFundoComInteracoes = useCallback((fundoId: string): FundoComInteracoes | undefined => {
    const fundos = getFundosComInteracoes()
    return fundos.find(f => f.id === fundoId)
  }, [getFundosComInteracoes])

  // Exportar dados para Excel (backup)
  const exportToExcel = useCallback(async () => {
    try {
      const XLSX = await import('xlsx')

      // Preparar dados dos fundos
      const fundosSheet = data.fundos.map(f => ({
        'Nome': f.nome,
        'Tipo': f.tipoFundo || '',
        'Contato': f.contato || '',
        'Email': f.email || '',
        'Telefone': f.telefone || '',
        'Website': f.website || '',
        'Setores': f.setores?.join(', ') || '',
      }))

      // Preparar dados das interações
      const interacoesSheet = data.interacoes.map(i => ({
        'Fundo': i.fundoNome,
        'Data': i.data,
        'Hora': i.hora,
        'Participantes': i.participantes.join(', '),
        'Resumo': i.resumo,
        'Ticket Médio': i.criterios?.ticketMedio || '',
        'EBITDA Mínimo': i.criterios?.ebitdaMinimo || '',
        'Faturamento Mínimo': i.criterios?.faturamentoMinimo || '',
        'Deal Ideal': i.criterios?.dealIdeal || '',
        'Posição': i.criterios?.posicao || '',
        'Setores': i.criterios?.setores?.join(', ') || '',
        'Disponibilidade': i.criterios?.disponibilidadeFundo || '',
      }))

      // Preparar dados do portfolio
      const portfolioSheet = data.portfolio.map(p => ({
        'Fundo': p.fundoNome,
        'Empresa': p.nome,
        'Setor': p.setor,
        'Ano Investimento': p.anoInvestimento || '',
        'Status': p.status,
        'Descrição': p.descricao || '',
        'Buscando Add-on': p.buscandoAddOn ? 'Sim' : 'Não',
        'Segmentos Add-on': p.segmentosAddOn?.join(', ') || '',
        'Ticket Add-on': p.ticketAddOn || '',
      }))

      // Criar workbook
      const wb = XLSX.utils.book_new()

      const wsFundos = XLSX.utils.json_to_sheet(fundosSheet)
      XLSX.utils.book_append_sheet(wb, wsFundos, 'Fundos')

      const wsInteracoes = XLSX.utils.json_to_sheet(interacoesSheet)
      XLSX.utils.book_append_sheet(wb, wsInteracoes, 'Interações')

      const wsPortfolio = XLSX.utils.json_to_sheet(portfolioSheet)
      XLSX.utils.book_append_sheet(wb, wsPortfolio, 'Portfolio')

      // Gerar e baixar arquivo
      const date = new Date().toISOString().split('T')[0]
      XLSX.writeFile(wb, `Volt_PE_Backup_${date}.xlsx`)
    } catch (err) {
      console.error('Erro ao exportar Excel:', err)
      setError('Erro ao exportar dados para Excel')
    }
  }, [data])

  const hasData = data.fundos.length > 0 || data.investidas.length > 0 || data.transacoes.length > 0 || data.interacoes.length > 0

  return (
    <DataContext.Provider value={{
      data,
      isLoading,
      error,
      importData,
      clearData,
      hasData,
      addFundo,
      updateFundo,
      deleteFundo,
      addInteracao,
      updateInteracao,
      deleteInteracao,
      getInteracoesByFundo,
      addPortfolioEmpresa,
      updatePortfolioEmpresa,
      deletePortfolioEmpresa,
      getFundosComInteracoes,
      getFundoComInteracoes,
      exportToExcel,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
