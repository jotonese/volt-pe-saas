'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useData, TipoFundo, CriteriosFundo, PortfolioEmpresa } from '@/contexts/DataContext'
import {
  Plus,
  Building2,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Download,
  Check,
  Trash2,
  MessageSquare,
  Users,
} from 'lucide-react'

const tiposFundo: TipoFundo[] = ['PE', 'VC', 'Wealth', 'Family Office', 'Outros']

const setoresBase = [
  'Tecnologia', 'Saúde', 'Consumo', 'Serv. Financeiros', 'Agronegócio',
  'Educação', 'Serviços', 'Varejo', 'Infraestrutura', 'Industrial',
  'Logística', 'Energia', 'Fintech', 'SaaS', 'E-commerce', 'Healthtech',
  'Real Estate', 'Circular'
]

const posicoesDisponiveis = ['Majoritário', 'Minoritário', 'Controle', 'Minoritário Relevante', 'Co-investimento']

interface EmpresaPortfolio {
  id: string
  nome: string
  setor: string
  anoInvestimento: number
  status: 'Ativo' | 'Saída' | 'Em processo de saída'
  descricao: string
  buscandoAddOn: boolean
  segmentosAddOn: string
  ticketAddOn: string
  website: string
}

export default function CadastrarPage() {
  const router = useRouter()
  const {
    data,
    addFundo,
    addInteracao,
    addPortfolioEmpresa,
    exportToExcel,
  } = useData()

  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showSetorDropdown, setShowSetorDropdown] = useState(false)
  const [novoSetorCustom, setNovoSetorCustom] = useState('')
  const [setoresDisponiveis, setSetoresDisponiveis] = useState(setoresBase)

  // Seções expandidas/colapsadas
  const [expandedSections, setExpandedSections] = useState({
    basico: true,
    contato: true,
    criterios: true,
    setores: true,
    interacao: true,
    portfolio: false,
  })

  // Estado unificado do formulário de fundo
  const [formData, setFormData] = useState({
    // Informações Básicas
    nome: '',
    tipoFundo: 'PE' as TipoFundo,
    website: '',

    // Contato
    contato: '',
    email: '',
    telefone: '',

    // Critérios de Investimento
    ticketMedio: '',
    ebitdaMinimo: '',
    faturamentoMinimo: '',
    dealIdeal: '',
    posicao: '',
    disponibilidadeFundo: '',

    // Setores
    setores: [] as string[],

    // Primeira Interação / Notas da Conversa
    dataInteracao: new Date().toLocaleDateString('pt-BR'),
    horaInteracao: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    participantes: '',
    resumoInteracao: '',

    // Portfolio de Empresas
    empresasPortfolio: [] as EmpresaPortfolio[],
  })

  // Estado temporário para nova empresa do portfolio
  const [novaEmpresa, setNovaEmpresa] = useState({
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

  const [showNovaEmpresaForm, setShowNovaEmpresaForm] = useState(false)

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleAddSetor = (setor: string) => {
    if (!formData.setores.includes(setor)) {
      setFormData(prev => ({ ...prev, setores: [...prev.setores, setor] }))
    }
    setShowSetorDropdown(false)
  }

  const handleRemoveSetor = (setor: string) => {
    setFormData(prev => ({ ...prev, setores: prev.setores.filter(s => s !== setor) }))
  }

  const handleAddSetorCustom = () => {
    const setor = novoSetorCustom.trim()
    if (setor && !formData.setores.includes(setor)) {
      // Adiciona à lista de setores disponíveis se não existir
      if (!setoresDisponiveis.includes(setor)) {
        setSetoresDisponiveis(prev => [...prev, setor])
      }
      setFormData(prev => ({ ...prev, setores: [...prev.setores, setor] }))
      setNovoSetorCustom('')
    }
  }

  const handleAddEmpresa = () => {
    if (!novaEmpresa.nome.trim()) {
      alert('Por favor, informe o nome da empresa')
      return
    }

    const empresa: EmpresaPortfolio = {
      id: `temp_${Date.now()}`,
      ...novaEmpresa,
    }

    setFormData(prev => ({
      ...prev,
      empresasPortfolio: [...prev.empresasPortfolio, empresa],
    }))

    // Limpar formulário da empresa
    setNovaEmpresa({
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
    setShowNovaEmpresaForm(false)
  }

  const handleRemoveEmpresa = (id: string) => {
    setFormData(prev => ({
      ...prev,
      empresasPortfolio: prev.empresasPortfolio.filter(e => e.id !== id),
    }))
  }

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const handleSalvarFundo = () => {
    if (!formData.nome.trim()) {
      alert('Por favor, informe o nome do fundo')
      return
    }

    // 1. Criar o fundo
    const fundoId = addFundo({
      nome: formData.nome,
      tipoFundo: formData.tipoFundo,
      contato: formData.contato || undefined,
      email: formData.email || undefined,
      telefone: formData.telefone || undefined,
      website: formData.website || undefined,
      setores: formData.setores.length > 0 ? formData.setores : undefined,
      ticketMedio: formData.ticketMedio || undefined,
      ebitdaMinimo: formData.ebitdaMinimo || undefined,
      faturamentoMinimo: formData.faturamentoMinimo || undefined,
      dealIdeal: formData.dealIdeal || undefined,
      posicao: formData.posicao || undefined,
    })

    // 2. Se houver notas da interação, criar a primeira interação
    if (formData.resumoInteracao.trim()) {
      const criterios: CriteriosFundo | undefined = (
        formData.ticketMedio ||
        formData.ebitdaMinimo ||
        formData.faturamentoMinimo ||
        formData.dealIdeal ||
        formData.posicao ||
        formData.setores.length > 0 ||
        formData.disponibilidadeFundo
      ) ? {
        ticketMedio: formData.ticketMedio || undefined,
        ebitdaMinimo: formData.ebitdaMinimo || undefined,
        faturamentoMinimo: formData.faturamentoMinimo || undefined,
        dealIdeal: formData.dealIdeal || undefined,
        posicao: formData.posicao || undefined,
        setores: formData.setores.length > 0 ? formData.setores : undefined,
        disponibilidadeFundo: formData.disponibilidadeFundo || undefined,
      } : undefined

      addInteracao({
        fundoId: fundoId,
        fundoNome: formData.nome,
        data: formData.dataInteracao,
        hora: formData.horaInteracao,
        participantes: formData.participantes.split(',').map(p => p.trim()).filter(Boolean),
        resumo: formData.resumoInteracao,
        criterios,
      })
    }

    // 3. Adicionar empresas do portfolio
    formData.empresasPortfolio.forEach(empresa => {
      addPortfolioEmpresa({
        fundoId: fundoId,
        fundoNome: formData.nome,
        nome: empresa.nome,
        setor: empresa.setor || 'Outros',
        anoInvestimento: empresa.anoInvestimento || undefined,
        status: empresa.status,
        descricao: empresa.descricao || undefined,
        buscandoAddOn: empresa.buscandoAddOn,
        segmentosAddOn: empresa.segmentosAddOn ? empresa.segmentosAddOn.split(',').map(s => s.trim()) : undefined,
        ticketAddOn: empresa.ticketAddOn || undefined,
        website: empresa.website || undefined,
      })
    })

    // 4. Limpar formulário
    setFormData({
      nome: '',
      tipoFundo: 'PE',
      website: '',
      contato: '',
      email: '',
      telefone: '',
      ticketMedio: '',
      ebitdaMinimo: '',
      faturamentoMinimo: '',
      dealIdeal: '',
      posicao: '',
      disponibilidadeFundo: '',
      setores: [],
      dataInteracao: new Date().toLocaleDateString('pt-BR'),
      horaInteracao: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      participantes: '',
      resumoInteracao: '',
      empresasPortfolio: [],
    })

    showSuccess('Fundo cadastrado com sucesso!')

    // Redirecionar para a página do fundo após 1 segundo
    setTimeout(() => {
      router.push(`/fundos/${fundoId}`)
    }, 1000)
  }

  const SectionHeader = ({
    title,
    icon: Icon,
    section,
    subtitle
  }: {
    title: string
    icon: React.ElementType
    section: keyof typeof expandedSections
    subtitle?: string
  }) => (
    <button
      type="button"
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-slate-600" />
        <div className="text-left">
          <h3 className="font-medium text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {expandedSections[section] ? (
        <ChevronUp className="h-5 w-5 text-slate-400" />
      ) : (
        <ChevronDown className="h-5 w-5 text-slate-400" />
      )}
    </button>
  )

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Cadastrar Novo Fundo"
        subtitle="Preencha todas as informações do fundo em um único formulário"
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Formulário de Cadastro
            </CardTitle>
            <CardDescription>
              Todas as informações do fundo, incluindo notas da conversa e empresas do portfolio, são inseridas aqui.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Seção: Informações Básicas */}
            <div className="border rounded-lg overflow-hidden">
              <SectionHeader
                title="Informações Básicas"
                icon={Building2}
                section="basico"
                subtitle="Nome, tipo e website do fundo"
              />
              {expandedSections.basico && (
                <div className="p-4 space-y-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Nome do Fundo *</label>
                      <Input
                        value={formData.nome}
                        onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                        placeholder="Ex: Pátria Investimentos"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Tipo de Fundo</label>
                      <select
                        className="w-full h-10 px-3 border rounded-md text-sm"
                        value={formData.tipoFundo}
                        onChange={(e) => setFormData(prev => ({ ...prev, tipoFundo: e.target.value as TipoFundo }))}
                      >
                        {tiposFundo.map(tipo => (
                          <option key={tipo} value={tipo}>{tipo}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Website</label>
                      <Input
                        value={formData.website}
                        onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Seção: Contato */}
            <div className="border rounded-lg overflow-hidden">
              <SectionHeader
                title="Contato Principal"
                icon={Users}
                section="contato"
                subtitle="Nome, email e telefone do contato"
              />
              {expandedSections.contato && (
                <div className="p-4 space-y-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Nome do Contato</label>
                      <Input
                        value={formData.contato}
                        onChange={(e) => setFormData(prev => ({ ...prev, contato: e.target.value }))}
                        placeholder="Ex: João Silva"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Email</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="contato@fundo.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Telefone</label>
                      <Input
                        value={formData.telefone}
                        onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Seção: Critérios de Investimento */}
            <div className="border rounded-lg overflow-hidden">
              <SectionHeader
                title="Critérios de Investimento"
                icon={ChevronDown}
                section="criterios"
                subtitle="Ticket, EBITDA, faturamento e posição"
              />
              {expandedSections.criterios && (
                <div className="p-4 space-y-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Ticket Médio</label>
                      <Input
                        value={formData.ticketMedio}
                        onChange={(e) => setFormData(prev => ({ ...prev, ticketMedio: e.target.value }))}
                        placeholder="Ex: R$ 100-300mi"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">EBITDA Mínimo</label>
                      <Input
                        value={formData.ebitdaMinimo}
                        onChange={(e) => setFormData(prev => ({ ...prev, ebitdaMinimo: e.target.value }))}
                        placeholder="Ex: R$ 30-80mi"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Faturamento Mínimo</label>
                      <Input
                        value={formData.faturamentoMinimo}
                        onChange={(e) => setFormData(prev => ({ ...prev, faturamentoMinimo: e.target.value }))}
                        placeholder="Ex: R$ 150-400mi"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Deal Ideal</label>
                      <Input
                        value={formData.dealIdeal}
                        onChange={(e) => setFormData(prev => ({ ...prev, dealIdeal: e.target.value }))}
                        placeholder="Ex: Controle ou Minoritário Relevante"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Posição Preferida</label>
                      <select
                        className="w-full h-10 px-3 border rounded-md text-sm"
                        value={formData.posicao}
                        onChange={(e) => setFormData(prev => ({ ...prev, posicao: e.target.value }))}
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
                        value={formData.disponibilidadeFundo}
                        onChange={(e) => setFormData(prev => ({ ...prev, disponibilidadeFundo: e.target.value }))}
                        placeholder="Ex: Metade do fundo disponível"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Seção: Setores */}
            <div className="border rounded-lg overflow-hidden">
              <SectionHeader
                title="Setores de Interesse"
                icon={ChevronDown}
                section="setores"
                subtitle="Setores que o fundo tem interesse"
              />
              {expandedSections.setores && (
                <div className="p-4 space-y-4 border-t">
                  {/* Setores selecionados */}
                  {formData.setores.length > 0 && (
                    <div>
                      <label className="block text-sm text-slate-600 mb-2">Setores selecionados:</label>
                      <div className="flex flex-wrap gap-2">
                        {formData.setores.map(setor => (
                          <Badge key={setor} variant="secondary" className="gap-1 py-1.5 px-3">
                            {setor}
                            <button type="button" onClick={() => handleRemoveSetor(setor)} className="ml-1 hover:text-red-500">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lista de setores disponíveis (grid) */}
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">Clique para adicionar:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {setoresDisponiveis.map(setor => {
                        const isSelected = formData.setores.includes(setor)
                        return (
                          <button
                            key={setor}
                            type="button"
                            onClick={() => !isSelected && handleAddSetor(setor)}
                            disabled={isSelected}
                            className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                              isSelected
                                ? 'bg-blue-100 border-blue-300 text-blue-700 cursor-not-allowed'
                                : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                            }`}
                          >
                            {setor}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Adicionar setor personalizado */}
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">Ou adicione um setor diferente:</label>
                    <div className="flex gap-2">
                      <Input
                        value={novoSetorCustom}
                        onChange={(e) => setNovoSetorCustom(e.target.value)}
                        placeholder="Digite o nome do setor..."
                        className="max-w-xs"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddSetorCustom()
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddSetorCustom}
                        disabled={!novoSetorCustom.trim()}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Seção: Notas da Conversa / Primeira Interação */}
            <div className="border rounded-lg overflow-hidden">
              <SectionHeader
                title="Notas da Conversa"
                icon={MessageSquare}
                section="interacao"
                subtitle="Registre a primeira interação ou conversa com o fundo"
              />
              {expandedSections.interacao && (
                <div className="p-4 space-y-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Data</label>
                      <Input
                        value={formData.dataInteracao}
                        onChange={(e) => setFormData(prev => ({ ...prev, dataInteracao: e.target.value }))}
                        placeholder="DD/MM/YYYY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Hora</label>
                      <Input
                        value={formData.horaInteracao}
                        onChange={(e) => setFormData(prev => ({ ...prev, horaInteracao: e.target.value }))}
                        placeholder="HH:MM"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Participantes</label>
                      <Input
                        value={formData.participantes}
                        onChange={(e) => setFormData(prev => ({ ...prev, participantes: e.target.value }))}
                        placeholder="João, Maria (separados por vírgula)"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Resumo / Anotações</label>
                    <textarea
                      className="w-full h-32 px-3 py-2 border rounded-md text-sm resize-none"
                      value={formData.resumoInteracao}
                      onChange={(e) => setFormData(prev => ({ ...prev, resumoInteracao: e.target.value }))}
                      placeholder="Resumo da conversa, pontos importantes, próximos passos..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Seção: Portfolio de Empresas */}
            <div className="border rounded-lg overflow-hidden">
              <SectionHeader
                title="Portfolio de Empresas"
                icon={Briefcase}
                section="portfolio"
                subtitle={`${formData.empresasPortfolio.length} empresa(s) adicionada(s)`}
              />
              {expandedSections.portfolio && (
                <div className="p-4 space-y-4 border-t">
                  {/* Lista de empresas já adicionadas */}
                  {formData.empresasPortfolio.length > 0 && (
                    <div className="space-y-2">
                      {formData.empresasPortfolio.map(empresa => (
                        <div
                          key={empresa.id}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-sm">{empresa.nome}</p>
                            <p className="text-xs text-slate-500">
                              {empresa.setor} • {empresa.status}
                              {empresa.buscandoAddOn && ' • Buscando Add-on'}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveEmpresa(empresa.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Formulário para adicionar nova empresa */}
                  {showNovaEmpresaForm ? (
                    <div className="border rounded-lg p-4 bg-slate-50 space-y-4">
                      <h4 className="font-medium text-sm">Nova Empresa do Portfolio</h4>
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
                          <Input
                            value={novaEmpresa.setor}
                            onChange={(e) => setNovaEmpresa(prev => ({ ...prev, setor: e.target.value }))}
                            placeholder="Ex: Tecnologia, Saúde..."
                            list="setores-empresa-list"
                          />
                          <datalist id="setores-empresa-list">
                            {setoresDisponiveis.map(setor => (
                              <option key={setor} value={setor} />
                            ))}
                          </datalist>
                        </div>
                        <div>
                          <label className="block text-sm text-slate-600 mb-1">Ano do Investimento</label>
                          <Input
                            type="number"
                            value={novaEmpresa.anoInvestimento}
                            onChange={(e) => setNovaEmpresa(prev => ({ ...prev, anoInvestimento: parseInt(e.target.value) || 0 }))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-600 mb-1">Status</label>
                          <select
                            className="w-full h-10 px-3 border rounded-md text-sm bg-white"
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

                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Descrição</label>
                        <textarea
                          className="w-full h-16 px-3 py-2 border rounded-md text-sm resize-none bg-white"
                          value={novaEmpresa.descricao}
                          onChange={(e) => setNovaEmpresa(prev => ({ ...prev, descricao: e.target.value }))}
                          placeholder="Breve descrição da empresa..."
                        />
                      </div>

                      <div className="space-y-3">
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

                      <div className="flex gap-2 justify-end pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowNovaEmpresaForm(false)}
                        >
                          Cancelar
                        </Button>
                        <Button type="button" onClick={handleAddEmpresa}>
                          <Plus className="h-4 w-4 mr-1" />
                          Adicionar Empresa
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowNovaEmpresaForm(true)}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar Empresa ao Portfolio
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Botão Salvar */}
            <div className="flex justify-end pt-6 border-t">
              <Button onClick={handleSalvarFundo} size="lg" className="gap-2">
                <Save className="h-5 w-5" />
                Salvar Fundo Completo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
