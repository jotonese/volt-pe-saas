import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

interface SetorCardProps {
  nome: string
  numFundos: number
  faturamentoMinimo: number
  chequeMinimo: number
  chequeMaximo: number
  segmentos: string[]
  cor: string
}

export function SetorCard({
  nome,
  numFundos,
  faturamentoMinimo,
  chequeMinimo,
  chequeMaximo,
  segmentos,
  cor,
}: SetorCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: cor }}
            />
            <CardTitle className="text-lg">{nome}</CardTitle>
          </div>
          <Badge variant="secondary">
            {numFundos} fundos
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Faturamento mín.</p>
              <p className="font-semibold">{formatCurrency(faturamentoMinimo)}</p>
            </div>
            <div>
              <p className="text-slate-500">Cheque</p>
              <p className="font-semibold">
                {formatCurrency(chequeMinimo)} - {formatCurrency(chequeMaximo)}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-2">Segmentos de interesse:</p>
            <div className="flex flex-wrap gap-1">
              {segmentos.slice(0, 3).map((seg) => (
                <Badge key={seg} variant="outline" className="text-xs">
                  {seg}
                </Badge>
              ))}
              {segmentos.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{segmentos.length - 3}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
