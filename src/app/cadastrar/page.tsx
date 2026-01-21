'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useData, TipoFundo, CriteriosFundo, PortfolioEmpresa } from '@/contexts/DataContext'
import {
  Plus,
  Building2,
  MessageSquare,
  Save,
  X,
  ChevronDown,
  Briefcase,
  Download,
  Check,
  Trash2,
} from 'lucide-react'

const tiposFundo: TipoFundo[] = ['PE', 'VC', 'Wealth', 'Family Office', 'Outros']

const setoresDisponiveis = [
  'Tecnologia', 'Saúde', 'Consumo', 'Serv. Financeiros', 'Agronegócio',
  'Educação', 'Serviços', 'Varejo', 'Infraestrutura', 'Industrial',
  'Logística', 'Energia', 'Fintech', 'SaaS', 'E-commerce', 'Healthtech',
  'Real Estate', 'Circular', 'Outros'
]

const posicoesDisponiveis = ['Majoritário', 'Minoritário', 'Controle', 'Minoritário Relevante', 'Co-investimento']

type TabType = 'novo-fundo' | 'nova-interacao' | 'portfolio'

export default function CadastrarPage() {
  const {
    data,
    addFundo,
    addInteracao,
    addPortfolioEmpresa,
    exportToExcel,
  } = useData()

  const [activeTab, setActiveTab] = useState<TabType>('novo-fundo')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Estado do formulário de novo fundo
  const [novoFundo, setNovoFundo] = useState({
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
    observacoes: '',
  })

  // Estado do formulário de nova interação
  const [novaInteracao, setNovaInteracao] = useState({
    fundoId: '',
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

  // Estado do formulário de portfolio
  const [novaEmpresa, setNovaEmpresa] = useState({
    fundoId: '',
    nome: '',
    setor: '',
    anoInvestimento: new Date().getFullYear(),
    status: 'Ativo' as 'Ativo' | 'Saída' | 'Em processo de saída',
    descricao: '',
    buscandoAddOn: false,
    segmentosAddOn: '',
    ticketAddOn: '',
    website: '',
  })

  const [showSetorDropdown, setShowSetorDropdown] = useState(false)
  const [showSetorDropdownInteracao, setShowSetorDropdownInteracao] = useState(false)

  const handleAddSetor = (setor: string, target: 'fundo' | 'interacao') => {
    if (target === 'fundo') {
      if (!novoFundo.setores.includes(setor)) {
        setNovoFundo(prev => ({ ...prev, setores: [...prev.setores, setor] }))
      }
    } else {
      if (!novaInteracao.setores.includes(setor)) {
        setNovaInteracao(prev => ({ ...prev, setores: [...prev.setores, setor] }))
      }
    }
  }

  const handleRemoveSetor = (setor: string, target: 'fundo' | 'interacao') => {
    if (target === 'fundo') {
      setNovoFundo(prev => ({ ...prev, setores: prev.setores.filter(s => s !== setor) }))
    } else {
      setNovaInteracao(prev => ({ ...prev, setores: prev.setores.filter(s => s !== setor) }))
    }
  }

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const handleSalvarFundo = () => {
    if (!novoFundo.nome.trim()) {
      alert('Por favor, informe o nome do fundo')
      return
    }

    addFundo({
      nome: novoFundo.nome,
      tipoFundo: novoFundo.tipoFundo,
      contato: novoFundo.contato || undefined,
      email: novoFundo.email || undefined,
      telefone: novoFundo.telefone || undefined,
      website: novoFundo.website || undefined,
      setores: novoFundo.setores.length > 0 ? novoFundo.setores : undefined,
      ticketMedio: novoFundo.ticketMedio || undefined,
      ebitdaMinimo: novoFundo.ebitdaMinimo || undefined,
      faturamentoMinimo: novoFundo.faturamentoMinimo || undefined,
      dealIdeal: novoFundo.dealIdeal || undefined,
      posicao: novoFundo.posicao || undefined,
    })

    // Se tem observações, criar uma interação inicial
    if (novoFundo.observacoes.trim()) {
      const fundoId = `fundo_${Date.now()}`
      // A interação será adicionada após o fundo
    }

    // Limpar formulário
    setNovoFundo({
      nome: '',
      tipoFundo: 'PE',
      contato: '',
      email: '',
      telefone: '',
      website: '',
      setores: [],
      ticketMedio: '',
      ebitdaMinimo: '',
      faturamentoMinimo: '',
      dealIdeal: '',
      posicao: '',
      disponibilidadeFundo: '',
      observacoes: '',
    })

    showSuccess('Fundo cadastrado com sucesso!')
  }

  const handleSalvarInteracao = () => {
    if (!novaInteracao.fundoId) {
      alert('Por favor, selecione um fundo')
      return
    }
    if (!novaInteracao.resumo.trim()) {
      alert('Por favor, adicione um resumo da interação')
      return
    }

    const fundo = data.fundos.find(f => f.id === novaInteracao.fundoId)
    if (!fundo) return

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
      fundoId: novaInteracao.fundoId,
      fundoNome: fundo.nome,
      data: novaInteracao.data,
      hora: novaInteracao.hora,
      participantes: novaInteracao.participantes.split(',').map(p => p.trim()).filter(Boolean),
      resumo: novaInteracao.resumo,
      criterios,
    })

    // Limpar formulário
    setNovaInteracao({
      fundoId: '',
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

    showSuccess('Interação registrada com sucesso!')
  }

  const handleSalvarEmpresa = () => {
    if (!novaEmpresa.fundoId) {
      alert('Por favor, selecione um fundo')
      return
    }
    if (!novaEmpresa.nome.trim()) {
      alert('Por favor, informe o nome da empresa')
      return
    }

    const fundo = data.fundos.find(f => f.id === novaEmpresa.fundoId)
    if (!fundo) return

    addPortfolioEmpresa({
      fundoId: novaEmpresa.fundoId,
      fundoNome: fundo.nome,
      nome: novaEmpresa.nome,
      setor: novaEmpresa.setor || 'Outros',
      anoInvestimento: novaEmpresa.anoInvestimento || undefined,
      status: novaEmpresa.status,
      descricao: novaEmpresa.descricao || undefined,
      buscandoAddOn: novaEmpresa.buscandoAddOn,
      segmentosAddOn: novaEmpresa.segmentosAddOn ? novaEmpresa.segmentosAddOn.split(',').map(s => s.trim()) : undefined,
      ticketAddOn: novaEmpresa.ticketAddOn || undefined,
      website: novaEmpresa.website || undefined,
    })

    // Limpar formulário
    setNovaEmpresa({
      fundoId: '',
      nome: '',
      setor: '',
      anoInvestimento: new Date().getFullYear(),
      status: 'Ativo',
      descricao: '',
      buscandoAddOn: false,
      segmentosAddOn: '',
      ticketAddOn: '',
      website: '',
    })

    showSuccess('Empresa adicionada ao portfolio!')
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Cadastrar"
        subtitle="Adicione novos fundos, interações e empresas do portfolio"
      />

      <div className="flex-1 p-4 lg:p-6 space-y-6">
        {/* Mensagem de sucesso */}
        {successMessage && (
          <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <Check className="h-5 w-5" />
            {successMessage}
          </div>
        )}

        {/* Botão de Export */}
        <div className="flex justify-end">
          <Button variant="outline" onClick={exportToExcel} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar Backup Excel
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b overflow-x-auto pb-px">
          <button
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'novo-fundo'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setActiveTab('novo-fundo')}
          >
            <Building2 className="h-4 w-4 inline mr-2" />
            Novo Fundo
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'nova-interacao'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setActiveTab('nova-interacao')}
          >
            <MessageSquare className="h-4 w-4 inline mr-2" />
            Nova Interação
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'portfolio'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setActiveTab('portfolio')}
          >
            <Briefcase className="h-4 w-4 inline mr-2" />
            Empresa Portfolio
          </button>
        </div>

        {/* Formulário de Novo Fundo */}
        {activeTab === 'novo-fundo' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Cadastrar Novo Fundo
              </CardTitle>
              <CardDescription>
                Preencha as informações do fundo. Os campos de critérios podem ser atualizados posteriormente através das interações.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Informações Básicas */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">Informações Básicas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Nome do Fundo *</label>
                    <Input
                      value={novoFundo.nome}
                      onChange={(e) => setNovoFundo(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder="Ex: Pátria Investimentos"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Tipo de Fundo</label>
                    <select
                      className="w-full h-10 px-3 border rounded-md text-sm"
                      value={novoFundo.tipoFundo}
                      onChange={(e) => setNovoFundo(prev => ({ ...prev, tipoFundo: e.target.value as TipoFundo }))}
                    >
                      {tiposFundo.map(tipo => (
                        <option key={tipo} value={tipo}>{tipo}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Website</label>
                    <Input
                      value={novoFundo.website}
                      onChange={(e) => setNovoFundo(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              {/* Contato */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">Contato Principal</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Nome do Contato</label>
                    <Input
                      value={novoFundo.contato}
                      onChange={(e) => setNovoFundo(prev => ({ ...prev, contato: e.target.value }))}
                      placeholder="Ex: João Silva"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Email</label>
                    <Input
                      type="email"
                      value={novoFundo.email}
                      onChange={(e) => setNovoFundo(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="contato@fundo.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Telefone</label>
                    <Input
                      value={novoFundo.telefone}
                      onChange={(e) => setNovoFundo(prev => ({ ...prev, telefone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
              </div>

              {/* Critérios de Investimento */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">Critérios de Investimento (Inicial)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Ticket Médio</label>
                    <Input
                      value={novoFundo.ticketMedio}
                      onChange={(e) => setNovoFundo(prev => ({ ...prev, ticketMedio: e.target.value }))}
                      placeholder="Ex: R$ 100-300mi"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">EBITDA Mínimo</label>
                    <Input
                      value={novoFundo.ebitdaMinimo}
                      onChange={(e) => setNovoFundo(prev => ({ ...prev, ebitdaMinimo: e.target.value }))}
                      placeholder="Ex: R$ 30-80mi"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Faturamento Mínimo</label>
                    <Input
                      value={novoFundo.faturamentoMinimo}
                      onChange={(e) => setNovoFundo(prev => ({ ...prev, faturamentoMinimo: e.target.value }))}
                      placeholder="Ex: R$ 150-400mi"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Deal Ideal</label>
                    <Input
                      value={novoFundo.dealIdeal}
                      onChange={(e) => setNovoFundo(prev => ({ ...prev, dealIdeal: e.target.value }))}
                      placeholder="Ex: Controle ou Minoritário Relevante"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Posição Preferida</label>
                    <select
                      className="w-full h-10 px-3 border rounded-md text-sm"
                      value={novoFundo.posicao}
                      onChange={(e) => setNovoFundo(prev => ({ ...prev, posicao: e.target.value }))}
                    >
                      <option value="">Selecione...</option>
                      {posicoesDisponiveis.map(pos => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Disponibilidade do Fundo</label>
                    <Input
                      value={novoFundo.disponibilidadeFundo}
                      onChange={(e) => setNovoFundo(prev => ({ ...prev, disponibilidadeFundo: e.target.value }))}
                      placeholder="Ex: Metade do fundo disponível"
                    />
                  </div>
                </div>
              </div>

              {/* Setores */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">Setores de Interesse</h3>
                <div className="relative">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowSetorDropdown(!showSetorDropdown)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Setor
                    <ChevronDown className="h-4 w-4" />
                  </Button>

                  {showSetorDropdown && (
                    <div className="absolute left-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto min-w-[200px]">
                      {setoresDisponiveis.map(setor => (
                        <button
                          key={setor}
                          className={`w-full px-3 py-2 text-sm text-left hover:bg-slate-100 ${
                            novoFundo.setores.includes(setor) ? 'bg-blue-50 text-blue-600' : ''
                          }`}
                          onClick={() => {
                            handleAddSetor(setor, 'fundo')
                            setShowSetorDropdown(false)
                          }}
                        >
                          {setor}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {novoFundo.setores.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {novoFundo.setores.map(setor => (
                      <Badge key={setor} variant="secondary" className="gap-1">
                        {setor}
                        <button onClick={() => handleRemoveSetor(setor, 'fundo')}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Observações */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">Observações Iniciais</h3>
                <textarea
                  className="w-full h-24 px-3 py-2 border rounded-md text-sm resize-none"
                  value={novoFundo.observacoes}
                  onChange={(e) => setNovoFundo(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Anotações gerais sobre o fundo..."
                />
              </div>

              {/* Botão Salvar */}
              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSalvarFundo} className="gap-2">
                  <Save className="h-4 w-4" />
                  Salvar Fundo
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulário de Nova Interação */}
        {activeTab === 'nova-interacao' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Registrar Nova Interação
              </CardTitle>
              <CardDescription>
                Registre uma reunião ou contato com um fundo existente. Use este formulário para atualizar os critérios e adicionar notas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Seleção do Fundo */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">Fundo</h3>
                <select
                  className="w-full h-10 px-3 border rounded-md text-sm"
                  value={novaInteracao.fundoId}
                  onChange={(e) => setNovaInteracao(prev => ({ ...prev, fundoId: e.target.value }))}
                >
                  <option value="">Selecione um fundo...</option>
                  {data.fundos.map(fundo => (
                    <option key={fundo.id} value={fundo.id}>
                      {fundo.nome} ({fundo.tipoFundo})
                    </option>
                  ))}
                </select>
              </div>

              {/* Data e Hora */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">Data e Participantes</h3>
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
                      placeholder="João, Maria, Pedro (separados por vírgula)"
                    />
                  </div>
                </div>
              </div>

              {/* Resumo da Conversa */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">Resumo da Conversa *</h3>
                <textarea
                  className="w-full h-32 px-3 py-2 border rounded-md text-sm resize-none"
                  value={novaInteracao.resumo}
                  onChange={(e) => setNovaInteracao(prev => ({ ...prev, resumo: e.target.value }))}
                  placeholder="Ex: Não mudou. Ainda têm metade do fundo disponível. Continuam focados em tech e saúde..."
                />
              </div>

              {/* Critérios Atualizados */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">Critérios Atualizados (preencha apenas se houve mudança)</h3>
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
                      className="w-full h-10 px-3 border rounded-md text-sm"
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
                    <label className="block text-sm text-slate-600 mb-1">Disponibilidade do Fundo</label>
                    <Input
                      value={novaInteracao.disponibilidadeFundo}
                      onChange={(e) => setNovaInteracao(prev => ({ ...prev, disponibilidadeFundo: e.target.value }))}
                      placeholder="Ex: 2/3 do fundo disponível"
                    />
                  </div>
                </div>
              </div>

              {/* Setores */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">Setores de Interesse (se houve atualização)</h3>
                <div className="relative">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowSetorDropdownInteracao(!showSetorDropdownInteracao)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Setor
                    <ChevronDown className="h-4 w-4" />
                  </Button>

                  {showSetorDropdownInteracao && (
                    <div className="absolute left-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto min-w-[200px]">
                      {setoresDisponiveis.map(setor => (
                        <button
                          key={setor}
                          className={`w-full px-3 py-2 text-sm text-left hover:bg-slate-100 ${
                            novaInteracao.setores.includes(setor) ? 'bg-blue-50 text-blue-600' : ''
                          }`}
                          onClick={() => {
                            handleAddSetor(setor, 'interacao')
                            setShowSetorDropdownInteracao(false)
                          }}
                        >
                          {setor}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {novaInteracao.setores.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {novaInteracao.setores.map(setor => (
                      <Badge key={setor} variant="secondary" className="gap-1">
                        {setor}
                        <button onClick={() => handleRemoveSetor(setor, 'interacao')}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Botão Salvar */}
              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSalvarInteracao} className="gap-2">
                  <Save className="h-4 w-4" />
                  Salvar Interação
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulário de Portfolio */}
        {activeTab === 'portfolio' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Adicionar Empresa ao Portfolio
              </CardTitle>
              <CardDescription>
                Cadastre empresas investidas por um fundo, incluindo informações sobre add-ons.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Seleção do Fundo */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">Fundo</h3>
                <select
                  className="w-full h-10 px-3 border rounded-md text-sm"
                  value={novaEmpresa.fundoId}
                  onChange={(e) => setNovaEmpresa(prev => ({ ...prev, fundoId: e.target.value }))}
                >
                  <option value="">Selecione um fundo...</option>
                  {data.fundos.map(fundo => (
                    <option key={fundo.id} value={fundo.id}>
                      {fundo.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Informações da Empresa */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">Informações da Empresa</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Nome da Empresa *</label>
                    <Input
                      value={novaEmpresa.nome}
                      onChange={(e) => setNovaEmpresa(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder="Ex: Smartfit"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Setor</label>
                    <select
                      className="w-full h-10 px-3 border rounded-md text-sm"
                      value={novaEmpresa.setor}
                      onChange={(e) => setNovaEmpresa(prev => ({ ...prev, setor: e.target.value }))}
                    >
                      <option value="">Selecione...</option>
                      {setoresDisponiveis.map(setor => (
                        <option key={setor} value={setor}>{setor}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Ano do Investimento</label>
                    <Input
                      type="number"
                      value={novaEmpresa.anoInvestimento}
                      onChange={(e) => setNovaEmpresa(prev => ({ ...prev, anoInvestimento: parseInt(e.target.value) || 0 }))}
                      placeholder="Ex: 2020"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Status</label>
                    <select
                      className="w-full h-10 px-3 border rounded-md text-sm"
                      value={novaEmpresa.status}
                      onChange={(e) => setNovaEmpresa(prev => ({ ...prev, status: e.target.value as any }))}
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Saída">Saída</option>
                      <option value="Em processo de saída">Em processo de saída</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-slate-600 mb-1">Website</label>
                    <Input
                      value={novaEmpresa.website}
                      onChange={(e) => setNovaEmpresa(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm text-slate-600 mb-1">Descrição</label>
                <textarea
                  className="w-full h-20 px-3 py-2 border rounded-md text-sm resize-none"
                  value={novaEmpresa.descricao}
                  onChange={(e) => setNovaEmpresa(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Breve descrição da empresa..."
                />
              </div>

              {/* Add-on */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">Informações de Add-on</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={novaEmpresa.buscandoAddOn}
                      onChange={(e) => setNovaEmpresa(prev => ({ ...prev, buscandoAddOn: e.target.checked }))}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    <span className="text-sm">Empresa está buscando add-ons</span>
                  </label>

                  {novaEmpresa.buscandoAddOn && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Segmentos de Add-on</label>
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
                </div>
              </div>

              {/* Botão Salvar */}
              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSalvarEmpresa} className="gap-2">
                  <Save className="h-4 w-4" />
                  Adicionar ao Portfolio
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Overlay para fechar dropdowns */}
      {(showSetorDropdown || showSetorDropdownInteracao) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setShowSetorDropdown(false)
            setShowSetorDropdownInteracao(false)
          }}
        />
      )}
    </div>
  )
}
