'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useData } from '@/contexts/DataContext'
import {
  FileSpreadsheet,
  Upload,
  CheckCircle,
  AlertCircle,
  FileText,
  Table,
  ArrowRight,
  Loader2,
} from 'lucide-react'

type ImportStatus = 'idle' | 'analyzing' | 'uploading' | 'processing' | 'success' | 'error'

type SheetPreview = {
  sheetName: string
  headers: string[]
  rowCount: number
  sampleRows: Record<string, any>[]
}

type AnalysisResult = {
  fileName: string
  fileSize: number
  sheets: SheetPreview[]
  extractedData: {
    fundos: any[]
    investidas: any[]
    transacoes: any[]
  }
}

export default function ImportarPage() {
  const router = useRouter()
  const { importData, hasData, data } = useData()

  const [status, setStatus] = useState<ImportStatus>('idle')
  const [file, setFile] = useState<File | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      setError('Por favor, selecione um arquivo Excel (.xlsx ou .xls)')
      return
    }

    setFile(selectedFile)
    setError(null)
    setStatus('analyzing')
    setAnalysis(null)

    try {
      // Enviar arquivo para API para análise
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/import-excel', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao analisar arquivo')
      }

      const result = await response.json()
      setAnalysis(result)
      setStatus('idle')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar arquivo')
      setStatus('error')
    }
  }, [])

  const handleImport = useCallback(async () => {
    if (!analysis) return

    setStatus('processing')

    try {
      // Importar os dados extraídos para o contexto global
      importData(
        {
          fundos: analysis.extractedData.fundos,
          investidas: analysis.extractedData.investidas,
          transacoes: analysis.extractedData.transacoes,
        },
        analysis.fileName
      )

      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao importar dados')
      setStatus('error')
    }
  }, [analysis, importData])

  const handleCancel = useCallback(() => {
    setFile(null)
    setAnalysis(null)
    setStatus('idle')
    setError(null)
  }, [])

  const totalRecords = analysis
    ? analysis.extractedData.fundos.length +
      analysis.extractedData.investidas.length +
      analysis.extractedData.transacoes.length
    : 0

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Importar Excel"
        subtitle="Importe dados do arquivo de fundos de PE"
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Status atual dos dados */}
        {hasData && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-800">Dados já importados</p>
                    <p className="text-sm text-blue-600">
                      {data.fundos.length} fundos, {data.investidas.length} investidas, {data.transacoes.length} transações
                      {data.fileName && ` (${data.fileName})`}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push('/fundos')}>
                  Ver Fundos
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Upload de Arquivo
            </CardTitle>
            <CardDescription>
              Selecione o arquivo Excel com os dados dos fundos de PE (Copy of Fundos_PE v3.xlsx)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                disabled={status === 'analyzing' || status === 'processing'}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                {status === 'analyzing' ? (
                  <>
                    <Loader2 className="h-12 w-12 mx-auto text-blue-500 mb-4 animate-spin" />
                    <p className="text-lg font-medium text-slate-700">
                      Analisando arquivo...
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      Aguarde enquanto processamos o Excel
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                    <p className="text-lg font-medium text-slate-700">
                      Clique para selecionar ou arraste o arquivo
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      Suporta arquivos .xlsx e .xls
                    </p>
                  </>
                )}
              </label>
            </div>

            {file && status !== 'analyzing' && (
              <div className="mt-4 flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-slate-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">Arquivo selecionado</Badge>
              </div>
            )}

            {error && (
              <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview dos Dados Analisados */}
        {analysis && status !== 'success' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Table className="h-5 w-5" />
                Preview dos Dados
              </CardTitle>
              <CardDescription>
                Verifique os dados extraídos antes de importar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Resumo dos dados extraídos */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {analysis.extractedData.fundos.length}
                  </p>
                  <p className="text-sm text-blue-800">Fundos de PE</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {analysis.extractedData.investidas.length}
                  </p>
                  <p className="text-sm text-green-800">Investidas</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {analysis.extractedData.transacoes.length}
                  </p>
                  <p className="text-sm text-purple-800">Transações</p>
                </div>
              </div>

              {/* Abas do Excel */}
              {analysis.sheets.map((sheet) => (
                <div key={sheet.sheetName} className="border rounded-lg overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-slate-500" />
                      <span className="font-medium">{sheet.sheetName}</span>
                    </div>
                    <Badge>{sheet.rowCount} linhas</Badge>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100">
                        <tr>
                          {sheet.headers.slice(0, 6).map((col) => (
                            <th key={col} className="px-4 py-2 text-left font-medium text-slate-600">
                              {col}
                            </th>
                          ))}
                          {sheet.headers.length > 6 && (
                            <th className="px-4 py-2 text-left font-medium text-slate-400">
                              +{sheet.headers.length - 6} colunas
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {sheet.sampleRows.slice(0, 3).map((row, i) => (
                          <tr key={i} className="border-t">
                            {sheet.headers.slice(0, 6).map((col) => (
                              <td key={col} className="px-4 py-2 text-slate-700 max-w-[200px] truncate">
                                {String(row[col] ?? '-')}
                              </td>
                            ))}
                            {sheet.headers.length > 6 && (
                              <td className="px-4 py-2 text-slate-400">...</td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-slate-50 px-4 py-2 text-xs text-slate-500">
                    Mostrando {Math.min(3, sheet.sampleRows.length)} de {sheet.rowCount} registros
                  </div>
                </div>
              ))}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={status === 'processing'}
                >
                  {status === 'processing' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>
                      Importar {totalRecords} Registros
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status de Sucesso */}
        {status === 'success' && analysis && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-800">
                    Importação concluída com sucesso!
                  </h3>
                  <p className="text-green-600 mt-1">
                    {totalRecords} registros importados de {analysis.sheets.length} planilhas.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancel}>
                    Importar Outro
                  </Button>
                  <Button onClick={() => router.push('/fundos')}>
                    Ver Fundos
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instruções */}
        <Card>
          <CardHeader>
            <CardTitle>Instruções de Importação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <p>
              O sistema espera um arquivo Excel com a seguinte estrutura:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Aba "Fundos PE":</strong> Lista de fundos com nome, setores de interesse, critérios de faturamento e cheque
              </li>
              <li>
                <strong>Aba "Investidas":</strong> Empresas investidas buscando add-ons, organizadas por setor
              </li>
              <li>
                <strong>Aba "Transações":</strong> Transações recentes do mercado com target, buyer e valor
              </li>
              <li>
                <strong>Aba "Cotações":</strong> Dados históricos de cotações de empresas listadas (opcional)
              </li>
            </ul>
            <p className="text-slate-500 italic">
              O arquivo "Copy of Fundos_PE v3.xlsx" já está no formato esperado.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
