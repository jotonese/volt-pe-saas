'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useData, InvestidaData } from '@/contexts/DataContext'
import {
  Search,
  Target,
  Building2,
  Upload,
} from 'lucide-react'

// Cores por setor
const coresSetores: Record<string, string> = {
  'Tecnologia': '#3B82F6',
  'Agronegócio': '#84CC16',
  'Consumo': '#F59E0B',
  'Saúde': '#EF4444',
  'Serviços': '#6366F1',
  'Educação': '#8B5CF6',
  'Infraestrutura': '#64748B',
  'Distribuição': '#F97316',
  'Serviços Financeiros': '#10B981',
  'Varejo': '#EC4899',
  'Telecom': '#06B6D4',
}

// Dados de exemplo baseados no relatório
const investidasExemplo: InvestidaData[] = [
  {
    id: '1',
    setor: 'Tecnologia',
    numInvestidas: 20,
    segmentos: [
      'Transformação digital', 'Plataformas e-commerce', 'Hospedagem',
      'Proptech', 'Logtech', 'Legaltech', 'Marketplace', 'Conteúdo/eventos',
      'Tech bancária', 'Cybersecurity', 'Software (core bancário)', 'HRtech', 'Meios de pagamento',
    ],
  },
  {
    id: '2',
    setor: 'Agronegócio',
    numInvestidas: 13,
    segmentos: [
      'Nutrição e saúde animal', 'Insumos biológicos', 'Agtech',
      'Vitaminas, suplementos e minerais', 'Análise de solo', 'Fertilizantes especiais',
      'Revendas agropecuárias', 'Fertilizantes "Next-Gen"', 'Sementes',
    ],
  },
  {
    id: '3',
    setor: 'Consumo',
    numInvestidas: 9,
    segmentos: [
      'Beleza e cosméticos', 'Marcas nativas digitais', 'Calçados',
      'Pães congelados', 'Empanadas', 'Pet', 'Pneus', 'HPC',
    ],
  },
  {
    id: '4',
    setor: 'Saúde',
    numInvestidas: 8,
    segmentos: [
      'Produtos odontológicos', 'Franquias', 'Clínicas', 'Aluguel de equipamentos',
      'Hospitais veterinários', 'Clínicas de saúde mental', 'Fertilidade', 'Oftalmologia',
    ],
  },
  {
    id: '5',
    setor: 'Serviços',
    numInvestidas: 6,
    segmentos: [
      'Catering', 'Gestão de facilities', 'Manutenção industrial',
      'Locação de equipamentos de grande porte', 'Consultoria e auditoria',
      'Segurança e monitoramento', 'Serviços funerários e cemitérios',
    ],
  },
  {
    id: '6',
    setor: 'Educação',
    numInvestidas: 6,
    segmentos: ['Ensino básico', 'Educação continuada para saúde', 'Ensino não regulado'],
  },
  {
    id: '7',
    setor: 'Infraestrutura',
    numInvestidas: 5,
    segmentos: ['Tratamento de efluentes', 'Logística especializada', 'Telecom', 'Saneamento', 'Transição energética'],
  },
  {
    id: '8',
    setor: 'Distribuição',
    numInvestidas: 3,
    segmentos: ['Distribuição de autopeças', 'B2B', 'Equipamentos médicos', 'Preenchedores faciais e clínicas de estética'],
  },
  {
    id: '9',
    setor: 'Serviços Financeiros',
    numInvestidas: 3,
    segmentos: ['Corretoras de seguro', 'Plataforma de crédito', 'Pagamentos', 'Banking as a service'],
  },
  {
    id: '10',
    setor: 'Varejo',
    numInvestidas: 2,
    segmentos: ['Supermercados regionais'],
  },
  {
    id: '11',
    setor: 'Telecom',
    numInvestidas: 2,
    segmentos: ['Fibra ótica', 'Provedores'],
  },
]

export default function InvestidasPage() {
  const router = useRouter()
  const { data, hasData } = useData()

  const [search, setSearch] = useState('')
  const [setorExpandido, setSetorExpandido] = useState<string | null>(null)

  // Usar dados importados ou dados de exemplo
  const investidasData = hasData && data.investidas.length > 0 ? data.investidas : investidasExemplo

  // Agrupar por setor se os dados vierem em outro formato
  const investidasPorSetor = useMemo(() => {
    // Se já estiver no formato agrupado (como os exemplos), usar diretamente
    if (investidasData.length > 0 && investidasData[0].numInvestidas !== undefined) {
      return investidasData.map(inv => ({
        setor: inv.setor,
        numInvestidas: inv.numInvestidas,
        segmentos: inv.segmentos || [],
        cor: coresSetores[inv.setor] || '#64748B',
      }))
    }
    // Caso contrário, agrupar os dados
    const agrupado: Record<string, { numInvestidas: number; segmentos: Set<string> }> = {}
    investidasData.forEach(inv => {
      if (!agrupado[inv.setor]) {
        agrupado[inv.setor] = { numInvestidas: 0, segmentos: new Set() }
      }
      agrupado[inv.setor].numInvestidas++
      inv.segmentos?.forEach(s => agrupado[inv.setor].segmentos.add(s))
    })
    return Object.entries(agrupado).map(([setor, dados]) => ({
      setor,
      numInvestidas: dados.numInvestidas,
      segmentos: Array.from(dados.segmentos),
      cor: coresSetores[setor] || '#64748B',
    }))
  }, [investidasData])

  const totalInvestidas = investidasPorSetor.reduce((acc, s) => acc + s.numInvestidas, 0)

  const setoresFiltrados = investidasPorSetor.filter((setor) => {
    const matchSearch =
      setor.setor.toLowerCase().includes(search.toLowerCase()) ||
      setor.segmentos.some((s) => s.toLowerCase().includes(search.toLowerCase()))
    return matchSearch
  })

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Investidas - Add-ons"
        subtitle={`${totalInvestidas} empresas investidas buscando consolidação${hasData && data.fileName ? ` (${data.fileName})` : ''}`}
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Banner de dados não importados */}
        {!hasData && (
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Upload className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-medium text-amber-800">Dados de exemplo</p>
                    <p className="text-sm text-amber-600">
                      Importe seu arquivo Excel para ver os dados reais.
                    </p>
                  </div>
                </div>
                <Button size="sm" onClick={() => router.push('/importar')}>
                  Importar Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resumo */}
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{totalInvestidas} empresas</h2>
                <p className="text-blue-100 mt-1">
                  Investidas de fundos de PE buscando aquisições e consolidação
                </p>
                <p className="text-sm text-blue-200 mt-2">
                  Distribuídas em {investidasPorSetor.length} setores
                </p>
              </div>
              <Target className="h-16 w-16 text-blue-300" />
            </div>
          </CardContent>
        </Card>

        {/* Filtros */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              placeholder="Buscar por setor ou segmento..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Lista por Setor */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {setoresFiltrados.map((setor) => (
            <Card
              key={setor.setor}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() =>
                setSetorExpandido(setorExpandido === setor.setor ? null : setor.setor)
              }
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${setor.cor}20` }}
                    >
                      <Building2
                        className="h-5 w-5"
                        style={{ color: setor.cor }}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-base">{setor.setor}</CardTitle>
                      <p className="text-sm text-slate-500">
                        {setor.numInvestidas} investidas
                      </p>
                    </div>
                  </div>
                  <div
                    className="h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold text-white"
                    style={{ backgroundColor: setor.cor }}
                  >
                    {setor.numInvestidas}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500 mb-2">Segmentos de interesse:</p>
                <div className="flex flex-wrap gap-1">
                  {setor.segmentos
                    .slice(0, setorExpandido === setor.setor ? undefined : 4)
                    .map((seg) => (
                      <Badge key={seg} variant="outline" className="text-xs">
                        {seg}
                      </Badge>
                    ))}
                  {setorExpandido !== setor.setor && setor.segmentos.length > 4 && (
                    <Badge variant="secondary" className="text-xs">
                      +{setor.segmentos.length - 4} mais
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {setoresFiltrados.length === 0 && (
          <div className="text-center py-12">
            <Target className="h-12 w-12 mx-auto text-slate-300" />
            <h3 className="mt-4 text-lg font-medium text-slate-900">
              Nenhum resultado encontrado
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Tente buscar por outro termo.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
