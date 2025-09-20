// app/reports/components/clients/AgeDistributionChart.tsx
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { Skeleton } from 'primereact/skeleton';
import { useEffect, useState } from 'react';

interface ChartData {
  name: string;
  value: number;
}

interface AgeDistributionChartProps {
  data: ChartData[];
}

export default function AgeDistributionChart({ data }: AgeDistributionChartProps) {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    if (data) {
      setChartData({
        labels: data.map(item => item.name),
        datasets: [
          {
            label: 'Clientes por Faixa Etária',
            backgroundColor: '#3B82F6',
            borderColor: '#3B82F6',
            data: data.map(item => item.value)
          }
        ]
      });
    }
  }, [data]);

  const chartOptions = {
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          }
        }
      },
      x: {
        ticks: {
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
      <h3 className="text-base md:text-lg font-semibold mb-3">Faixa Etária</h3>
      <div className="h-60 md:h-72">
        {chartData ? (
          <Chart 
            type="bar" 
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