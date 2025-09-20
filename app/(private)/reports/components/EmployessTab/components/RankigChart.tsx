// app/reports/components/employees/RankingChart.tsx
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { Tag } from 'primereact/tag';
import { EmployeeData } from '../types';
import { getChartTheme, rankingChartOptions } from '../chartUtils';

interface RankingChartProps {
  employees: EmployeeData[];
}

export default function RankingChart({ employees }: RankingChartProps) {
  const theme = getChartTheme();
  
  const rankingChartData = {
    labels: employees.slice(0, 8).map(emp => emp.employeeNickname),
    datasets: [
      {
        label: 'Faturamento (R$)',
        backgroundColor: theme.colors.orange.map(color => color),
        borderColor: '#FFFFFF',
        borderWidth: 1,
        borderRadius: 6,
        data: employees.slice(0, 8).map(emp => emp.totalRevenue)
      }
    ]
  };

  return (
    <Card className="h-full border-1 surface-border shadow-2 hover:shadow-3 transition-all transition-duration-300">
      <div className="flex align-items-center justify-content-between mb-4">
        <h3 className="text-lg font-semibold m-0 text-900">Top Vendedores</h3>
        <Tag value="Ranking" severity="warning" className="text-xs" />
      </div>
      <div className="h-20rem">
        <Chart 
          type="bar" 
          data={rankingChartData} 
          options={rankingChartOptions} 
          style={{ height: '100%' }}
          className="border-round-lg"
        />
      </div>
    </Card>
  );
}