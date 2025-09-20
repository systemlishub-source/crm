// app/reports/components/employees/EmployeeCard.tsx
import { Card } from 'primereact/card';
import { ProgressBar } from 'primereact/progressbar';
import { Tag } from 'primereact/tag';
import { EmployeeData } from '../types';
import { getChartTheme } from '../chartUtils';


interface EmployeeCardProps {
  employee: EmployeeData;
  index: number;
  maxRevenue: number;
}

export default function EmployeeCard({ employee, index, maxRevenue }: EmployeeCardProps) {
  const revenuePercentage = maxRevenue > 0 ? (employee.totalRevenue / maxRevenue) * 100 : 0;
  const theme = getChartTheme();

  return (
    <div className="col-12 md:col-6 xl:col-4 mb-4">
      <Card className="h-full border-1 surface-border shadow-1">
        <div className="flex flex-column gap-3">
          {/* Cabeçalho com posição e nome */}
          <div className="flex align-items-center justify-content-between">
            <div className="flex align-items-center gap-2">
              <div className="w-2rem h-2rem flex align-items-center justify-content-center bg-primary text-white font-bold border-circle text-sm">
                {index + 1}
              </div>
              <div>
                <div className="font-semibold text-sm text-900">{employee.employeeName}</div>
                <div className="text-xs text-500">{employee.totalOrders} vendas</div>
              </div>
            </div>
            <Tag 
              value={`R$ ${employee.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`} 
              severity={index < 3 ? "success" : "info"} 
              className="text-xs" 
            />
          </div>

          {/* Barra de progresso do faturamento */}
          <div>
            <div className="flex justify-content-between text-xs text-500 mb-1">
              <span>Faturamento</span>
              <span>{revenuePercentage.toFixed(1)}% do topo</span>
            </div>
            <ProgressBar 
              value={revenuePercentage} 
              className="h-1rem border-round-lg" 
              showValue={false}
              color={index < 3 ? theme.colors.green[0] : theme.colors.blue[0]}
            />
          </div>

          {/* Métricas detalhadas */}
          <div className="grid text-xs">
            <div className="col-6">
              <div className="text-600 font-semibold">Ticket Médio</div>
              <div className="text-900">R$ {employee.averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="col-6">
              <div className="text-600 font-semibold">Itens/Venda</div>
              <div className="text-900">{employee.averageItemsPerSale.toFixed(1)}</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}