// app/reports/components/employees/PerformanceChart.tsx
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { Tag } from 'primereact/tag';
import { ChartData } from '../types';
import { getChartTheme, salesChartOptions } from '../chartUtils';

interface PerformanceChartProps {
  chartData: ChartData;
}

export default function PerformanceChart({ chartData }: PerformanceChartProps) {
  const theme = getChartTheme();
  
    const topFiveEmployees = chartData.salesByEmployee
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const salesChartData = {
    labels: topFiveEmployees.map(emp => emp.name),
    datasets: [
      {
        label: 'Número de Vendas',
        backgroundColor: theme.colors.blue[0],
        borderColor: theme.colors.blue[1],
        borderWidth: 1,
        borderRadius: 6,
        data: topFiveEmployees.map(emp => emp.orders)
      }
    ]
  };

  return (
    <Card className="border-1 surface-border shadow-2 hover:shadow-3 transition-all transition-duration-300">
      <div className="flex align-items-center justify-content-between mb-4">
        <h3 className="text-lg font-semibold m-0 text-900">top 5 melhores Desempenhos</h3>
        <Tag value="Comparativo" severity="info" className="text-xs" />
      </div>
      <div className="h-20rem">
        <Chart 
          type="bar" 
          data={salesChartData} 
          options={salesChartOptions} 
          style={{ height: '100%' }}
          className="border-round-lg"
        />
      </div>
    </Card>
  );
}