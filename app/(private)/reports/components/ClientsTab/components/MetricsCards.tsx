// app/reports/components/clients/MetricsCards.tsx
import { Card } from 'primereact/card';

interface Metrics {
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
  totalOrders: number;
  totalRevenue: number;
  averageTicket: number;
  averageOrdersPerClient: number;
}

interface MetricsCardsProps {
  metrics: Metrics;
}

export default function MetricsCards({ metrics }: MetricsCardsProps) {
  return (
    <>
      <div className="col-12 sm:col-6 lg:col-6 mb-3">
        <Card className="h-full p-3 surface-card shadow-1 border-1 surface-border">
          <div className="text-xl md:text-2xl font-bold text-primary mb-1">
            {metrics.totalClients}
          </div>
          <p className="text-xs md:text-sm text-600 m-0">Total de Clientes</p>
          <small className="text-500 text-xs">Cadastrados no período </small>
        </Card>
      </div>

      <div className="col-12 sm:col-6 lg:col-6 mb-3">
        <Card className="h-full p-3 surface-card shadow-1 border-1 surface-border">
          <div className="text-xl md:text-2xl font-bold text-primary mb-1">
            R$ {metrics.averageTicket.toFixed(2)}
          </div>
          <p className="text-xs md:text-sm text-600 m-0">Ticket Médio</p>
          <small className="text-500 text-xs">Por cliente</small>
        </Card>
      </div>
    </>
  );
}