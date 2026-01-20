'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useData, TipoFundo, FundoComInteracoes } from '@/contexts/DataContext'
import {
  Search,
  Plus,
  Building2,
  Mail,
  Phone,
  ChevronRight,
  Briefcase,
  DollarSign,
  Target,
  ChevronDown,
  TrendingUp,
  BarChart3,
  Calendar,
  MessageSquare,
  Wallet,
} from 'lucide-react'

const setoresFiltroBase = [
  'Todos',
  'Tecnologia',
  'Saúde',
  'Consumo',
  'Serv. Financeiros',
  'Agronegócio',
  'Educação',
  'Serviços',
  'Varejo',
  'Infraestrutura',
  'Industrial',
  'Logística',
  'Energia',
  'Fintech',
  'SaaS',
  'E-commerce',
  'Healthtech',
  'Real Estate',
]

const tiposFundo: TipoFundo[] = ['PE', 'VC', 'Wealth', 'Family Office', 'Outros']

const tipoCor: Record<TipoFundo, string> = {
  'PE': 'bg-blue-100 text-blue-700',
  'VC': 'bg-purple-100 text-purple-700',
  'Wealth': 'bg-green-100 text-green-700',
  'Family Office': 'bg-amber-100 text-amber-700',
  'Outros': 'bg-slate-100 text-slate-700',
}

export default function FundosPage() {
  const router = useRouter()
  const { getFundosComInteracoes } = useData()

  const [search, setSearch] = useState('')
  const [setorFiltro, setSetorFiltro] = useState('Todos')
  const [tipoFiltro, setTipoFiltro] = useState<TipoFundo | 'Todos'>('Todos')
  const [showSetorDropdown, setShowSetorDropdown] = useState(false)

  // Usar dados integrados com interações
  const fundosData = getFundosComInteracoes()

  // Extrair setores únicos dos dados
  const setoresFiltro = useMemo(() => {
    const setoresUnicos = new Set<string>(['Todos'])
    setoresFiltroBase.forEach(s => setoresUnicos.add(s))
    fundosData.forEach(fundo => {
      if (fundo.setores && Array.isArray(fundo.setores)) {
        fundo.setores.forEach(s => {
          if (s && typeof s === 'string' && s.length < 30) {
            setoresUnicos.add(s)
          }
        })
      }
    })
    return Array.from(setoresUnicos)
  }, [fundosData])

  const fundosFiltrados = fundosData.filter((fundo) => {
    const searchLower = search.toLowerCase()
    const matchSearch =
      fundo.nome?.toLowerCase().includes(searchLower) ||
      fundo.contato?.toLowerCase().includes(searchLower) ||
      fundo.email?.toLowerCase().includes(searchLower)

    const setores = fundo.setores || []
    const matchSetor = setorFiltro === 'Todos' || setores.includes(setorFiltro)

    const matchTipo = tipoFiltro === 'Todos' || fundo.tipoFundo === tipoFiltro

    return matchSearch && matchSetor && matchTipo
  })

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Fundos de Private Equity"
        subtitle={`${fundosData.length} fundos mapeados`}
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Filtros */}
        <div className="flex flex-col gap-4">
          {/* Linha 1: Busca e botão novo */}
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                placeholder="Buscar por fundo, contato ou email..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button className="ml-auto">
              <Plus className="h-4 w-4 mr-2" />
              Novo Fundo
            </Button>
          </div>

          {/* Linha 2: Filtro por Tipo de Fundo */}
          <div className="flex gap-2 items-center">
            <span className="text-sm text-slate-500 mr-2">Tipo:</span>
            <Button
              variant={tipoFiltro === 'Todos' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTipoFiltro('Todos')}
            >
              Todos
            </Button>
            {tiposFundo.map((tipo) => (
              <Button
                key={tipo}
                variant={tipoFiltro === tipo ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTipoFiltro(tipo)}
              >
                {tipo}
              </Button>
            ))}
          </div>

          {/* Linha 3: Filtro por Setor com Dropdown */}
          <div className="flex gap-2 items-center flex-wrap">
            <span className="text-sm text-slate-500 mr-2">Setor:</span>
            <Button
              variant={setorFiltro === 'Todos' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSetorFiltro('Todos')}
            >
              Todos
            </Button>
            {setoresFiltro.slice(1, 8).map((setor) => (
              <Button
                key={setor}
                variant={setorFiltro === setor ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSetorFiltro(setor)}
              >
                {setor}
              </Button>
            ))}

            {setoresFiltro.length > 8 && (
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSetorDropdown(!showSetorDropdown)}
                  className="gap-1"
                >
                  Mais setores
                  <ChevronDown className="h-4 w-4" />
                </Button>

                {showSetorDropdown && (
                  <div className="absolute left-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-20 min-w-[180px] max-h-[300px] overflow-y-auto">
                    {setoresFiltro.slice(8).map((setor) => (
                      <button
                        key={setor}
                        className={`w-full px-3 py-2 text-sm text-left hover:bg-slate-100 ${
                          setorFiltro === setor ? 'bg-blue-50 text-blue-600' : ''
                        }`}
                        onClick={() => {
                          setSetorFiltro(setor)
                          setShowSetorDropdown(false)
                        }}
                      >
                        {setor}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Resultados */}
        <p className="text-sm text-slate-500">
          Mostrando {fundosFiltrados.length} de {fundosData.length} fundos
          {tipoFiltro !== 'Todos' && ` | Tipo: ${tipoFiltro}`}
          {setorFiltro !== 'Todos' && ` | Setor: ${setorFiltro}`}
        </p>

        {/* Lista de Fundos */}
        <div className="grid gap-4">
          {fundosFiltrados.map((fundo) => {
            const setores = fundo.setores || []
            const tipoFundo = fundo.tipoFundo || 'Outros'
            return (
              <Card
                key={fundo.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 flex-shrink-0">
                        <Building2 className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg">{fundo.nome}</h3>
                          <Badge className={tipoCor[tipoFundo]}>
                            {tipoFundo}
                          </Badge>
                          {fundo.totalInteracoes > 0 && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {fundo.totalInteracoes} interações
                            </Badge>
                          )}
                        </div>

                        {/* Informações principais - vindas das interações */}
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-3">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <div>
                              <p className="text-xs text-slate-500">Ticket Médio</p>
                              <p className="text-sm font-medium">{fundo.ticketMedio || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                            <div>
                              <p className="text-xs text-slate-500">EBITDA</p>
                              <p className="text-sm font-medium">{fundo.ebitdaMinimo || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-cyan-600" />
                            <div>
                              <p className="text-xs text-slate-500">Faturamento</p>
                              <p className="text-sm font-medium">{fundo.faturamentoMinimo || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-purple-600" />
                            <div>
                              <p className="text-xs text-slate-500">Deal Ideal</p>
                              <p className="text-sm font-medium">{fundo.dealIdeal || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-blue-600" />
                            <div>
                              <p className="text-xs text-slate-500">Posição</p>
                              <p className="text-sm font-medium">{fundo.posicao || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Wallet className="h-4 w-4 text-amber-600" />
                            <div>
                              <p className="text-xs text-slate-500">Disponível</p>
                              <p className="text-sm font-medium">{fundo.disponibilidadeFundo || 'N/A'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Setores */}
                        {setores.length > 0 && (
                          <div className="flex gap-1 mt-3 flex-wrap">
                            {setores.slice(0, 5).map((setor: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {setor}
                              </Badge>
                            ))}
                            {setores.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{setores.length - 5}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Última interação */}
                        {fundo.ultimaInteracao && (
                          <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                            <Calendar className="h-3 w-3" />
                            <span>Última conversa: {fundo.ultimaInteracao.data}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 ml-4">
                      <div className="text-right min-w-[180px]">
                        {fundo.contato && (
                          <p className="text-sm font-medium">{fundo.contato}</p>
                        )}
                        {fundo.email && (
                          <div className="flex items-center justify-end gap-1 mt-1 text-xs text-slate-500">
                            <Mail className="h-3 w-3" />
                            <a href={`mailto:${fundo.email}`} className="hover:text-blue-600">
                              {fundo.email}
                            </a>
                          </div>
                        )}
                        {fundo.telefone && (
                          <div className="flex items-center justify-end gap-1 mt-1 text-xs text-slate-500">
                            <Phone className="h-3 w-3" />
                            {fundo.telefone}
                          </div>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {fundosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 mx-auto text-slate-300" />
            <h3 className="mt-4 text-lg font-medium text-slate-900">
              Nenhum fundo encontrado
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Tente ajustar os filtros ou a busca.
            </p>
          </div>
        )}
      </div>

      {showSetorDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowSetorDropdown(false)}
        />
      )}
    </div>
  )
}
