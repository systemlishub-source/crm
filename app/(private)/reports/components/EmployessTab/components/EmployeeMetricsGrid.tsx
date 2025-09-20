// app/reports/components/employees/EmployeeMetricsGrid.tsx
import { Card } from 'primereact/card';
import { TotalMetrics } from '../types';


interface EmployeeMetricsGridProps {
  totalMetrics: TotalMetrics;
}

export default function EmployeeMetricsGrid({ totalMetrics }: EmployeeMetricsGridProps) {
  return (
    <div className="grid">
      <div className="col-6 md:col-6 mb-3">
        <Card className="h-full border-1 surface-border shadow-1 hover:shadow-2 transition-all transition-duration-300">
          <div className="flex flex-column gap-2">
            <div className="text-900 font-semibold">Funcionários Ativos</div>
            <div className="text-2xl font-bold text-primary">
              {totalMetrics.activeEmployees || 0}
            </div>
            <div className="text-xs text-500">Com acesso ao sistema</div>
          </div>
        </Card>
      </div>

      <div className="col-6 md:col-6 mb-3">
        <Card className="h-full border-1 surface-border shadow-1 hover:shadow-2 transition-all transition-duration-300">
          <div className="flex flex-column gap-2">
            <div className="text-900 font-semibold">Vendas Médias</div>
            <div className="text-2xl font-bold text-orange-600">
              {totalMetrics.averageOrdersPerEmployee.toFixed(1) || '0,0'}
            </div>
            <div className="text-xs text-500">Por funcionário</div>
          </div>
        </Card>
      </div>
    </div>
  );
}