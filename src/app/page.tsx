'use client'

import { Header } from '@/components/layout/Header'
import { StatsCard } from '@/components/cards/StatsCard'
import { SetorCard } from '@/components/cards/SetorCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  Target,
  TrendingUp,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

// Dados de exemplo baseados no relatório
const setoresData = [
  {
    nome: 'Tecnologia',
    numFundos: 26,
    faturamentoMinimo: 50000000,
    chequeMinimo: 15000000,
    chequeMaximo: 600000000,
    segmentos: ['Transformação digital', 'IA', 'Datacenter', 'SaaS', 'Cybersecurity', 'IoT'],
    cor: '#3B82F6',
  },
  {
    nome: 'Saúde',
    numFundos: 24,
    faturamentoMinimo: 100000000,
    chequeMinimo: 30000000,
    chequeMaximo: 600000000,
    segmentos: ['Bem-estar/wellness', 'Clínicas especializadas', 'Desospitalização', 'Equipamentos'],
    cor: '#EF4444',
  },
  {
    nome: 'Consumo',
    numFundos: 23,
    faturamentoMinimo: 100000000,
    chequeMinimo: 50000000,
    chequeMaximo: 600000000,
    segmentos: ['Beleza', 'Cosméticos', 'Alimentos saudáveis', 'Suplementos', 'Moda'],
    cor: '#F59E0B',
  },
  {
    nome: 'Serv. Financeiros',
    numFundos: 20,
    faturamentoMinimo: 100000000,
    chequeMinimo: 30000000,
    chequeMaximo: 600000000,
    segmentos: ['Meios de pagamento', 'Seguros', 'Crédito', 'Insurtechs'],
    cor: '#10B981',
  },
  {
    nome: 'Agronegócio',
    numFundos: 17,
    faturamentoMinimo: 100000000,
    chequeMinimo: 70000000,
    chequeMaximo: 600000000,
    segmentos: ['Insumos biológicos', 'Fertilizantes', 'Agricultura de precisão', 'Sementes'],
    cor: '#84CC16',
  },
  {
    nome: 'Educação',
    numFundos: 16,
    faturamentoMinimo: 80000000,
    chequeMinimo: 30000000,
    chequeMaximo: 600000000,
    segmentos: ['Ensino básico', 'Educação continuada', 'Sistemas de ensino', 'Idiomas'],
    cor: '#8B5CF6',
  },
]

const ultimasInteracoes = [
  { fundo: 'Pátria Investimentos', tipo: 'Video Call', data: '20/01/2025', setor: 'Tecnologia' },
  { fundo: 'Vinci Partners', tipo: 'Reunião Presencial', data: '18/01/2025', setor: 'Saúde' },
  { fundo: 'Advent International', tipo: 'Email', data: '17/01/2025', setor: 'Consumo' },
  { fundo: 'Warburg Pincus', tipo: 'Video Call', data: '15/01/2025', setor: 'Tecnologia' },
]

const performanceMercado = [
  { setor: 'Tecnologia', variacao: 4.3, destaque: 'Allied +18.3%' },
  { setor: 'Consumo', variacao: -12.5, destaque: 'JBS +74.3%' },
  { setor: 'Saúde', variacao: -19.4, destaque: 'Hapvida -50%' },
  { setor: 'Agronegócio', variacao: -7.8, destaque: '3Tentos +34.3%' },
]

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Dashboard"
        subtitle="Visão geral do mercado de Private Equity"
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Fundos Mapeados"
            value={47}
            change="+3 novos em 2025"
            changeType="positive"
            icon={Building2}
            iconColor="bg-blue-100 text-blue-600"
          />
          <StatsCard
            title="Investidas (Add-ons)"
            value={77}
            change="+12% vs 2024"
            changeType="positive"
            icon={Target}
            iconColor="bg-green-100 text-green-600"
          />
          <StatsCard
            title="Pipeline Ativo"
            value={12}
            change="5 em negociação"
            changeType="neutral"
            icon={TrendingUp}
            iconColor="bg-purple-100 text-purple-600"
          />
          <StatsCard
            title="Interações (30d)"
            value={24}
            change="8 reuniões agendadas"
            changeType="neutral"
            icon={Users}
            iconColor="bg-orange-100 text-orange-600"
          />
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Setores de Interesse */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Setores de Interesse dos Fundos
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {setoresData.map((setor) => (
                <SetorCard key={setor.nome} {...setor} />
              ))}
            </div>
          </div>

          {/* Sidebar - Últimas Interações & Performance */}
          <div className="space-y-6">
            {/* Últimas Interações */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Últimas Interações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {ultimasInteracoes.map((interacao, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium text-sm">{interacao.fundo}</p>
                      <p className="text-xs text-slate-500">
                        {interacao.tipo} · {interacao.data}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {interacao.setor}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Performance de Mercado */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Performance B3 (LTM)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {performanceMercado.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium text-sm">{item.setor}</p>
                      <p className="text-xs text-slate-500">{item.destaque}</p>
                    </div>
                    <div
                      className={`flex items-center gap-1 text-sm font-semibold ${
                        item.variacao >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {item.variacao >= 0 ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      {item.variacao >= 0 ? '+' : ''}
                      {item.variacao}%
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Indicadores Macro */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Indicadores Macro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">IBOV (LTM)</p>
                    <p className="text-lg font-semibold text-green-600">+4,38%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Selic</p>
                    <p className="text-lg font-semibold">14,25%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">IPCA (LTM)</p>
                    <p className="text-lg font-semibold">5,06%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Dólar</p>
                    <p className="text-lg font-semibold">R$ 6,05</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
