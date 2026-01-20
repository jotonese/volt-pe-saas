'use client'

import { useState, useMemo } from 'react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useData, InteracaoData } from '@/contexts/DataContext'
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Building2,
  ArrowUpDown,
  DollarSign,
  TrendingUp,
  BarChart3,
  Target,
  Briefcase,
  Wallet,
} from 'lucide-react'

// Função para converter data DD/MM/YYYY para objeto Date
function parseData(data: string): Date {
  const [dia, mes, ano] = data.split('/').map(Number)
  return new Date(ano, mes - 1, dia)
}

// Função para extrair mês/ano de uma data no formato DD/MM/YYYY
function extrairMesAno(data: string): string {
  const partes = data.split('/')
  return `${partes[1]}/${partes[2]}`
}

// Função para obter lista de meses/anos únicos (ordenados do mais recente)
function getMesesDisponiveis(interacoes: InteracaoData[]): string[] {
  const meses = new Set<string>()
  interacoes.forEach(i => meses.add(extrairMesAno(i.data)))
  return Array.from(meses).sort((a, b) => {
    const [mesA, anoA] = a.split('/').map(Number)
    const [mesB, anoB] = b.split('/').map(Number)
    if (anoB !== anoA) return anoB - anoA
    return mesB - mesA
  })
}

// Função para obter a data mais recente de um conjunto de interações
function getDataMaisRecente(interacoes: InteracaoData[]): Date {
  return interacoes.reduce((mais, atual) => {
    const dataAtual = parseData(atual.data)
    return dataAtual > mais ? dataAtual : mais
  }, parseData(interacoes[0].data))
}

// Agrupar interações por fundo
interface FundoInteracoes {
  fundoId: string
  fundoNome: string
  interacoes: InteracaoData[]
}

// Componente de card para cada fundo
function FundoCard({ fundoData }: { fundoData: FundoInteracoes }) {
  const mesesDisponiveis = getMesesDisponiveis(fundoData.interacoes)
  const [mesSelecionado, setMesSelecionado] = useState<string>(mesesDisponiveis[0] || 'todos')
  const [expandido, setExpandido] = useState(true)
  const [showDropdown, setShowDropdown] = useState(false)

  const interacoesFiltradas = mesSelecionado === 'todos'
    ? fundoData.interacoes
    : fundoData.interacoes.filter(i => extrairMesAno(i.data) === mesSelecionado)

  const mesLabel = mesSelecionado === 'todos'
    ? 'Todas as datas'
    : mesSelecionado

  // Pegar os critérios mais recentes
  const criteriosMaisRecentes = fundoData.interacoes.find(i => i.criterios)?.criterios

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
              <p className="text-xs text-slate-500">
                {fundoData.interacoes.length} interações registradas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Seletor de Mês/Ano */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDropdown(!showDropdown)}
                className="min-w-[140px] justify-between"
              >
                {mesLabel}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>

              {showDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-10 min-w-[140px]">
                  <button
                    className={`w-full px-3 py-2 text-sm text-left hover:bg-slate-100 ${
                      mesSelecionado === 'todos' ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                    onClick={() => {
                      setMesSelecionado('todos')
                      setShowDropdown(false)
                    }}
                  >
                    Todas as datas
                  </button>
                  {mesesDisponiveis.map(mes => (
                    <button
                      key={mes}
                      className={`w-full px-3 py-2 text-sm text-left hover:bg-slate-100 ${
                        mesSelecionado === mes ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                      onClick={() => {
                        setMesSelecionado(mes)
                        setShowDropdown(false)
                      }}
                    >
                      {mes}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandido(!expandido)}
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${expandido ? '' : '-rotate-90'}`} />
            </Button>
          </div>
        </div>

        {/* Critérios atuais do fundo (da última interação) */}
        {criteriosMaisRecentes && expandido && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mt-3 pt-3 border-t border-slate-200">
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-green-600" />
              <div>
                <p className="text-[10px] text-slate-500">Ticket</p>
                <p className="text-xs font-medium">{criteriosMaisRecentes.ticketMedio || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              <div>
                <p className="text-[10px] text-slate-500">EBITDA</p>
                <p className="text-xs font-medium">{criteriosMaisRecentes.ebitdaMinimo || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5 text-cyan-600" />
              <div>
                <p className="text-[10px] text-slate-500">Faturamento</p>
                <p className="text-xs font-medium">{criteriosMaisRecentes.faturamentoMinimo || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-purple-600" />
              <div>
                <p className="text-[10px] text-slate-500">Deal</p>
                <p className="text-xs font-medium">{criteriosMaisRecentes.dealIdeal || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-blue-600" />
              <div>
                <p className="text-[10px] text-slate-500">Posição</p>
                <p className="text-xs font-medium">{criteriosMaisRecentes.posicao || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Wallet className="h-3.5 w-3.5 text-amber-600" />
              <div>
                <p className="text-[10px] text-slate-500">Disponível</p>
                <p className="text-xs font-medium">{criteriosMaisRecentes.disponibilidadeFundo || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      {expandido && (
        <CardContent className="p-0">
          <div className="divide-y">
            {interacoesFiltradas.map((interacao) => (
              <div
                key={interacao.id}
                className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium text-slate-700">
                        {interacao.data} às {interacao.hora}
                      </span>
                      <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0" />
                    </div>
                    <p className="text-sm text-slate-600 mt-2">
                      {interacao.resumo}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-slate-500">Participantes:</span>
                      <div className="flex gap-1 flex-wrap">
                        {interacao.participantes.map((p, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {p.split(' ')[0]}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Indicador se houve atualização de critérios nesta interação */}
                    {interacao.criterios && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs text-blue-600 border-blue-200 bg-blue-50">
                          Critérios atualizados nesta conversa
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {interacoesFiltradas.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                Nenhuma interação encontrada para este período
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export default function InteracoesPage() {
  const { data } = useData()
  const [ordenacao, setOrdenacao] = useState<'recente' | 'antiga'>('recente')

  // Agrupar interações por fundo
  const fundosAgrupados = useMemo(() => {
    const grupos: Record<string, FundoInteracoes> = {}

    data.interacoes.forEach(interacao => {
      if (!grupos[interacao.fundoId]) {
        grupos[interacao.fundoId] = {
          fundoId: interacao.fundoId,
          fundoNome: interacao.fundoNome,
          interacoes: [],
        }
      }
      grupos[interacao.fundoId].interacoes.push(interacao)
    })

    // Ordenar interações dentro de cada grupo por data (mais recente primeiro)
    Object.values(grupos).forEach(grupo => {
      grupo.interacoes.sort((a, b) => parseData(b.data).getTime() - parseData(a.data).getTime())
    })

    return Object.values(grupos)
  }, [data.interacoes])

  // Ordenar fundos pela data da última interação
  const fundosOrdenados = useMemo(() => {
    return [...fundosAgrupados].sort((a, b) => {
      if (a.interacoes.length === 0) return 1
      if (b.interacoes.length === 0) return -1

      const dataA = getDataMaisRecente(a.interacoes)
      const dataB = getDataMaisRecente(b.interacoes)
      return ordenacao === 'recente'
        ? dataB.getTime() - dataA.getTime()
        : dataA.getTime() - dataB.getTime()
    })
  }, [fundosAgrupados, ordenacao])

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Interações com Fundos"
        subtitle="Histórico de reuniões e contatos por fundo"
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Header com ações */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOrdenacao(ordenacao === 'recente' ? 'antiga' : 'recente')}
              className="gap-2"
            >
              <ArrowUpDown className="h-4 w-4" />
              {ordenacao === 'recente' ? 'Mais recente primeiro' : 'Mais antiga primeiro'}
            </Button>
            <span className="text-sm text-slate-500">
              {data.interacoes.length} interações em {fundosAgrupados.length} fundos
            </span>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Interação
          </Button>
        </div>

        {/* Lista de Fundos com suas Interações */}
        <div className="space-y-4">
          {fundosOrdenados.map((fundoData) => (
            <FundoCard key={fundoData.fundoId} fundoData={fundoData} />
          ))}
        </div>

        {fundosOrdenados.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 mx-auto text-slate-300" />
            <h3 className="mt-4 text-lg font-medium text-slate-900">
              Nenhuma interação registrada
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Clique em "Nova Interação" para adicionar.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
