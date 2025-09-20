// app/reports/components/products/ProfitMarginChart.tsx
'use client';

import { useRef, useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Registrar todos os componentes do Chart.js
Chart.register(...registerables);

interface ProfitMarginChartProps {
  profitMargin: any[];
  averageMargin: number;
}

export default function ProfitMarginChart({ profitMargin, averageMargin }: ProfitMarginChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [chartInstance, setChartInstance] = useState<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || profitMargin.length === 0) return;

    // Destruir chart anterior se existir
    if (chartInstance) {
      chartInstance.destroy();
    }

    // Ordenar produtos por margem (maiores primeiro) e pegar top 10
    const topProducts = [...profitMargin]
      .sort((a, b) => b.profitMarginPercentage - a.profitMarginPercentage)
      .slice(0, 10);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: topProducts.map(product => product.name.length > 20 
          ? product.name.substring(0, 20) + '...' 
          : product.name
        ),
        datasets: [
          {
            label: 'Margem de Lucro (%)',
            data: topProducts.map(product => product.profitMarginPercentage),
            backgroundColor: topProducts.map(product => 
              product.profitMarginPercentage >= 100 ? '#22c55e' : 
              product.profitMarginPercentage >= 50 ? '#3b82f6' : 
              product.profitMarginPercentage >= 20 ? '#f59e0b' : 
              '#ef4444'
            ),
            borderColor: topProducts.map(product => 
              product.profitMarginPercentage >= 100 ? '#16a34a' : 
              product.profitMarginPercentage >= 50 ? '#2563eb' : 
              product.profitMarginPercentage >= 20 ? '#d97706' : 
              '#dc2626'
            ),
            borderWidth: 1,
            borderRadius: 4,
            barPercentage: 0.6,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const product = topProducts[context.dataIndex];
                return [
                  `Produto: ${product.name}`,
                  `Margem: ${product.profitMarginPercentage.toFixed(1)}%`,
                  `Venda: R$ ${product.saleValue.toFixed(2)}`,
                  `Custo: R$ ${product.purchaseValue.toFixed(2)}`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Margem de Lucro (%)',
              font: {
                size: 12
              }
            },
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            }
          },
          y: {
            ticks: {
              font: {
                size: 11
              }
            }
          }
        }
      }
    };

    const newChartInstance = new Chart(chartRef.current, config);
    setChartInstance(newChartInstance);

    // Cleanup
    return () => {
      if (newChartInstance) {
        newChartInstance.destroy();
      }
    };
  }, [profitMargin, averageMargin]);

  if (profitMargin.length === 0) {
    return (
      <Card className="h-full shadow-2 border-1 surface-border">
        <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Margem de Lucro por Produto</h3>
        <div className="flex align-items-center justify-content-center h-12rem md:h-15rem">
          <div className="text-center text-500">
            <i className="pi pi-chart-bar text-2xl mb-2"></i>
            <p>Nenhum dado disponível para análise</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full shadow-2 border-1 surface-border">
      <div className="flex justify-content-between align-items-center mb-3 md:mb-4">
        <h3 className="text-base md:text-lg font-semibold m-0">Top Produtos por Margem</h3>
        <span className="text-xs text-500">
          Média: <strong>{averageMargin.toFixed(1)}%</strong>
        </span>
      </div>
      
      <div className="relative" style={{ height: '300px' }}>
        <canvas ref={chartRef} />
      </div>
      
      <div className="flex flex-wrap gap-2 mt-3 text-xs">
        <div className="flex align-items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>≥ 100%</span>
        </div>
        <div className="flex align-items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>50% - 99%</span>
        </div>
        <div className="flex align-items-center gap-1">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span>20% - 49%</span>
        </div>
        <div className="flex align-items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>&lt; 20%</span>
        </div>
      </div>
    </Card>
  );
}