'use client'

import { useState, useMemo } from 'react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useData, PortfolioEmpresa } from '@/contexts/DataContext'
import {
  Search,
  Plus,
  Building2,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Calendar,
  ExternalLink,
  Target,
  Filter,
} from 'lucide-react'

const statusCor: Record<string, string> = {
  'Ativo': 'bg-green-100 text-green-700',
  'Saída': 'bg-slate-100 text-slate-700',
  'Em processo de saída': 'bg-amber-100 text-amber-700',
}

// Agrupar portfolio por fundo
interface FundoPortfolio {
  fundoId: string
  fundoNome: string
  empresas: PortfolioEmpresa[]
}

// Componente de card para cada fundo
function FundoPortfolioCard({ fundoData }: { fundoData: FundoPortfolio }) {
  const [expandido, setExpandido] = useState(true)
  const [filtroAddOn, setFiltroAddOn] = useState(false)

  const empresasFiltradas = filtroAddOn
    ? fundoData.empresas.filter(e => e.buscandoAddOn)
    : fundoData.empresas

  const empresasAtivas = fundoData.empresas.filter(e => e.status === 'Ativo').length
  const empresasBuscandoAddOn = fundoData.empresas.filter(e => e.buscandoAddOn).length

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-slate-50 border-b py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base">{fundoData.fundoNome}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {empresasAtivas} ativos
                </Badge>
                {empresasBuscandoAddOn > 0 && (
                  <Badge variant="outline" className="text-xs text-purple-600 border-purple-200 bg-purple-50">
                    <Target className="h-3 w-3 mr-1" />
                    {empresasBuscandoAddOn} buscando add-on
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {empresasBuscandoAddOn > 0 && (
              <Button
                variant={filtroAddOn ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFiltroAddOn(!filtroAddOn)}
                className="gap-1"
              >
                <Target className="h-4 w-4" />
                Add-ons
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandido(!expandido)}
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${expandido ? '' : '-rotate-90'}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      {expandido && (
        <CardContent className="p-0">
          <div className="divide-y">
            {empresasFiltradas.map((empresa) => (
              <div
                key={empresa.id}
                className="p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-slate-900">{empresa.nome}</h4>
                      <Badge className={statusCor[empresa.status]}>
                        {empresa.status}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {empresa.setor}
                      </Badge>
                      {empresa.buscandoAddOn && (
                        <Badge variant="outline" className="text-xs text-purple-600 border-purple-200 bg-purple-50">
                          <Target className="h-3 w-3 mr-1" />
                          Buscando add-on
                        </Badge>
                      )}
                    </div>

                    {empresa.descricao && (
                      <p className="text-sm text-slate-600 mt-1">
                        {empresa.descricao}
                      </p>
                    )}

                    {empresa.anoInvestimento && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                        <Calendar className="h-3 w-3" />
                        <span>Investido em {empresa.anoInvestimento}</span>
                      </div>
                    )}

                    {/* Informações de Add-on */}
                    {empresa.buscandoAddOn && empresa.segmentosAddOn && (
                      <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <p className="text-xs font-medium text-purple-700 mb-2">Buscando add-ons em:</p>
                        <div className="flex flex-wrap gap-1">
                          {empresa.segmentosAddOn.map((seg, i) => (
                            <Badge key={i} variant="outline" className="text-xs bg-white">
                              {seg}
                            </Badge>
                          ))}
                        </div>
                        {empresa.ticketAddOn && (
                          <p className="text-xs text-purple-600 mt-2">
                            <span className="font-medium">Ticket:</span> {empresa.ticketAddOn}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {empresa.website && (
                      <a
                        href={empresa.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-blue-600"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </div>
                </div>
              </div>
            ))}

            {empresasFiltradas.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                {filtroAddOn
                  ? 'Nenhuma empresa buscando add-on neste momento'
                  : 'Nenhuma empresa no portfolio'}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export default function PortfolioPage() {
  const { data } = useData()
  const [search, setSearch] = useState('')
  const [setorFiltro, setSetorFiltro] = useState('Todos')
  const [showSetorDropdown, setShowSetorDropdown] = useState(false)
  const [apenasAddOn, setApenasAddOn] = useState(false)

  // Extrair setores únicos do portfolio
  const setoresFiltro = useMemo(() => {
    const setores = new Set<string>(['Todos'])
    data.portfolio.forEach(emp => setores.add(emp.setor))
    return Array.from(setores)
  }, [data.portfolio])

  // Filtrar portfolio
  const portfolioFiltrado = useMemo(() => {
    return data.portfolio.filter(emp => {
      const searchLower = search.toLowerCase()
      const matchSearch =
        emp.nome.toLowerCase().includes(searchLower) ||
        emp.fundoNome.toLowerCase().includes(searchLower) ||
        emp.setor.toLowerCase().includes(searchLower) ||
        (emp.descricao?.toLowerCase().includes(searchLower))

      const matchSetor = setorFiltro === 'Todos' || emp.setor === setorFiltro
      const matchAddOn = !apenasAddOn || emp.buscandoAddOn

      return matchSearch && matchSetor && matchAddOn
    })
  }, [data.portfolio, search, setorFiltro, apenasAddOn])

  // Agrupar por fundo
  const fundosAgrupados = useMemo(() => {
    const grupos: Record<string, FundoPortfolio> = {}

    portfolioFiltrado.forEach(empresa => {
      if (!grupos[empresa.fundoId]) {
        grupos[empresa.fundoId] = {
          fundoId: empresa.fundoId,
          fundoNome: empresa.fundoNome,
          empresas: [],
        }
      }
      grupos[empresa.fundoId].empresas.push(empresa)
    })

    return Object.values(grupos).sort((a, b) => a.fundoNome.localeCompare(b.fundoNome))
  }, [portfolioFiltrado])

  // Estatísticas
  const totalEmpresas = data.portfolio.length
  const empresasAtivas = data.portfolio.filter(e => e.status === 'Ativo').length
  const buscandoAddOn = data.portfolio.filter(e => e.buscandoAddOn).length

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Portfolio dos Fundos"
        subtitle={`${totalEmpresas} empresas em ${new Set(data.portfolio.map(p => p.fundoId)).size} fundos`}
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalEmpresas}</p>
                  <p className="text-sm text-slate-500">Total de empresas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{empresasAtivas}</p>
                  <p className="text-sm text-slate-500">Investimentos ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{buscandoAddOn}</p>
                  <p className="text-sm text-slate-500">Buscando add-ons</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                placeholder="Buscar empresa, fundo ou setor..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              variant={apenasAddOn ? 'default' : 'outline'}
              onClick={() => setApenasAddOn(!apenasAddOn)}
              className="gap-2"
            >
              <Target className="h-4 w-4" />
              Apenas buscando add-on
            </Button>
            <Button className="ml-auto">
              <Plus className="h-4 w-4 mr-2" />
              Nova Empresa
            </Button>
          </div>

          {/* Filtro por Setor */}
          <div className="flex gap-2 items-center flex-wrap">
            <span className="text-sm text-slate-500 mr-2">Setor:</span>
            <Button
              variant={setorFiltro === 'Todos' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSetorFiltro('Todos')}
            >
              Todos
            </Button>
            {setoresFiltro.slice(1, 7).map((setor) => (
              <Button
                key={setor}
                variant={setorFiltro === setor ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSetorFiltro(setor)}
              >
                {setor}
              </Button>
            ))}

            {setoresFiltro.length > 7 && (
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
                    {setoresFiltro.slice(7).map((setor) => (
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
          Mostrando {portfolioFiltrado.length} de {totalEmpresas} empresas
          {setorFiltro !== 'Todos' && ` | Setor: ${setorFiltro}`}
          {apenasAddOn && ' | Apenas buscando add-on'}
        </p>

        {/* Lista de Fundos com Portfolio */}
        <div className="space-y-4">
          {fundosAgrupados.map((fundoData) => (
            <FundoPortfolioCard key={fundoData.fundoId} fundoData={fundoData} />
          ))}
        </div>

        {fundosAgrupados.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 mx-auto text-slate-300" />
            <h3 className="mt-4 text-lg font-medium text-slate-900">
              Nenhuma empresa encontrada
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
