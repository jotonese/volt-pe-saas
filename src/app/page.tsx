'use client'

import { useMemo } from 'react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useData } from '@/contexts/DataContext'
import { BarChart3 } from 'lucide-react'

// Função para extrair valor numérico de uma string de valor monetário
// Ex: "R$ 150-400mi" -> { min: 150, max: 400 }
// Ex: "R$ 100mi" -> { min: 100, max: 100 }
// Ex: "USD 50-70mi" -> { min: 50, max: 70 }
function parseValorMonetario(valor: string | undefined): { min: number | null, max: number | null } {
  if (!valor) return { min: null, max: null }

  // Remove prefixos de moeda e espaços
  const limpo = valor
    .replace(/R\$\s*/gi, '')
    .replace(/USD\s*/gi, '')
    .replace(/US\$\s*/gi, '')
    .replace(/milhões/gi, '')
    .replace(/mi\b/gi, '')
    .replace(/M\b/gi, '')
    .trim()

  // Verifica se tem range (ex: "150-400" ou "150 a 400")
  const rangeMatch = limpo.match(/(\d+(?:[.,]\d+)?)\s*[-–a]\s*(\d+(?:[.,]\d+)?)/i)
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1].replace(',', '.'))
    const max = parseFloat(rangeMatch[2].replace(',', '.'))
    return { min, max }
  }

  // Verifica valor único
  const unicoMatch = limpo.match(/(\d+(?:[.,]\d+)?)/i)
  if (unicoMatch) {
    const val = parseFloat(unicoMatch[1].replace(',', '.'))
    return { min: val, max: val }
  }

  return { min: null, max: null }
}

// Função para formatar valor monetário
function formatarValor(valor: number): string {
  if (valor >= 1000) {
    return `R$ ${(valor / 1000).toFixed(1).replace('.0', '')}bi`
  }
  return `R$ ${valor}mi`
}

type SetorAgregado = {
  setor: string
  numFundos: number
  segmentos: string[]
  fatMinimo: number | null
  chequeMin: number | null
  chequeMax: number | null
}

export default function DashboardPage() {
  const { getFundosComInteracoes } = useData()
  const fundos = getFundosComInteracoes()

  // Agregar dados por setor
  const dadosPorSetor = useMemo(() => {
    const setoresMap = new Map<string, {
      fundos: Set<string>
      segmentos: Set<string>
      faturamentos: number[]
      ticketsMin: number[]
      ticketsMax: number[]
    }>()

    fundos.forEach(fundo => {
      // Pegar setores do fundo (pode vir dos critérios das interações ou do cadastro)
      const setoresFundo = fundo.criteriosAtuais?.setores || fundo.setores || []

      setoresFundo.forEach(setor => {
        if (!setoresMap.has(setor)) {
          setoresMap.set(setor, {
            fundos: new Set(),
            segmentos: new Set(),
            faturamentos: [],
            ticketsMin: [],
            ticketsMax: [],
          })
        }

        const dados = setoresMap.get(setor)!
        dados.fundos.add(fundo.id)

        // Coletar segmentos de interesse do fundo para este setor
        // Os segmentos podem vir de diferentes fontes
        if (fundo.segmentos) {
          fundo.segmentos.forEach(seg => dados.segmentos.add(seg))
        }

        // Processar faturamento mínimo
        const faturamento = fundo.faturamentoMinimo || fundo.criteriosAtuais?.faturamentoMinimo
        const fatParsed = parseValorMonetario(faturamento)
        if (fatParsed.min !== null) {
          dados.faturamentos.push(fatParsed.min)
        }

        // Processar ticket/cheque
        const ticket = fundo.ticketMedio || fundo.criteriosAtuais?.ticketMedio
        const ticketParsed = parseValorMonetario(ticket)
        if (ticketParsed.min !== null) {
          dados.ticketsMin.push(ticketParsed.min)
        }
        if (ticketParsed.max !== null) {
          dados.ticketsMax.push(ticketParsed.max)
        }
      })
    })

    // Converter para array e calcular agregados
    const resultado: SetorAgregado[] = []

    setoresMap.forEach((dados, setor) => {
      resultado.push({
        setor,
        numFundos: dados.fundos.size,
        segmentos: Array.from(dados.segmentos),
        fatMinimo: dados.faturamentos.length > 0 ? Math.min(...dados.faturamentos) : null,
        chequeMin: dados.ticketsMin.length > 0 ? Math.min(...dados.ticketsMin) : null,
        chequeMax: dados.ticketsMax.length > 0 ? Math.max(...dados.ticketsMax) : null,
      })
    })

    // Ordenar por número de fundos (decrescente)
    resultado.sort((a, b) => b.numFundos - a.numFundos)

    return resultado
  }, [fundos])

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Dashboard"
        subtitle="Visão consolidada por setor"
      />

      <div className="flex-1 p-4 lg:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Interesse dos Fundos por Setor
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dadosPorSetor.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Setor</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700"># Fundos</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Segmentos de Interesse</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Fat. Mínimo</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Cheque</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dadosPorSetor.map((item, index) => (
                      <tr
                        key={item.setor}
                        className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-slate-25'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-900">{item.setor}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                            {item.numFundos}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {item.segmentos.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {item.segmentos.slice(0, 4).map((seg, i) => (
                                <span
                                  key={i}
                                  className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded"
                                >
                                  {seg}
                                </span>
                              ))}
                              {item.segmentos.length > 4 && (
                                <span className="inline-block px-2 py-0.5 bg-slate-200 text-slate-500 text-xs rounded">
                                  +{item.segmentos.length - 4}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {item.fatMinimo !== null ? (
                            <span className="text-slate-700">{formatarValor(item.fatMinimo)}</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {item.chequeMin !== null && item.chequeMax !== null ? (
                            <span className="text-slate-700">
                              {item.chequeMin === item.chequeMax
                                ? formatarValor(item.chequeMin)
                                : `${formatarValor(item.chequeMin)} - ${formatarValor(item.chequeMax)}`
                              }
                            </span>
                          ) : item.chequeMin !== null ? (
                            <span className="text-slate-700">{formatarValor(item.chequeMin)}</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 mx-auto text-slate-300" />
                <p className="mt-3 text-slate-500">Nenhum dado disponível</p>
                <p className="text-sm text-slate-400">
                  Cadastre fundos com setores de interesse para ver o resumo aqui
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
