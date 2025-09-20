// app/reports/components/clients/NewClientsChart.tsx
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { Skeleton } from 'primereact/skeleton';
import { useEffect, useState } from 'react';

interface ChartData {
  date: string;
  count: number;
}

interface NewClientsChartProps {
  data: ChartData[];
}

export default function NewClientsChart({ data }: NewClientsChartProps) {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    if (data) {
      setChartData({
        labels: data.map(item => {
          const date = new Date(item.date);
          return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
        }),
        datasets: [
          {
            label: 'Novos Clientes',
            data: data.map(item => item.count),
            fill: false,
            borderColor: '#10B981',
            tension: 0.4
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
            size: window.innerWidth < 768 ? 8 : 10
          }
        }
      }
    },
    maintainAspectRatio: false
  };

  return (
    <Card className="h-full p-3 surface-card shadow-2 border-1 surface-border">
      <h3 className="text-base md:text-lg font-semibold mb-3">Novos Clientes</h3>
      <div className="h-60 md:h-72">
        {chartData ? (
          <Chart 
            type="line" 
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