// Tipos principais do sistema

export type Setor = {
  id: string
  nome: string
  icone: string
  cor: string
}

export type FundoPE = {
  id: string
  nome: string
  website?: string
  aum_total?: number
  contato_nome?: string
  contato_email?: string
  contato_telefone?: string
  notas?: string
  ultima_reuniao?: string
  created_at: string
  updated_at: string
}

export type CriterioInvestimento = {
  id: string
  fundo_id: string
  setor_id: string
  setor?: Setor
  faturamento_minimo?: number
  cheque_minimo?: number
  cheque_maximo?: number
  segmentos_interesse: string[]
  tipo: 'novo_investimento' | 'add_on'
  ativo: boolean
}

export type Investida = {
  id: string
  fundo_id: string
  fundo?: FundoPE
  nome: string
  setor_id: string
  setor?: Setor
  segmentos_busca: string[]
  faturamento_minimo?: number
  cheque_minimo?: number
  cheque_maximo?: number
  ativo: boolean
}

export type Transacao = {
  id: string
  data_anuncio: string
  target_nome: string
  target_logo?: string
  buyer_nome: string
  buyer_logo?: string
  deal_value?: number
  setor_id: string
  setor?: Setor
  fonte?: string
}

export type EmpresaListada = {
  id: string
  ticker: string
  nome: string
  setor_id: string
  setor?: Setor
}

export type CotacaoHistorica = {
  id: string
  empresa_id: string
  data: string
  preco: number
  variacao_dia: number
  variacao_acumulada: number
}

export type MultiploMercado = {
  id: string
  empresa_id: string
  ano: number
  multiplo_ebitda?: number
  multiplo_pl?: number
}

export type TipoInteracao = 'reuniao_presencial' | 'video_call' | 'email' | 'telefone'

export type Interacao = {
  id: string
  fundo_id: string
  fundo?: FundoPE
  tipo: TipoInteracao
  data: string
  participantes: string[]
  resumo?: string
  proximos_passos?: string
  usuario_id?: string
}

export type StatusPipeline =
  | 'identificada'
  | 'contato_inicial'
  | 'em_analise'
  | 'nda_assinado'
  | 'due_diligence'
  | 'negociacao'
  | 'fechada'
  | 'perdida'

export type Pipeline = {
  id: string
  empresa_nome: string
  setor_id: string
  setor?: Setor
  faturamento?: number
  ebitda?: number
  status: StatusPipeline
  fundo_interessado_id?: string
  fundo_interessado?: FundoPE
  data_entrada: string
  notas?: string
}

// Tipos para o resumo do dashboard
export type DashboardStats = {
  totalFundos: number
  totalInvestidas: number
  pipelineAtivo: number
  ultimasInteracoes: Interacao[]
}

// Tipos para importação de Excel
export type FundoExcel = {
  nome: string
  setor: string
  segmentos: string
  faturamento_minimo: string
  cheque_minimo: string
  cheque_maximo: string
  num_gestores: number
}

export type InvestidaExcel = {
  setor: string
  num_investidas: number
  segmentos: string
}

// Constantes de setores
export const SETORES: Omit<Setor, 'id'>[] = [
  { nome: 'Tecnologia', icone: 'Monitor', cor: '#3B82F6' },
  { nome: 'Saúde', icone: 'Heart', cor: '#EF4444' },
  { nome: 'Consumo', icone: 'ShoppingCart', cor: '#F59E0B' },
  { nome: 'Serviços Financeiros', icone: 'DollarSign', cor: '#10B981' },
  { nome: 'Agronegócio', icone: 'Wheat', cor: '#84CC16' },
  { nome: 'Educação', icone: 'GraduationCap', cor: '#8B5CF6' },
  { nome: 'Serviços', icone: 'Briefcase', cor: '#6366F1' },
  { nome: 'Varejo', icone: 'Store', cor: '#EC4899' },
  { nome: 'Infraestrutura', icone: 'Building2', cor: '#64748B' },
  { nome: 'Economia Circular', icone: 'Recycle', cor: '#22C55E' },
  { nome: 'Telecom', icone: 'Wifi', cor: '#06B6D4' },
  { nome: 'Distribuição', icone: 'Truck', cor: '#F97316' },
]

export const STATUS_PIPELINE_LABELS: Record<StatusPipeline, string> = {
  identificada: 'Identificada',
  contato_inicial: 'Contato Inicial',
  em_analise: 'Em Análise',
  nda_assinado: 'NDA Assinado',
  due_diligence: 'Due Diligence',
  negociacao: 'Negociação',
  fechada: 'Fechada',
  perdida: 'Perdida',
}

export const STATUS_PIPELINE_COLORS: Record<StatusPipeline, string> = {
  identificada: 'bg-gray-100 text-gray-800',
  contato_inicial: 'bg-blue-100 text-blue-800',
  em_analise: 'bg-yellow-100 text-yellow-800',
  nda_assinado: 'bg-purple-100 text-purple-800',
  due_diligence: 'bg-orange-100 text-orange-800',
  negociacao: 'bg-indigo-100 text-indigo-800',
  fechada: 'bg-green-100 text-green-800',
  perdida: 'bg-red-100 text-red-800',
}
