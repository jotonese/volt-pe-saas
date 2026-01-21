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

// Dados de exemplo
const fundosExemplo: FundoData[] = [
  {
    id: '1',
    nome: 'Pátria Investimentos',
    tipoFundo: 'PE',
    contato: 'João Silva',
    email: 'joao@patria.com',
    telefone: '(11) 3000-0001',
  },
  {
    id: '2',
    nome: 'Vinci Partners',
    tipoFundo: 'PE',
    contato: 'Maria Santos',
    email: 'maria@vinci.com',
    telefone: '(11) 3000-0002',
  },
  {
    id: '3',
    nome: 'Advent International',
    tipoFundo: 'PE',
    contato: 'Carlos Mendes',
    email: 'carlos@advent.com',
    telefone: '(11) 3000-0003',
  },
  {
    id: '4',
    nome: 'Warburg Pincus',
    tipoFundo: 'PE',
    contato: 'Ana Costa',
    email: 'ana@warburg.com',
    telefone: '(11) 3000-0004',
  },
  {
    id: '5',
    nome: 'GP Investments',
    tipoFundo: 'PE',
    contato: 'Pedro Lima',
    email: 'pedro@gp.com.br',
    telefone: '(11) 3000-0005',
  },
  {
    id: '6',
    nome: 'Kinea Investimentos',
    tipoFundo: 'PE',
    contato: 'Lucia Ferreira',
    email: 'lucia@kinea.com.br',
    telefone: '(11) 3000-0006',
  },
  {
    id: '7',
    nome: 'Kaszek Ventures',
    tipoFundo: 'VC',
    contato: 'Fernando Oliveira',
    email: 'fernando@kaszek.com',
    telefone: '(11) 3000-0007',
  },
  {
    id: '8',
    nome: 'Monashees',
    tipoFundo: 'VC',
    contato: 'Renata Costa',
    email: 'renata@monashees.com',
    telefone: '(11) 3000-0008',
  },
  {
    id: '9',
    nome: 'BTG Pactual Wealth',
    tipoFundo: 'Wealth',
    contato: 'Ricardo Nunes',
    email: 'ricardo@btg.com',
    telefone: '(11) 3000-0009',
  },
  {
    id: '10',
    nome: 'Família Safra',
    tipoFundo: 'Family Office',
    contato: 'Alberto Safra',
    email: 'contato@safra.com',
    telefone: '(11) 3000-0010',
  },
]

const interacoesExemplo: InteracaoData[] = [
  // Pátria Investimentos - Exemplo com histórico real
  {
    id: '1a',
    fundoId: '1',
    fundoNome: 'Pátria Investimentos',
    data: '15/02/2025',
    hora: '14:00',
    participantes: ['João Silva', 'Henrique Faria'],
    resumo: 'Não mudou. Ainda têm metade do fundo disponível. Continuam focados em tech e saúde.',
    criterios: {
      ticketMedio: 'R$ 150-500mi',
      ebitdaMinimo: 'R$ 50-150mi',
      faturamentoMinimo: 'R$ 200-500mi',
      dealIdeal: 'Controle ou Minoritário Relevante',
      posicao: 'Majoritário',
      setores: ['Tecnologia', 'Saúde', 'Consumo'],
      disponibilidadeFundo: 'Metade do fundo disponível',
    },
  },
  {
    id: '1b',
    fundoId: '1',
    fundoNome: 'Pátria Investimentos',
    data: '10/03/2024',
    hora: '09:00',
    participantes: ['João Silva'],
    resumo: 'R$ 150-500mi. Estão ainda com 2/3 do fundo disponível. Interesse em empresas de SaaS B2B.',
    criterios: {
      ticketMedio: 'R$ 150-500mi',
      ebitdaMinimo: 'R$ 40-100mi',
      setores: ['Tecnologia', 'Saúde'],
      disponibilidadeFundo: '2/3 do fundo disponível',
    },
  },
  {
    id: '1c',
    fundoId: '1',
    fundoNome: 'Pátria Investimentos',
    data: '20/02/2023',
    hora: '10:00',
    participantes: ['João Silva', 'Maria Santos'],
    resumo: 'Não mudou. Estão no começo do Fundo V, com bastante dinheiro para investir.',
    criterios: {
      disponibilidadeFundo: 'Começo do Fundo V, bastante capital',
    },
  },
  {
    id: '1d',
    fundoId: '1',
    fundoNome: 'Pátria Investimentos',
    data: '15/05/2022',
    hora: '11:00',
    participantes: ['João Silva'],
    resumo: 'R$ 100-500mi. Foco em tecnologia e healthtech.',
    criterios: {
      ticketMedio: 'R$ 100-500mi',
    },
  },
  // Vinci Partners
  {
    id: '2a',
    fundoId: '2',
    fundoNome: 'Vinci Partners',
    data: '18/01/2025',
    hora: '10:00',
    participantes: ['Carlos Mendes', 'Ana Costa', 'Kaique Ortega'],
    resumo: 'Não mudou. Continuam com foco em saúde e educação. Fundo com 60% disponível.',
    criterios: {
      ticketMedio: 'R$ 100-300mi',
      ebitdaMinimo: 'R$ 30-80mi',
      faturamentoMinimo: 'R$ 150-400mi',
      dealIdeal: 'Controle',
      posicao: 'Majoritário',
      setores: ['Saúde', 'Educação', 'Serviços'],
      disponibilidadeFundo: '60% do fundo disponível',
    },
  },
  {
    id: '2b',
    fundoId: '2',
    fundoNome: 'Vinci Partners',
    data: '05/11/2024',
    hora: '14:00',
    participantes: ['Carlos Mendes'],
    resumo: 'R$ 100-300mi. Interesse em clínicas especializadas e desospitalização. Começando novo fundo.',
    criterios: {
      ticketMedio: 'R$ 100-300mi',
      ebitdaMinimo: 'R$ 30-80mi',
      disponibilidadeFundo: 'Novo fundo recém captado',
    },
  },
  // Advent International - Formato similar ao exemplo do usuário
  {
    id: '3a',
    fundoId: '3',
    fundoNome: 'Advent International',
    data: '17/01/2025',
    hora: '09:30',
    participantes: ['Emiliano', 'Rodrigo'],
    resumo: 'Não mudou. Ainda têm metade do fundo disponível.',
    criterios: {
      ticketMedio: 'USD 50-70mi (sweet spot)',
      ebitdaMinimo: 'R$ 15-20mi',
      dealIdeal: 'Controle',
      posicao: 'Majoritário',
      setores: ['Tecnologia', 'Serv. Financeiros', 'Consumo'],
      disponibilidadeFundo: 'Metade do fundo disponível',
    },
  },
  {
    id: '3b',
    fundoId: '3',
    fundoNome: 'Advent International',
    data: '10/03/2024',
    hora: '10:00',
    participantes: ['Emiliano'],
    resumo: 'R$ 150-500mi. Estão ainda com 2/3 do fundo disponível.',
    criterios: {
      ticketMedio: 'R$ 150-500mi',
      disponibilidadeFundo: '2/3 do fundo disponível',
    },
  },
  {
    id: '3c',
    fundoId: '3',
    fundoNome: 'Advent International',
    data: '15/05/2022',
    hora: '14:00',
    participantes: ['Emiliano'],
    resumo: 'R$ 100-500mi',
    criterios: {
      ticketMedio: 'R$ 100-500mi',
    },
  },
  {
    id: '3d',
    fundoId: '3',
    fundoNome: 'Advent International',
    data: '20/04/2019',
    hora: '11:00',
    participantes: ['Emiliano'],
    resumo: 'USD 30mi de mínimo.',
    criterios: {
      ticketMedio: 'USD 30mi mínimo',
    },
  },
  {
    id: '3e',
    fundoId: '3',
    fundoNome: 'Advent International',
    data: '10/12/2016',
    hora: '15:00',
    participantes: ['Emiliano'],
    resumo: 'Mínimo USD 30mi.',
    criterios: {
      ticketMedio: 'USD 30mi mínimo',
    },
  },
  {
    id: '3f',
    fundoId: '3',
    fundoNome: 'Advent International',
    data: '30/11/2015',
    hora: '10:00',
    participantes: ['Emiliano', 'Rodrigo'],
    resumo: 'Sweet spot USD 50-70mi, mínimo de USD 25mi (pode ser menor, tipo USD 10mi, se tiver um pipeline concreto de M&A). Com co-investidores conseguem fazer tickets de USD 200-300mi. O fundo captado em 2014 tem USD 600mi, com a maior parte ainda para investir. EBITDA mínimo de R$ 15-20 milhões.',
    criterios: {
      ticketMedio: 'USD 50-70mi (sweet spot), mínimo USD 25mi',
      ebitdaMinimo: 'R$ 15-20mi',
      disponibilidadeFundo: 'Fundo USD 600mi, maior parte disponível',
    },
  },
  {
    id: '3g',
    fundoId: '3',
    fundoNome: 'Advent International',
    data: '16/12/2013',
    hora: '14:00',
    participantes: ['Emiliano'],
    resumo: 'Pelo menos USD 25-30 milhões, sem máximo. Geralmente fazem até USD 100mi, mas pode ser mais.',
    criterios: {
      ticketMedio: 'USD 25-100mi',
    },
  },
  // Warburg Pincus
  {
    id: '4a',
    fundoId: '4',
    fundoNome: 'Warburg Pincus',
    data: '15/01/2025',
    hora: '11:00',
    participantes: ['Lucia Ferreira', 'José Braga'],
    resumo: 'Não mudou, mesmo com o câmbio atual. Interesse em cybersecurity e IoT.',
    criterios: {
      ticketMedio: 'R$ 200-600mi',
      ebitdaMinimo: 'R$ 60-180mi',
      faturamentoMinimo: 'R$ 300-800mi',
      dealIdeal: 'Minoritário Relevante ou Controle',
      posicao: 'Minoritário',
      setores: ['Tecnologia', 'Saúde'],
      disponibilidadeFundo: '70% disponível',
    },
  },
  {
    id: '4b',
    fundoId: '4',
    fundoNome: 'Warburg Pincus',
    data: '20/05/2024',
    hora: '10:00',
    participantes: ['Lucia Ferreira'],
    resumo: 'R$ 200-600mi. Novo fundo captado recentemente.',
    criterios: {
      ticketMedio: 'R$ 200-600mi',
      disponibilidadeFundo: 'Novo fundo, quase todo disponível',
    },
  },
  // GP Investments
  {
    id: '5a',
    fundoId: '5',
    fundoNome: 'GP Investments',
    data: '12/01/2025',
    hora: '16:00',
    participantes: ['Roberto Carlos'],
    resumo: 'Continuam com R$ 150-400mi. Fundo com 1/3 já investido.',
    criterios: {
      ticketMedio: 'R$ 150-400mi',
      ebitdaMinimo: 'R$ 40-120mi',
      faturamentoMinimo: 'R$ 200-600mi',
      dealIdeal: 'Controle',
      posicao: 'Majoritário',
      setores: ['Infraestrutura', 'Agronegócio', 'Varejo'],
      disponibilidadeFundo: '2/3 do fundo disponível',
    },
  },
  // Kinea Investimentos
  {
    id: '6a',
    fundoId: '6',
    fundoNome: 'Kinea Investimentos',
    data: '10/01/2025',
    hora: '14:30',
    participantes: ['Marcelo Giufrida', 'Sérgio Luconi'],
    resumo: 'Não mudou. Interesse em biometano e transição energética.',
    criterios: {
      ticketMedio: 'R$ 100-250mi',
      ebitdaMinimo: 'R$ 25-70mi',
      faturamentoMinimo: 'R$ 100-300mi',
      dealIdeal: 'Minoritário ou Controle',
      posicao: 'Minoritário',
      setores: ['Agronegócio', 'Infraestrutura'],
      disponibilidadeFundo: 'Metade do fundo disponível',
    },
  },
  // Kaszek Ventures (VC)
  {
    id: '7a',
    fundoId: '7',
    fundoNome: 'Kaszek Ventures',
    data: '08/01/2025',
    hora: '15:00',
    participantes: ['Fernando Oliveira'],
    resumo: 'US$ 5-50mi. Foco em Series A-C. Bastante capital disponível.',
    criterios: {
      ticketMedio: 'US$ 5-50mi',
      faturamentoMinimo: '> R$ 10mi',
      dealIdeal: 'Series A-C',
      posicao: 'Minoritário',
      setores: ['Tecnologia', 'Fintech', 'SaaS'],
      disponibilidadeFundo: 'Bastante capital disponível',
    },
  },
  // Monashees (VC)
  {
    id: '8a',
    fundoId: '8',
    fundoNome: 'Monashees',
    data: '05/01/2025',
    hora: '11:00',
    participantes: ['Renata Costa'],
    resumo: 'US$ 3-30mi. Seed a Series B. Novo fundo captado em 2024.',
    criterios: {
      ticketMedio: 'US$ 3-30mi',
      faturamentoMinimo: '> R$ 5mi',
      dealIdeal: 'Seed a Series B',
      posicao: 'Minoritário',
      setores: ['Tecnologia', 'E-commerce', 'Healthtech'],
      disponibilidadeFundo: 'Novo fundo 2024, maior parte disponível',
    },
  },
  // BTG Pactual Wealth
  {
    id: '9a',
    fundoId: '9',
    fundoNome: 'BTG Pactual Wealth',
    data: '03/01/2025',
    hora: '10:00',
    participantes: ['Ricardo Nunes'],
    resumo: 'R$ 50-200mi. Co-investimentos em real estate e infraestrutura.',
    criterios: {
      ticketMedio: 'R$ 50-200mi',
      ebitdaMinimo: 'R$ 15-50mi',
      faturamentoMinimo: 'R$ 80-250mi',
      dealIdeal: 'Co-investimento',
      posicao: 'Minoritário',
      setores: ['Diversos', 'Real Estate', 'Infraestrutura'],
      disponibilidadeFundo: 'Capital sempre disponível (wealth)',
    },
  },
  // Família Safra
  {
    id: '10a',
    fundoId: '10',
    fundoNome: 'Família Safra',
    data: '02/01/2025',
    hora: '09:00',
    participantes: ['Alberto Safra'],
    resumo: 'R$ 100-500mi. Interesse em agronegócio e serviços financeiros.',
    criterios: {
      ticketMedio: 'R$ 100-500mi',
      ebitdaMinimo: 'R$ 30-100mi',
      faturamentoMinimo: 'R$ 150-500mi',
      dealIdeal: 'Direto ou Co-investimento',
      posicao: 'Minoritário',
      setores: ['Agronegócio', 'Real Estate', 'Serv. Financeiros'],
      disponibilidadeFundo: 'Capital sempre disponível (family office)',
    },
  },
]

// Dados de exemplo de portfolio
const portfolioExemplo: PortfolioEmpresa[] = [
  // Pátria Investimentos
  {
    id: 'p1',
    fundoId: '1',
    fundoNome: 'Pátria Investimentos',
    nome: 'Smartfit',
    setor: 'Saúde',
    anoInvestimento: 2019,
    status: 'Ativo',
    descricao: 'Maior rede de academias da América Latina',
    buscandoAddOn: true,
    segmentosAddOn: ['Academias regionais', 'Studios especializados', 'Wellness'],
    ticketAddOn: 'R$ 30-100mi',
  },
  {
    id: 'p2',
    fundoId: '1',
    fundoNome: 'Pátria Investimentos',
    nome: 'Viveo',
    setor: 'Saúde',
    anoInvestimento: 2020,
    status: 'Ativo',
    descricao: 'Distribuição de produtos médico-hospitalares',
    buscandoAddOn: true,
    segmentosAddOn: ['Distribuidoras regionais', 'Equipamentos médicos'],
    ticketAddOn: 'R$ 50-200mi',
  },
  {
    id: 'p3',
    fundoId: '1',
    fundoNome: 'Pátria Investimentos',
    nome: 'Arco Educação',
    setor: 'Educação',
    anoInvestimento: 2018,
    status: 'Saída',
    descricao: 'Plataforma de educação básica',
  },
  // Vinci Partners
  {
    id: 'p4',
    fundoId: '2',
    fundoNome: 'Vinci Partners',
    nome: 'Rede D\'Or',
    setor: 'Saúde',
    anoInvestimento: 2017,
    status: 'Ativo',
    descricao: 'Maior rede de hospitais privados do Brasil',
    buscandoAddOn: true,
    segmentosAddOn: ['Hospitais regionais', 'Clínicas especializadas', 'Laboratórios'],
    ticketAddOn: 'R$ 100-500mi',
  },
  {
    id: 'p5',
    fundoId: '2',
    fundoNome: 'Vinci Partners',
    nome: 'Cogna',
    setor: 'Educação',
    anoInvestimento: 2016,
    status: 'Ativo',
    descricao: 'Grupo educacional (Kroton, Anhanguera)',
    buscandoAddOn: false,
  },
  // Advent International
  {
    id: 'p6',
    fundoId: '3',
    fundoNome: 'Advent International',
    nome: 'Igma',
    setor: 'Tecnologia',
    anoInvestimento: 2021,
    status: 'Ativo',
    descricao: 'Consultoria de design e tecnologia',
    buscandoAddOn: true,
    segmentosAddOn: ['Agências digitais', 'Consultorias de UX', 'Estúdios de design'],
    ticketAddOn: 'R$ 20-80mi',
  },
  {
    id: 'p7',
    fundoId: '3',
    fundoNome: 'Advent International',
    nome: 'Clearwater Analytics',
    setor: 'Tecnologia',
    anoInvestimento: 2020,
    status: 'Ativo',
    descricao: 'Software de gestão de investimentos',
    buscandoAddOn: true,
    segmentosAddOn: ['Fintechs de analytics', 'Software financeiro'],
    ticketAddOn: 'USD 30-100mi',
  },
  // Warburg Pincus
  {
    id: 'p8',
    fundoId: '4',
    fundoNome: 'Warburg Pincus',
    nome: 'Stone',
    setor: 'Fintech',
    anoInvestimento: 2018,
    status: 'Saída',
    descricao: 'Adquirência e serviços financeiros',
  },
  {
    id: 'p9',
    fundoId: '4',
    fundoNome: 'Warburg Pincus',
    nome: 'Loft',
    setor: 'Real Estate',
    anoInvestimento: 2020,
    status: 'Ativo',
    descricao: 'Proptech para compra e venda de imóveis',
    buscandoAddOn: true,
    segmentosAddOn: ['Imobiliárias digitais', 'Fintechs imobiliárias'],
    ticketAddOn: 'R$ 50-150mi',
  },
  // GP Investments
  {
    id: 'p10',
    fundoId: '5',
    fundoNome: 'GP Investments',
    nome: 'BRK Ambiental',
    setor: 'Infraestrutura',
    anoInvestimento: 2019,
    status: 'Ativo',
    descricao: 'Saneamento básico',
    buscandoAddOn: true,
    segmentosAddOn: ['Empresas de saneamento regionais', 'Tratamento de água'],
    ticketAddOn: 'R$ 100-300mi',
  },
  {
    id: 'p11',
    fundoId: '5',
    fundoNome: 'GP Investments',
    nome: 'Ri Happy',
    setor: 'Varejo',
    anoInvestimento: 2017,
    status: 'Ativo',
    descricao: 'Varejo de brinquedos',
    buscandoAddOn: false,
  },
  // Kinea Investimentos
  {
    id: 'p12',
    fundoId: '6',
    fundoNome: 'Kinea Investimentos',
    nome: 'FS Bioenergia',
    setor: 'Agronegócio',
    anoInvestimento: 2021,
    status: 'Ativo',
    descricao: 'Produção de etanol de milho',
    buscandoAddOn: true,
    segmentosAddOn: ['Usinas de etanol', 'Biogás', 'Biometano'],
    ticketAddOn: 'R$ 50-150mi',
  },
  // Kaszek Ventures
  {
    id: 'p13',
    fundoId: '7',
    fundoNome: 'Kaszek Ventures',
    nome: 'Nubank',
    setor: 'Fintech',
    anoInvestimento: 2014,
    status: 'Ativo',
    descricao: 'Banco digital',
    buscandoAddOn: false,
  },
  {
    id: 'p14',
    fundoId: '7',
    fundoNome: 'Kaszek Ventures',
    nome: 'Creditas',
    setor: 'Fintech',
    anoInvestimento: 2017,
    status: 'Ativo',
    descricao: 'Plataforma de crédito com garantia',
    buscandoAddOn: true,
    segmentosAddOn: ['Fintechs de crédito', 'Correspondentes bancários'],
    ticketAddOn: 'US$ 10-50mi',
  },
  // Monashees
  {
    id: 'p15',
    fundoId: '8',
    fundoNome: 'Monashees',
    nome: '99',
    setor: 'Tecnologia',
    anoInvestimento: 2015,
    status: 'Saída',
    descricao: 'Aplicativo de mobilidade (vendido para Didi)',
  },
  {
    id: 'p16',
    fundoId: '8',
    fundoNome: 'Monashees',
    nome: 'Gympass',
    setor: 'Healthtech',
    anoInvestimento: 2016,
    status: 'Ativo',
    descricao: 'Plataforma de bem-estar corporativo',
    buscandoAddOn: false,
  },
  // BTG Pactual Wealth
  {
    id: 'p17',
    fundoId: '9',
    fundoNome: 'BTG Pactual Wealth',
    nome: 'Vamos (Locação de caminhões)',
    setor: 'Infraestrutura',
    anoInvestimento: 2020,
    status: 'Ativo',
    descricao: 'Locação de caminhões e máquinas',
    buscandoAddOn: true,
    segmentosAddOn: ['Locadoras regionais', 'Frotas especializadas'],
    ticketAddOn: 'R$ 30-100mi',
  },
  // Família Safra
  {
    id: 'p18',
    fundoId: '10',
    fundoNome: 'Família Safra',
    nome: 'Banco Safra',
    setor: 'Serv. Financeiros',
    anoInvestimento: 1955,
    status: 'Ativo',
    descricao: 'Banco comercial e private banking',
    buscandoAddOn: false,
  },
  {
    id: 'p19',
    fundoId: '10',
    fundoNome: 'Família Safra',
    nome: 'JS Holding',
    setor: 'Real Estate',
    anoInvestimento: 2010,
    status: 'Ativo',
    descricao: 'Investimentos imobiliários',
    buscandoAddOn: true,
    segmentosAddOn: ['Empreendimentos comerciais', 'Galpões logísticos'],
    ticketAddOn: 'R$ 50-200mi',
  },
]

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
