// app/reports/components/InsightsCharts.tsx
'use client';

import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { Message } from 'primereact/message';
import { useState, useEffect } from 'react';

interface InsightsChartsProps {
  data: any;
}

export default function InsightsCharts({ data }: InsightsChartsProps) {
  const [chartData, setChartData] = useState<any>({});
  const [barData, setBarData] = useState<any>({});

  useEffect(() => {
    prepareChartData();
    prepareBarData();
  }, [data]);

  const prepareChartData = () => {
    if (!data?.salesByDay) return;

    const documentStyle = getComputedStyle(document.documentElement);
    
    const isYearly = data.periodType === '365';
    
    const chartData = {
      labels: data.salesByDay.map((item: any) => {
        if (isYearly) {
          // Formato para meses: Jan, Fev, etc.
          const [year, month] = item.date.split('-');
          const date = new Date(parseInt(year), parseInt(month) - 1);
          return date.toLocaleDateString('pt-BR', { month: 'short' });
        } else {
          // Formato para dias: 01 Jan, 02 Jan, etc.
          const date = new Date(item.date);
          return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        }
      }),
      datasets: [
        {
          label: isYearly ? 'Faturamento Mensal (R$)' : 'Faturamento Diário (R$)',
          data: data.salesByDay.map((item: any) => item.revenue),
          fill: false,
          borderColor: documentStyle.getPropertyValue('--primary-color'),
          tension: 0.4,
          pointBackgroundColor: documentStyle.getPropertyValue('--primary-color'),
          pointBorderColor: documentStyle.getPropertyValue('--primary-color'),
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: documentStyle.getPropertyValue('--primary-color'),
          pointRadius: 3,
          pointHoverRadius: 5
        }
      ]
    };

    setChartData(chartData);
  };

  const prepareBarData = () => {
    if (!data?.topProducts) return;

    const documentStyle = getComputedStyle(document.documentElement);
    const top5Products = data.topProducts.slice(0, 5);
    
    const barData = {
      labels: top5Products.map((product: any) => 
        product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name
      ),
      datasets: [
        {
          label: 'Quantidade Vendida',
          data: top5Products.map((product: any) => product.totalSold),
          backgroundColor: [
            documentStyle.getPropertyValue('--primary-500'),
            documentStyle.getPropertyValue('--primary-400'),
            documentStyle.getPropertyValue('--primary-300'),
            documentStyle.getPropertyValue('--primary-200'),
            documentStyle.getPropertyValue('--primary-100')
          ],
          borderColor: documentStyle.getPropertyValue('--primary-color'),
          borderWidth: 1
        }
      ]
    };

    setBarData(barData);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--text-color'),
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary-color'),
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          },
          maxRotation: window.innerWidth < 768 ? 45 : 0,
          minRotation: window.innerWidth < 768 ? 45 : 0
        },
        grid: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--surface-border')
        }
      },
      y: {
        ticks: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary-color'),
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          },
          callback: function(value: any) {
            return 'R$ ' + value.toLocaleString('pt-BR');
          }
        },
        grid: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--surface-border')
        }
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--text-color'),
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary-color'),
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          },
          maxRotation: window.innerWidth < 768 ? 45 : 0,
          minRotation: window.innerWidth < 768 ? 45 : 0
        },
        grid: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--surface-border')
        }
      },
      y: {
        ticks: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary-color'),
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          },
          stepSize: 1
        },
        grid: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--surface-border')
        }
      }
    }
  };

  // Função para obter texto do período
  const getPeriodText = (type: string) => {
    switch (type) {
      case '7': return 'nos últimos 7 dias';
      case '30': return 'nos últimos 30 dias';
      case '365': return 'no último ano';
      case 'all': return 'em todo o período';
      default: return 'no período';
    }
  };

  const periodText = getPeriodText(data.periodType);

  return (
    <>
      {/* Gráfico de Faturamento */}
      <div className="col-12 lg:col-8 mb-4">
        <Card className="h-full shadow-2 border-1 surface-border">
          <h3 className="text-base md:text-lg font-semibold mb-4">
            {data.periodType === '365' ? 'Faturamento Mensal' : 'Evolução do Faturamento'} {periodText}
          </h3>
          <div className="flex align-items-center justify-content-center" style={{ height: '300px' }}>
            {chartData.datasets ? (
              <Chart 
                type="line" 
                data={chartData} 
                options={chartOptions} 
                style={{ height: '100%', width: '100%' }} 
              />
            ) : (
              <Message 
                severity="info" 
                text="Carregando dados do gráfico..." 
                className="w-full"
              />
            )}
          </div>
        </Card>
      </div>
      
      {/* Gráfico de Top Produtos */}
      <div className="col-12 lg:col-4 mb-4">
        <Card className="h-full shadow-1 border-1 surface-border">
          <h3 className="text-base md:text-lg font-semibold mb-4">Top 5 Produtos {periodText}</h3>
          <div className="flex align-items-center justify-content-center" style={{ height: '300px' }}>
            {barData.datasets ? (
              <Chart 
                type="bar" 
                data={barData} 
                options={barOptions} 
                style={{ height: '100%', width: '100%' }} 
              />
            ) : (
              <Message 
                severity="info" 
                text="Carregando dados do gráfico..." 
                className="w-full"
              />
            )}
          </div>
        </Card>
      </div>
    </>
  );
}