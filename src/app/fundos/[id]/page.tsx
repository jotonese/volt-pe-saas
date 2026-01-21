'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useData, TipoFundo, CriteriosFundo, InteracaoData, PortfolioEmpresa } from '@/contexts/DataContext'
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
  DollarSign,
  TrendingUp,
  BarChart3,
  Target,
  Briefcase,
  Wallet,
  Calendar,
  Clock,
  Users,
  MessageSquare,
  Plus,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Edit3,
  Trash2,
  Check,
} from 'lucide-react'

const tipoCor: Record<TipoFundo, string> = {
  'PE': 'bg-blue-100 text-blue-700',
  'VC': 'bg-purple-100 text-purple-700',
  'Wealth': 'bg-green-100 text-green-700',
  'Family Office': 'bg-amber-100 text-amber-700',
  'Outros': 'bg-slate-100 text-slate-700',
}

const tiposFundo: TipoFundo[] = ['PE', 'VC', 'Wealth', 'Family Office', 'Outros']

const setoresBase = [
  'Tecnologia', 'Saúde', 'Consumo', 'Serv. Financeiros', 'Agronegócio',
  'Educação', 'Serviços', 'Varejo', 'Infraestrutura', 'Industrial',
  'Logística', 'Energia', 'Fintech', 'SaaS', 'E-commerce', 'Healthtech',
  'Real Estate', 'Circular'
]

const posicoesDisponiveis = ['Majoritário', 'Minoritário', 'Controle', 'Minoritário Relevante', 'Co-investimento']

export default function FundoDetalhePage() {
  const params = useParams()
  const router = useRouter()
  const fundoId = params.id as string

  const {
    getFundoComInteracoes,
    getInteracoesByFundo,
    addInteracao,
    updateInteracao,
    deleteInteracao,
    updateFundo,
    addPortfolioEmpresa,
    updatePortfolioEmpresa,
    deletePortfolioEmpresa,
    data,
  } = useData()

  const fundo = getFundoComInteracoes(fundoId)
  const interacoes = getInteracoesByFundo(fundoId)
  const portfolioFundo = data.portfolio.filter(p => p.fundoId === fundoId)

  // Flag para controlar se o estado inicial já foi carregado
  const [initialLoaded, setInitialLoaded] = useState(false)

  // Estado para edição do fundo
  const [editandoFundo, setEditandoFundo] = useState(false)
  const [dadosFundo, setDadosFundo] = useState({
    nome: '',
    tipoFundo: 'PE' as TipoFundo,
    contato: '',
    email: '',
    telefone: '',
    website: '',
    setores: [] as string[],
    ticketMedio: '',
    ebitdaMinimo: '',
    faturamentoMinimo: '',
    dealIdeal: '',
    posicao: '',
    disponibilidadeFundo: '',
  })
  const [novoSetorCustom, setNovoSetorCustom] = useState('')

  // Estado para nova interação
  const [showNovaInteracao, setShowNovaInteracao] = useState(false)
  const [novaInteracao, setNovaInteracao] = useState({
    data: new Date().toLocaleDateString('pt-BR'),
    hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    participantes: '',
    resumo: '',
    ticketMedio: '',
    ebitdaMinimo: '',
    faturamentoMinimo: '',
    dealIdeal: '',
    posicao: '',
    setores: [] as string[],
    disponibilidadeFundo: '',
  })
  const [showCriterios, setShowCriterios] = useState(false)

  // Estado para edição de interação
  const [editandoInteracaoId, setEditandoInteracaoId] = useState<string | null>(null)
  const [interacaoEditando, setInteracaoEditando] = useState<{
    data: string
    hora: string
    participantes: string
    resumo: string
    ticketMedio: string
    ebitdaMinimo: string
    faturamentoMinimo: string
    dealIdeal: string
    posicao: string
    setores: string[]
    disponibilidadeFundo: string
  } | null>(null)

  // Mensagem de sucesso
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Estado para nova empresa do portfolio
  const [showNovaEmpresa, setShowNovaEmpresa] = useState(false)
  const [novaEmpresa, setNovaEmpresa] = useState({
    nome: '',
    setor: '',
    anoInvestimento: '',
    status: 'Ativo' as 'Ativo' | 'Saída' | 'Em processo de saída',
    descricao: '',
    buscandoAddOn: false,
    segmentosAddOn: '',
    ticketAddOn: '',
    website: '',
  })

  // Estado para edição de empresa do portfolio
  const [editandoEmpresaId, setEditandoEmpresaId] = useState<string | null>(null)
  const [empresaEditando, setEmpresaEditando] = useState<{
    nome: string
    setor: string
    anoInvestimento: string
    status: 'Ativo' | 'Saída' | 'Em processo de saída'
    descricao: string
    buscandoAddOn: boolean
    segmentosAddOn: string
    ticketAddOn: string
    website: string
  } | null>(null)

  // Carregar dados do fundo apenas uma vez quando o componente monta
  useEffect(() => {
    if (!initialLoaded && fundo) {
      setDadosFundo({
        nome: fundo.nome || '',
        tipoFundo: fundo.tipoFundo || 'PE',
        contato: fundo.contato || '',
        email: fundo.email || '',
        telefone: fundo.telefone || '',
        website: fundo.website || '',
        setores: fundo.setores || [],
        ticketMedio: fundo.ticketMedio || '',
        ebitdaMinimo: fundo.ebitdaMinimo || '',
        faturamentoMinimo: fundo.faturamentoMinimo || '',
        dealIdeal: fundo.dealIdeal || '',
        posicao: fundo.posicao || '',
        disponibilidadeFundo: fundo.disponibilidadeFundo || '',
      })
      setInitialLoaded(true)
    }
  }, [fundo, initialLoaded])

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  if (!fundo) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header title="Fundo não encontrado" />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <Building2 className="h-16 w-16 mx-auto text-slate-300" />
            <h2 className="mt-4 text-xl font-semibold">Fundo não encontrado</h2>
            <p className="mt-2 text-slate-500">O fundo solicitado não existe ou foi removido.</p>
            <Button className="mt-4" onClick={() => router.push('/fundos')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Fundos
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Handlers para edição do fundo
  const handleSalvarFundo = () => {
    updateFundo(fundoId, {
      nome: dadosFundo.nome,
      tipoFundo: dadosFundo.tipoFundo,
      contato: dadosFundo.contato || undefined,
      email: dadosFundo.email || undefined,
      telefone: dadosFundo.telefone || undefined,
      website: dadosFundo.website || undefined,
      setores: dadosFundo.setores.length > 0 ? dadosFundo.setores : undefined,
      ticketMedio: dadosFundo.ticketMedio || undefined,
      ebitdaMinimo: dadosFundo.ebitdaMinimo || undefined,
      faturamentoMinimo: dadosFundo.faturamentoMinimo || undefined,
      dealIdeal: dadosFundo.dealIdeal || undefined,
      posicao: dadosFundo.posicao || undefined,
    })
    setEditandoFundo(false)
    showSuccess('Fundo atualizado com sucesso!')
  }

  const handleAddSetorFundo = (setor: string) => {
    if (!dadosFundo.setores.includes(setor)) {
      setDadosFundo(prev => ({ ...prev, setores: [...prev.setores, setor] }))
    }
  }

  const handleRemoveSetorFundo = (setor: string) => {
    setDadosFundo(prev => ({ ...prev, setores: prev.setores.filter(s => s !== setor) }))
  }

  const handleAddSetorCustomFundo = () => {
    const setor = novoSetorCustom.trim()
    if (setor && !dadosFundo.setores.includes(setor)) {
      setDadosFundo(prev => ({ ...prev, setores: [...prev.setores, setor] }))
      setNovoSetorCustom('')
    }
  }

  // Handlers para nova interação
  const handleSalvarInteracao = () => {
    if (!novaInteracao.resumo.trim()) {
      alert('Por favor, adicione um resumo da interação')
      return
    }

    const criterios: CriteriosFundo | undefined = (
      novaInteracao.ticketMedio ||
      novaInteracao.ebitdaMinimo ||
      novaInteracao.faturamentoMinimo ||
      novaInteracao.dealIdeal ||
      novaInteracao.posicao ||
      novaInteracao.setores.length > 0 ||
      novaInteracao.disponibilidadeFundo
    ) ? {
      ticketMedio: novaInteracao.ticketMedio || undefined,
      ebitdaMinimo: novaInteracao.ebitdaMinimo || undefined,
      faturamentoMinimo: novaInteracao.faturamentoMinimo || undefined,
      dealIdeal: novaInteracao.dealIdeal || undefined,
      posicao: novaInteracao.posicao || undefined,
      setores: novaInteracao.setores.length > 0 ? novaInteracao.setores : undefined,
      disponibilidadeFundo: novaInteracao.disponibilidadeFundo || undefined,
    } : undefined

    addInteracao({
      fundoId: fundoId,
      fundoNome: fundo.nome,
      data: novaInteracao.data,
      hora: novaInteracao.hora,
      participantes: novaInteracao.participantes.split(',').map(p => p.trim()).filter(Boolean),
      resumo: novaInteracao.resumo,
      criterios,
    })

    setNovaInteracao({
      data: new Date().toLocaleDateString('pt-BR'),
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      participantes: '',
      resumo: '',
      ticketMedio: '',
      ebitdaMinimo: '',
      faturamentoMinimo: '',
      dealIdeal: '',
      posicao: '',
      setores: [],
      disponibilidadeFundo: '',
    })
    setShowNovaInteracao(false)
    setShowCriterios(false)
    showSuccess('Interação registrada com sucesso!')
  }

  // Handlers para edição de interação
  const handleIniciarEdicaoInteracao = (interacao: InteracaoData) => {
    setEditandoInteracaoId(interacao.id)
    setInteracaoEditando({
      data: interacao.data,
      hora: interacao.hora,
      participantes: interacao.participantes.join(', '),
      resumo: interacao.resumo,
      ticketMedio: interacao.criterios?.ticketMedio || '',
      ebitdaMinimo: interacao.criterios?.ebitdaMinimo || '',
      faturamentoMinimo: interacao.criterios?.faturamentoMinimo || '',
      dealIdeal: interacao.criterios?.dealIdeal || '',
      posicao: interacao.criterios?.posicao || '',
      setores: interacao.criterios?.setores || [],
      disponibilidadeFundo: interacao.criterios?.disponibilidadeFundo || '',
    })
  }

  const handleSalvarEdicaoInteracao = () => {
    if (!editandoInteracaoId || !interacaoEditando) return

    const criterios: CriteriosFundo | undefined = (
      interacaoEditando.ticketMedio ||
      interacaoEditando.ebitdaMinimo ||
      interacaoEditando.faturamentoMinimo ||
      interacaoEditando.dealIdeal ||
      interacaoEditando.posicao ||
      interacaoEditando.setores.length > 0 ||
      interacaoEditando.disponibilidadeFundo
    ) ? {
      ticketMedio: interacaoEditando.ticketMedio || undefined,
      ebitdaMinimo: interacaoEditando.ebitdaMinimo || undefined,
      faturamentoMinimo: interacaoEditando.faturamentoMinimo || undefined,
      dealIdeal: interacaoEditando.dealIdeal || undefined,
      posicao: interacaoEditando.posicao || undefined,
      setores: interacaoEditando.setores.length > 0 ? interacaoEditando.setores : undefined,
      disponibilidadeFundo: interacaoEditando.disponibilidadeFundo || undefined,
    } : undefined

    updateInteracao(editandoInteracaoId, {
      data: interacaoEditando.data,
      hora: interacaoEditando.hora,
      participantes: interacaoEditando.participantes.split(',').map(p => p.trim()).filter(Boolean),
      resumo: interacaoEditando.resumo,
      criterios,
    })

    setEditandoInteracaoId(null)
    setInteracaoEditando(null)
    showSuccess('Interação atualizada com sucesso!')
  }

  const handleCancelarEdicaoInteracao = () => {
    setEditandoInteracaoId(null)
    setInteracaoEditando(null)
  }

  const handleExcluirInteracao = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta interação?')) {
      deleteInteracao(id)
      showSuccess('Interação excluída!')
    }
  }

  // Handlers para portfolio
  const handleSalvarNovaEmpresa = () => {
    if (!novaEmpresa.nome.trim()) {
      alert('Por favor, adicione o nome da empresa')
      return
    }
    if (!novaEmpresa.setor.trim()) {
      alert('Por favor, adicione o setor da empresa')
      return
    }

    addPortfolioEmpresa({
      fundoId: fundoId,
      fundoNome: fundo.nome,
      nome: novaEmpresa.nome,
      setor: novaEmpresa.setor,
      anoInvestimento: novaEmpresa.anoInvestimento ? parseInt(novaEmpresa.anoInvestimento) : undefined,
      status: novaEmpresa.status,
      descricao: novaEmpresa.descricao || undefined,
      buscandoAddOn: novaEmpresa.buscandoAddOn,
      segmentosAddOn: novaEmpresa.buscandoAddOn && novaEmpresa.segmentosAddOn
        ? novaEmpresa.segmentosAddOn.split(',').map(s => s.trim()).filter(Boolean)
        : undefined,
      ticketAddOn: novaEmpresa.buscandoAddOn && novaEmpresa.ticketAddOn ? novaEmpresa.ticketAddOn : undefined,
      website: novaEmpresa.website || undefined,
    })

    setNovaEmpresa({
      nome: '',
      setor: '',
      anoInvestimento: '',
      status: 'Ativo',
      descricao: '',
      buscandoAddOn: false,
      segmentosAddOn: '',
      ticketAddOn: '',
      website: '',
    })
    setShowNovaEmpresa(false)
    showSuccess('Empresa adicionada ao portfolio!')
  }

  const handleIniciarEdicaoEmpresa = (empresa: PortfolioEmpresa) => {
    setEditandoEmpresaId(empresa.id)
    setEmpresaEditando({
      nome: empresa.nome,
      setor: empresa.setor,
      anoInvestimento: empresa.anoInvestimento?.toString() || '',
      status: empresa.status,
      descricao: empresa.descricao || '',
      buscandoAddOn: empresa.buscandoAddOn || false,
      segmentosAddOn: empresa.segmentosAddOn?.join(', ') || '',
      ticketAddOn: empresa.ticketAddOn || '',
      website: empresa.website || '',
    })
  }

  const handleSalvarEdicaoEmpresa = () => {
    if (!editandoEmpresaId || !empresaEditando) return

    updatePortfolioEmpresa(editandoEmpresaId, {
      nome: empresaEditando.nome,
      setor: empresaEditando.setor,
      anoInvestimento: empresaEditando.anoInvestimento ? parseInt(empresaEditando.anoInvestimento) : undefined,
      status: empresaEditando.status,
      descricao: empresaEditando.descricao || undefined,
      buscandoAddOn: empresaEditando.buscandoAddOn,
      segmentosAddOn: empresaEditando.buscandoAddOn && empresaEditando.segmentosAddOn
        ? empresaEditando.segmentosAddOn.split(',').map(s => s.trim()).filter(Boolean)
        : undefined,
      ticketAddOn: empresaEditando.buscandoAddOn && empresaEditando.ticketAddOn ? empresaEditando.ticketAddOn : undefined,
      website: empresaEditando.website || undefined,
    })

    setEditandoEmpresaId(null)
    setEmpresaEditando(null)
    showSuccess('Empresa atualizada!')
  }

  const handleCancelarEdicaoEmpresa = () => {
    setEditandoEmpresaId(null)
    setEmpresaEditando(null)
  }

  const handleExcluirEmpresa = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta empresa do portfolio?')) {
      deletePortfolioEmpresa(id)
      showSuccess('Empresa excluída do portfolio!')
    }
  }

  const tipoFundo = fundo.tipoFundo || 'Outros'
  const setores = fundo.setores || []

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title={fundo.nome}
        subtitle="Detalhes do fundo"
      />

      {/* Mensagem de sucesso */}
      {successMessage && (
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="h-5 w-5" />
          {successMessage}
        </div>
      )}

      <div className="flex-1 p-4 lg:p-6 space-y-6">
        {/* Botão Voltar */}
        <Button variant="outline" onClick={() => router.push('/fundos')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Fundos
        </Button>

        {/* Card Principal - Informações do Fundo */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-100 flex-shrink-0">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <CardTitle className="text-2xl">{fundo.nome}</CardTitle>
                    <Badge className={tipoCor[tipoFundo]}>
                      {tipoFundo}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 flex-wrap">
                    {fundo.contato && (
                      <span className="font-medium text-slate-700">{fundo.contato}</span>
                    )}
                    {fundo.email && (
                      <a href={`mailto:${fundo.email}`} className="flex items-center gap-1 hover:text-blue-600">
                        <Mail className="h-4 w-4" />
                        {fundo.email}
                      </a>
                    )}
                    {fundo.telefone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {fundo.telefone}
                      </span>
                    )}
                    {fundo.website && (
                      <a href={fundo.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-600">
                        <Globe className="h-4 w-4" />
                        Website
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-sm">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  {interacoes.length} interações
                </Badge>
                {!editandoFundo && (
                  <Button variant="outline" size="sm" onClick={() => setEditandoFundo(true)}>
                    <Edit3 className="h-4 w-4 mr-1" />
                    Editar Fundo
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Modo de edição do fundo */}
            {editandoFundo ? (
              <div className="space-y-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-amber-900">Editando informações do fundo</h3>
                  <Button variant="ghost" size="sm" onClick={() => setEditandoFundo(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Informações Básicas */}
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Informações Básicas</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Nome do Fundo</label>
                      <Input
                        value={dadosFundo.nome}
                        onChange={(e) => setDadosFundo(prev => ({ ...prev, nome: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Tipo</label>
                      <select
                        className="w-full h-10 px-3 border rounded-md text-sm bg-white"
                        value={dadosFundo.tipoFundo}
                        onChange={(e) => setDadosFundo(prev => ({ ...prev, tipoFundo: e.target.value as TipoFundo }))}
                      >
                        {tiposFundo.map(tipo => (
                          <option key={tipo} value={tipo}>{tipo}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Contato</label>
                      <Input
                        value={dadosFundo.contato}
                        onChange={(e) => setDadosFundo(prev => ({ ...prev, contato: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Email</label>
                      <Input
                        value={dadosFundo.email}
                        onChange={(e) => setDadosFundo(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Telefone</label>
                      <Input
                        value={dadosFundo.telefone}
                        onChange={(e) => setDadosFundo(prev => ({ ...prev, telefone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Website</label>
                      <Input
                        value={dadosFundo.website}
                        onChange={(e) => setDadosFundo(prev => ({ ...prev, website: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Critérios de Investimento */}
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Critérios de Investimento</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Ticket Médio</label>
                      <Input
                        value={dadosFundo.ticketMedio}
                        onChange={(e) => setDadosFundo(prev => ({ ...prev, ticketMedio: e.target.value }))}
                        placeholder="Ex: R$ 100-300mi"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">EBITDA Mínimo</label>
                      <Input
                        value={dadosFundo.ebitdaMinimo}
                        onChange={(e) => setDadosFundo(prev => ({ ...prev, ebitdaMinimo: e.target.value }))}
                        placeholder="Ex: R$ 30-80mi"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Faturamento Mínimo</label>
                      <Input
                        value={dadosFundo.faturamentoMinimo}
                        onChange={(e) => setDadosFundo(prev => ({ ...prev, faturamentoMinimo: e.target.value }))}
                        placeholder="Ex: R$ 150-400mi"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Deal Ideal</label>
                      <Input
                        value={dadosFundo.dealIdeal}
                        onChange={(e) => setDadosFundo(prev => ({ ...prev, dealIdeal: e.target.value }))}
                        placeholder="Ex: Controle"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Posição</label>
                      <select
                        className="w-full h-10 px-3 border rounded-md text-sm bg-white"
                        value={dadosFundo.posicao}
                        onChange={(e) => setDadosFundo(prev => ({ ...prev, posicao: e.target.value }))}
                      >
                        <option value="">Selecione...</option>
                        {posicoesDisponiveis.map(pos => (
                          <option key={pos} value={pos}>{pos}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Disponibilidade</label>
                      <Input
                        value={dadosFundo.disponibilidadeFundo}
                        onChange={(e) => setDadosFundo(prev => ({ ...prev, disponibilidadeFundo: e.target.value }))}
                        placeholder="Ex: Metade disponível"
                      />
                    </div>
                  </div>
                </div>

                {/* Setores */}
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Setores de Interesse</h4>

                  {dadosFundo.setores.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {dadosFundo.setores.map(setor => (
                        <Badge key={setor} variant="secondary" className="gap-1 py-1.5 px-3">
                          {setor}
                          <button type="button" onClick={() => handleRemoveSetorFundo(setor)} className="ml-1 hover:text-red-500">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-3">
                    {setoresBase.map(setor => {
                      const isSelected = dadosFundo.setores.includes(setor)
                      return (
                        <button
                          key={setor}
                          type="button"
                          onClick={() => !isSelected && handleAddSetorFundo(setor)}
                          disabled={isSelected}
                          className={`px-2 py-1.5 text-xs rounded border transition-colors ${
                            isSelected
                              ? 'bg-blue-100 border-blue-300 text-blue-700 cursor-not-allowed'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {setor}
                        </button>
                      )
                    })}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={novoSetorCustom}
                      onChange={(e) => setNovoSetorCustom(e.target.value)}
                      placeholder="Setor personalizado..."
                      className="max-w-xs"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddSetorCustomFundo()
                        }
                      }}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={handleAddSetorCustomFundo} disabled={!novoSetorCustom.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setEditandoFundo(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSalvarFundo}>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Critérios de Investimento Atuais (modo visualização) */}
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-3">Critérios de Investimento (mais recentes)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-xs text-slate-500">Ticket Médio</p>
                        <p className="font-medium">{fundo.ticketMedio || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                      <div>
                        <p className="text-xs text-slate-500">EBITDA Mínimo</p>
                        <p className="font-medium">{fundo.ebitdaMinimo || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-cyan-600" />
                      <div>
                        <p className="text-xs text-slate-500">Faturamento</p>
                        <p className="font-medium">{fundo.faturamentoMinimo || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Target className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-xs text-slate-500">Deal Ideal</p>
                        <p className="font-medium">{fundo.dealIdeal || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-xs text-slate-500">Posição</p>
                        <p className="font-medium">{fundo.posicao || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Wallet className="h-5 w-5 text-amber-600" />
                      <div>
                        <p className="text-xs text-slate-500">Disponível</p>
                        <p className="font-medium">{fundo.disponibilidadeFundo || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Setores de Interesse (modo visualização) */}
                {setores.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-3">Setores de Interesse</h3>
                    <div className="flex gap-2 flex-wrap">
                      {setores.map((setor: string, i: number) => (
                        <Badge key={i} variant="secondary" className="py-1.5 px-3">
                          {setor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Portfolio do Fundo */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Portfolio ({portfolioFundo.length} empresas)
              </CardTitle>
              <Button onClick={() => setShowNovaEmpresa(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Empresa
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Formulário Nova Empresa */}
            {showNovaEmpresa && (
              <div className="mb-6 p-4 border rounded-lg bg-green-50 border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-green-900">Adicionar Empresa ao Portfolio</h4>
                  <Button variant="ghost" size="sm" onClick={() => setShowNovaEmpresa(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Nome da Empresa *</label>
                      <Input
                        value={novaEmpresa.nome}
                        onChange={(e) => setNovaEmpresa(prev => ({ ...prev, nome: e.target.value }))}
                        placeholder="Nome da empresa"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Setor *</label>
                      <Input
                        value={novaEmpresa.setor}
                        onChange={(e) => setNovaEmpresa(prev => ({ ...prev, setor: e.target.value }))}
                        placeholder="Ex: Tecnologia, Saúde..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Ano do Investimento</label>
                      <Input
                        type="number"
                        value={novaEmpresa.anoInvestimento}
                        onChange={(e) => setNovaEmpresa(prev => ({ ...prev, anoInvestimento: e.target.value }))}
                        placeholder="Ex: 2023"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Status</label>
                      <select
                        className="w-full h-10 px-3 border rounded-md text-sm bg-white"
                        value={novaEmpresa.status}
                        onChange={(e) => setNovaEmpresa(prev => ({ ...prev, status: e.target.value as 'Ativo' | 'Saída' | 'Em processo de saída' }))}
                      >
                        <option value="Ativo">Ativo</option>
                        <option value="Saída">Saída</option>
                        <option value="Em processo de saída">Em processo de saída</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-slate-600 mb-1">Descrição</label>
                      <Input
                        value={novaEmpresa.descricao}
                        onChange={(e) => setNovaEmpresa(prev => ({ ...prev, descricao: e.target.value }))}
                        placeholder="Breve descrição da empresa"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="buscandoAddOnNovo"
                      checked={novaEmpresa.buscandoAddOn}
                      onChange={(e) => setNovaEmpresa(prev => ({ ...prev, buscandoAddOn: e.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label htmlFor="buscandoAddOnNovo" className="text-sm text-slate-700">
                      Buscando Add-on
                    </label>
                  </div>

                  {novaEmpresa.buscandoAddOn && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-white rounded border">
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Segmentos de interesse</label>
                        <Input
                          value={novaEmpresa.segmentosAddOn}
                          onChange={(e) => setNovaEmpresa(prev => ({ ...prev, segmentosAddOn: e.target.value }))}
                          placeholder="Separados por vírgula"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Ticket para Add-on</label>
                        <Input
                          value={novaEmpresa.ticketAddOn}
                          onChange={(e) => setNovaEmpresa(prev => ({ ...prev, ticketAddOn: e.target.value }))}
                          placeholder="Ex: R$ 30-100mi"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => setShowNovaEmpresa(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSalvarNovaEmpresa}>
                      <Save className="h-4 w-4 mr-2" />
                      Adicionar Empresa
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de Empresas do Portfolio */}
            {portfolioFundo.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {portfolioFundo.map(empresa => (
                  <div key={empresa.id} className={`p-4 border rounded-lg ${editandoEmpresaId === empresa.id ? 'bg-amber-50 border-amber-200' : 'bg-slate-50'}`}>
                    {editandoEmpresaId === empresa.id && empresaEditando ? (
                      // Modo de edição
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-amber-900 text-sm">Editando empresa</h4>
                          <Button variant="ghost" size="sm" onClick={handleCancelarEdicaoEmpresa} className="h-6 w-6 p-0">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Input
                            placeholder="Nome da empresa"
                            value={empresaEditando.nome}
                            onChange={(e) => setEmpresaEditando(prev => prev ? { ...prev, nome: e.target.value } : null)}
                            className="h-8 text-sm"
                          />
                          <Input
                            placeholder="Setor"
                            value={empresaEditando.setor}
                            onChange={(e) => setEmpresaEditando(prev => prev ? { ...prev, setor: e.target.value } : null)}
                            className="h-8 text-sm"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="number"
                              placeholder="Ano"
                              value={empresaEditando.anoInvestimento}
                              onChange={(e) => setEmpresaEditando(prev => prev ? { ...prev, anoInvestimento: e.target.value } : null)}
                              className="h-8 text-sm"
                            />
                            <select
                              className="h-8 px-2 border rounded-md text-sm bg-white"
                              value={empresaEditando.status}
                              onChange={(e) => setEmpresaEditando(prev => prev ? { ...prev, status: e.target.value as 'Ativo' | 'Saída' | 'Em processo de saída' } : null)}
                            >
                              <option value="Ativo">Ativo</option>
                              <option value="Saída">Saída</option>
                              <option value="Em processo de saída">Em processo</option>
                            </select>
                          </div>
                          <Input
                            placeholder="Descrição"
                            value={empresaEditando.descricao}
                            onChange={(e) => setEmpresaEditando(prev => prev ? { ...prev, descricao: e.target.value } : null)}
                            className="h-8 text-sm"
                          />

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`buscandoAddOn_${empresa.id}`}
                              checked={empresaEditando.buscandoAddOn}
                              onChange={(e) => setEmpresaEditando(prev => prev ? { ...prev, buscandoAddOn: e.target.checked } : null)}
                              className="h-3 w-3 rounded border-gray-300"
                            />
                            <label htmlFor={`buscandoAddOn_${empresa.id}`} className="text-xs text-slate-600">
                              Buscando Add-on
                            </label>
                          </div>

                          {empresaEditando.buscandoAddOn && (
                            <div className="space-y-2 p-2 bg-white rounded border">
                              <Input
                                placeholder="Segmentos (separados por vírgula)"
                                value={empresaEditando.segmentosAddOn}
                                onChange={(e) => setEmpresaEditando(prev => prev ? { ...prev, segmentosAddOn: e.target.value } : null)}
                                className="h-8 text-sm"
                              />
                              <Input
                                placeholder="Ticket Add-on"
                                value={empresaEditando.ticketAddOn}
                                onChange={(e) => setEmpresaEditando(prev => prev ? { ...prev, ticketAddOn: e.target.value } : null)}
                                className="h-8 text-sm"
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end gap-1 pt-1">
                          <Button variant="outline" size="sm" onClick={handleCancelarEdicaoEmpresa} className="h-7 text-xs">
                            Cancelar
                          </Button>
                          <Button size="sm" onClick={handleSalvarEdicaoEmpresa} className="h-7 text-xs">
                            <Save className="h-3 w-3 mr-1" />
                            Salvar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Modo de visualização
                      <>
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium">{empresa.nome}</h4>
                            <p className="text-sm text-slate-500">{empresa.setor}</p>
                            {empresa.anoInvestimento && (
                              <p className="text-xs text-slate-400">Investimento: {empresa.anoInvestimento}</p>
                            )}
                          </div>
                          <div className="flex items-start gap-1 ml-2">
                            <Badge variant={empresa.status === 'Ativo' ? 'default' : 'secondary'} className="text-xs">
                              {empresa.status}
                            </Badge>
                          </div>
                        </div>

                        {empresa.descricao && (
                          <p className="text-xs text-slate-600 mt-2">{empresa.descricao}</p>
                        )}

                        {empresa.buscandoAddOn && (
                          <div className="mt-2 pt-2 border-t">
                            <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                              <Target className="h-3 w-3 mr-1" />
                              Buscando Add-on
                            </Badge>
                            {empresa.segmentosAddOn && empresa.segmentosAddOn.length > 0 && (
                              <p className="text-xs text-slate-500 mt-1">
                                Segmentos: {empresa.segmentosAddOn.join(', ')}
                              </p>
                            )}
                            {empresa.ticketAddOn && (
                              <p className="text-xs text-slate-500">
                                Ticket: {empresa.ticketAddOn}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Botões de edição/exclusão */}
                        <div className="flex justify-end gap-1 mt-3 pt-2 border-t">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleIniciarEdicaoEmpresa(empresa)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit3 className="h-3.5 w-3.5 text-slate-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExcluirEmpresa(empresa.id)}
                            className="h-7 w-7 p-0"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 mx-auto text-slate-300" />
                <p className="mt-3 text-slate-500">Nenhuma empresa no portfolio</p>
                <p className="text-sm text-slate-400">Clique em "Adicionar Empresa" para adicionar a primeira</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Histórico de Interações */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Histórico de Interações
              </CardTitle>
              <Button onClick={() => setShowNovaInteracao(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Interação
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Formulário Nova Interação */}
            {showNovaInteracao && (
              <div className="mb-6 p-4 border rounded-lg bg-blue-50 border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-blue-900">Registrar Nova Interação</h4>
                  <Button variant="ghost" size="sm" onClick={() => setShowNovaInteracao(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Data</label>
                      <Input
                        value={novaInteracao.data}
                        onChange={(e) => setNovaInteracao(prev => ({ ...prev, data: e.target.value }))}
                        placeholder="DD/MM/YYYY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Hora</label>
                      <Input
                        value={novaInteracao.hora}
                        onChange={(e) => setNovaInteracao(prev => ({ ...prev, hora: e.target.value }))}
                        placeholder="HH:MM"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Participantes</label>
                      <Input
                        value={novaInteracao.participantes}
                        onChange={(e) => setNovaInteracao(prev => ({ ...prev, participantes: e.target.value }))}
                        placeholder="João, Maria (separados por vírgula)"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Resumo da Conversa *</label>
                    <textarea
                      className="w-full h-24 px-3 py-2 border rounded-md text-sm resize-none bg-white"
                      value={novaInteracao.resumo}
                      onChange={(e) => setNovaInteracao(prev => ({ ...prev, resumo: e.target.value }))}
                      placeholder="Resumo da conversa, pontos importantes, próximos passos..."
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCriterios(!showCriterios)}
                    className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800"
                  >
                    {showCriterios ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    {showCriterios ? 'Ocultar critérios atualizados' : 'Adicionar critérios atualizados (se houve mudança)'}
                  </button>

                  {showCriterios && (
                    <div className="p-4 bg-white rounded-lg border space-y-4">
                      <p className="text-xs text-slate-500">Preencha apenas os campos que mudaram nesta conversa</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm text-slate-600 mb-1">Ticket Médio</label>
                          <Input
                            value={novaInteracao.ticketMedio}
                            onChange={(e) => setNovaInteracao(prev => ({ ...prev, ticketMedio: e.target.value }))}
                            placeholder="Ex: R$ 100-300mi"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-600 mb-1">EBITDA Mínimo</label>
                          <Input
                            value={novaInteracao.ebitdaMinimo}
                            onChange={(e) => setNovaInteracao(prev => ({ ...prev, ebitdaMinimo: e.target.value }))}
                            placeholder="Ex: R$ 30-80mi"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-600 mb-1">Faturamento Mínimo</label>
                          <Input
                            value={novaInteracao.faturamentoMinimo}
                            onChange={(e) => setNovaInteracao(prev => ({ ...prev, faturamentoMinimo: e.target.value }))}
                            placeholder="Ex: R$ 150-400mi"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-600 mb-1">Deal Ideal</label>
                          <Input
                            value={novaInteracao.dealIdeal}
                            onChange={(e) => setNovaInteracao(prev => ({ ...prev, dealIdeal: e.target.value }))}
                            placeholder="Ex: Controle"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-600 mb-1">Posição</label>
                          <select
                            className="w-full h-10 px-3 border rounded-md text-sm bg-white"
                            value={novaInteracao.posicao}
                            onChange={(e) => setNovaInteracao(prev => ({ ...prev, posicao: e.target.value }))}
                          >
                            <option value="">Selecione...</option>
                            {posicoesDisponiveis.map(pos => (
                              <option key={pos} value={pos}>{pos}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-slate-600 mb-1">Disponibilidade</label>
                          <Input
                            value={novaInteracao.disponibilidadeFundo}
                            onChange={(e) => setNovaInteracao(prev => ({ ...prev, disponibilidadeFundo: e.target.value }))}
                            placeholder="Ex: 2/3 do fundo"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => setShowNovaInteracao(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSalvarInteracao}>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Interação
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de Interações */}
            {interacoes.length > 0 ? (
              <div className="space-y-4">
                {interacoes.map((interacao, index) => (
                  <div
                    key={interacao.id}
                    className={`relative pl-8 pb-6 ${index !== interacoes.length - 1 ? 'border-l-2 border-slate-200 ml-3' : 'ml-3'}`}
                  >
                    {/* Ponto na timeline */}
                    <div className="absolute left-0 top-0 -translate-x-1/2 w-6 h-6 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center">
                      <MessageSquare className="h-3 w-3 text-blue-600" />
                    </div>

                    <div className={`border rounded-lg p-4 ml-4 ${editandoInteracaoId === interacao.id ? 'bg-amber-50 border-amber-200' : 'bg-white'}`}>
                      {editandoInteracaoId === interacao.id && interacaoEditando ? (
                        // Modo de edição da interação
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-amber-900">Editando interação</h4>
                            <Button variant="ghost" size="sm" onClick={handleCancelarEdicaoInteracao}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm text-slate-600 mb-1">Data</label>
                              <Input
                                value={interacaoEditando.data}
                                onChange={(e) => setInteracaoEditando(prev => prev ? { ...prev, data: e.target.value } : null)}
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-slate-600 mb-1">Hora</label>
                              <Input
                                value={interacaoEditando.hora}
                                onChange={(e) => setInteracaoEditando(prev => prev ? { ...prev, hora: e.target.value } : null)}
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-slate-600 mb-1">Participantes</label>
                              <Input
                                value={interacaoEditando.participantes}
                                onChange={(e) => setInteracaoEditando(prev => prev ? { ...prev, participantes: e.target.value } : null)}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm text-slate-600 mb-1">Resumo</label>
                            <textarea
                              className="w-full h-24 px-3 py-2 border rounded-md text-sm resize-none bg-white"
                              value={interacaoEditando.resumo}
                              onChange={(e) => setInteracaoEditando(prev => prev ? { ...prev, resumo: e.target.value } : null)}
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-slate-600 mb-2">Critérios atualizados</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              <Input
                                placeholder="Ticket Médio"
                                value={interacaoEditando.ticketMedio}
                                onChange={(e) => setInteracaoEditando(prev => prev ? { ...prev, ticketMedio: e.target.value } : null)}
                              />
                              <Input
                                placeholder="EBITDA Mínimo"
                                value={interacaoEditando.ebitdaMinimo}
                                onChange={(e) => setInteracaoEditando(prev => prev ? { ...prev, ebitdaMinimo: e.target.value } : null)}
                              />
                              <Input
                                placeholder="Faturamento"
                                value={interacaoEditando.faturamentoMinimo}
                                onChange={(e) => setInteracaoEditando(prev => prev ? { ...prev, faturamentoMinimo: e.target.value } : null)}
                              />
                              <Input
                                placeholder="Deal Ideal"
                                value={interacaoEditando.dealIdeal}
                                onChange={(e) => setInteracaoEditando(prev => prev ? { ...prev, dealIdeal: e.target.value } : null)}
                              />
                              <select
                                className="h-10 px-3 border rounded-md text-sm bg-white"
                                value={interacaoEditando.posicao}
                                onChange={(e) => setInteracaoEditando(prev => prev ? { ...prev, posicao: e.target.value } : null)}
                              >
                                <option value="">Posição...</option>
                                {posicoesDisponiveis.map(pos => (
                                  <option key={pos} value={pos}>{pos}</option>
                                ))}
                              </select>
                              <Input
                                placeholder="Disponibilidade"
                                value={interacaoEditando.disponibilidadeFundo}
                                onChange={(e) => setInteracaoEditando(prev => prev ? { ...prev, disponibilidadeFundo: e.target.value } : null)}
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" size="sm" onClick={handleCancelarEdicaoInteracao}>
                              Cancelar
                            </Button>
                            <Button size="sm" onClick={handleSalvarEdicaoInteracao}>
                              <Save className="h-4 w-4 mr-1" />
                              Salvar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Modo de visualização da interação
                        <>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-4 text-sm flex-wrap">
                              <span className="flex items-center gap-1 font-medium text-slate-900">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                {interacao.data}
                              </span>
                              <span className="flex items-center gap-1 text-slate-500">
                                <Clock className="h-4 w-4" />
                                {interacao.hora}
                              </span>
                              {interacao.participantes.length > 0 && (
                                <span className="flex items-center gap-1 text-slate-500">
                                  <Users className="h-4 w-4" />
                                  {interacao.participantes.join(', ')}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleIniciarEdicaoInteracao(interacao)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit3 className="h-4 w-4 text-slate-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleExcluirInteracao(interacao.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>

                          <p className="text-slate-700 whitespace-pre-wrap">{interacao.resumo}</p>

                          {interacao.criterios && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-xs text-slate-500 mb-2">Critérios atualizados nesta conversa:</p>
                              <div className="flex flex-wrap gap-2">
                                {interacao.criterios.ticketMedio && (
                                  <Badge variant="outline" className="text-xs">
                                    Ticket: {interacao.criterios.ticketMedio}
                                  </Badge>
                                )}
                                {interacao.criterios.ebitdaMinimo && (
                                  <Badge variant="outline" className="text-xs">
                                    EBITDA: {interacao.criterios.ebitdaMinimo}
                                  </Badge>
                                )}
                                {interacao.criterios.faturamentoMinimo && (
                                  <Badge variant="outline" className="text-xs">
                                    Faturamento: {interacao.criterios.faturamentoMinimo}
                                  </Badge>
                                )}
                                {interacao.criterios.dealIdeal && (
                                  <Badge variant="outline" className="text-xs">
                                    Deal: {interacao.criterios.dealIdeal}
                                  </Badge>
                                )}
                                {interacao.criterios.posicao && (
                                  <Badge variant="outline" className="text-xs">
                                    Posição: {interacao.criterios.posicao}
                                  </Badge>
                                )}
                                {interacao.criterios.disponibilidadeFundo && (
                                  <Badge variant="outline" className="text-xs">
                                    Disponível: {interacao.criterios.disponibilidadeFundo}
                                  </Badge>
                                )}
                                {interacao.criterios.setores && interacao.criterios.setores.length > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    Setores: {interacao.criterios.setores.join(', ')}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto text-slate-300" />
                <p className="mt-3 text-slate-500">Nenhuma interação registrada</p>
                <p className="text-sm text-slate-400">Clique em "Nova Interação" para adicionar a primeira</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
