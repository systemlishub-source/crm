// app/reports/components/StatisticalSummary.tsx
import { Card } from 'primereact/card';

interface StatisticalSummaryProps {
  data: any;
}

export default function StatisticalSummary({ data }: StatisticalSummaryProps) {
  return (
    <Card className="shadow-1 border-1 surface-border">
      <h3 className="text-base md:text-lg font-semibold mb-4">Resumo Estatístico</h3>
      <div className="grid">
        <div className="col-6 md:col-4">
          <div className="text-center p-2 md:p-3 border-round surface-100">
            <div className="text-xl md:text-2xl font-bold text-900">{data.metrics.totalOrders}</div>
            <small className="text-600 text-xs md:text-sm">Total de Vendas</small>
          </div>
        </div>
        <div className="col-6 md:col-4">
          <div className="text-center p-2 md:p-3 border-round surface-100">
            <div className="text-xl md:text-2xl font-bold text-900">R$ {data.metrics.totalRevenue.toFixed(2)}</div>
            <small className="text-600 text-xs md:text-sm">Faturamento Total</small>
          </div>
        </div>
        <div className="col-6 md:col-4 mt-2 md:mt-0">
          <div className="text-center p-2 md:p-3 border-round surface-100">
            <div className="text-xl md:text-2xl font-bold text-900">{data.metrics.uniqueClients}</div>
            <small className="text-600 text-xs md:text-sm">Novos Clientes</small>
          </div>
        </div>
      </div>
    </Card>
  );
}