// app/reports/components/clients/ActiveInactiveChart.tsx
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { Skeleton } from 'primereact/skeleton';
import { useEffect, useState } from 'react';

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface ActiveInactiveChartProps {
  data: ChartData[];
}

export default function ActiveInactiveChart({ data }: ActiveInactiveChartProps) {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    if (data) {
      setChartData({
        labels: data.map(item => item.name),
        datasets: [
          {
            data: data.map(item => item.value),
            backgroundColor: data.map(item => item.color),
            hoverBackgroundColor: data.map(item => item.color)
          }
        ]
      });
    }
  }, [data]);

  const chartOptions = {
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          }
        }
      }
    },
    maintainAspectRatio: false
  };

  return (
    <Card className="h-full p-3 surface-card shadow-2 border-1 surface-border">
      <h3 className="text-base md:text-lg font-semibold mb-3">Clientes Ativos vs Inativos</h3>
      <div className="h-60 md:h-72">
        {chartData ? (
          <Chart 
            type="pie" 
            data={chartData} 
            options={chartOptions} 
            className="w-full h-full" 
          />
        ) : (
          <div className="flex align-items-center justify-content-center h-full">
            <Skeleton width="90%" height="90%" />
          </div>
        )}
      </div>
    </Card>
  );
}