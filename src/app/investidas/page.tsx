'use client'

import { useState, useMemo } from 'react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useData } from '@/contexts/DataContext'
import {
  Search,
  Target,
  Building2,
} from 'lucide-react'

export default function InvestidasPage() {
  const { data } = useData()
  const portfolio = data.portfolio

  const [search, setSearch] = useState('')

  // Filtrar apenas empresas que buscam add-ons
  const empresasBuscandoAddOn = useMemo(() => {
    return portfolio.filter(empresa => empresa.buscandoAddOn && empresa.status === 'Ativo')
  }, [portfolio])

  // Calcular setores únicos
  const setoresUnicos = useMemo(() => {
    const setores = new Set<string>()
    empresasBuscandoAddOn.forEach(empresa => {
      if (empresa.setor) setores.add(empresa.setor)
    })
    return setores.size
  }, [empresasBuscandoAddOn])

  // Filtrar por busca
  const empresasFiltradas = useMemo(() => {
    if (!search.trim()) return empresasBuscandoAddOn

    const termoBusca = search.toLowerCase()
    return empresasBuscandoAddOn.filter(empresa =>
      empresa.nome.toLowerCase().includes(termoBusca) ||
      empresa.fundoNome.toLowerCase().includes(termoBusca) ||
      empresa.setor.toLowerCase().includes(termoBusca) ||
      empresa.segmentosAddOn?.some(seg => seg.toLowerCase().includes(termoBusca))
    )
  }, [empresasBuscandoAddOn, search])

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Investidas (Add-ons)"
        subtitle="Empresas do portfolio buscando aquisições"
      />

      <div className="flex-1 p-4 lg:p-6 space-y-6">
        {/* Resumo */}
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{empresasBuscandoAddOn.length} empresas</h2>
                <p className="text-blue-100 mt-1">
                  Investidas de fundos de PE buscando aquisições e consolidação
                </p>
                <p className="text-sm text-blue-200 mt-2">
                  Distribuídas em {setoresUnicos} setores
                </p>
              </div>
              <Target className="h-16 w-16 text-blue-300" />
            </div>
          </CardContent>
        </Card>

        {/* Filtro de busca */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              placeholder="Buscar por empresa, fundo, setor ou segmento..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Empresas Buscando Add-ons
            </CardTitle>
          </CardHeader>
          <CardContent>
            {empresasFiltradas.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Empresa (Add-on)</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Fundo Responsável</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Setor</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Segmentos de Interesse</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empresasFiltradas.map((empresa, index) => (
                      <tr
                        key={empresa.id}
                        className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-slate-25'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div>
                            <span className="font-medium text-slate-900">{empresa.nome}</span>
                            {empresa.descricao && (
                              <p className="text-xs text-slate-500 mt-0.5">{empresa.descricao}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-slate-700">{empresa.fundoNome}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                            {empresa.setor}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {empresa.segmentosAddOn && empresa.segmentosAddOn.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {empresa.segmentosAddOn.slice(0, 3).map((seg, i) => (
                                <span
                                  key={i}
                                  className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded"
                                >
                                  {seg}
                                </span>
                              ))}
                              {empresa.segmentosAddOn.length > 3 && (
                                <div className="relative group">
                                  <span className="inline-block px-2 py-0.5 bg-slate-200 text-slate-500 text-xs rounded cursor-pointer hover:bg-slate-300 transition-colors">
                                    +{empresa.segmentosAddOn.length - 3}
                                  </span>
                                  {/* Tooltip */}
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                                    <div className="bg-slate-800 text-white text-xs rounded-lg py-2 px-3 shadow-lg max-w-xs">
                                      <p className="font-medium mb-1 text-slate-300">Mais segmentos:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {empresa.segmentosAddOn.slice(3).map((seg, i) => (
                                          <span
                                            key={i}
                                            className="inline-block px-1.5 py-0.5 bg-slate-700 rounded text-slate-200"
                                          >
                                            {seg}
                                          </span>
                                        ))}
                                      </div>
                                      {/* Seta do tooltip */}
                                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-sm">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="h-12 w-12 mx-auto text-slate-300" />
                <p className="mt-3 text-slate-500">
                  {search ? 'Nenhum resultado encontrado' : 'Nenhuma empresa buscando add-ons'}
                </p>
                <p className="text-sm text-slate-400">
                  {search
                    ? 'Tente buscar por outro termo.'
                    : 'Cadastre empresas no portfolio com "Buscando Add-on" ativado.'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
