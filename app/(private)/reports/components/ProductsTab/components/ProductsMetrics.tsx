// app/reports/components/products/ProductsMetrics.tsx
import { Card } from 'primereact/card';

interface ProductsMetricsProps {
  metrics: {
    totalActiveProducts: number;
    totalInStock: number;
    totalStockValue: number;
    criticalStockCount: number;
  };
  formatCurrency: (value: number) => string;
}

export default function ProductsMetrics({ metrics, formatCurrency }: ProductsMetricsProps) {
  const metricCards = [
    {
      value: metrics.totalActiveProducts,
      label: 'Produtos Ativos',
      description: 'No sistema',
      className: 'col-6 md:col-6 lg:col-3 mb-3'
    },
    {
      value: metrics.totalInStock,
      label: 'Itens em Estoque',
      description: 'Quantidade total',
      className: 'col-6 md:col-6 lg:col-3 mb-3'
    },
    {
      value: formatCurrency(metrics.totalStockValue),
      label: 'Valor do Estoque',
      description: 'Investimento total',
      className: 'col-6 md:col-6 lg:col-3 mb-3'
    },
    {
      value: metrics.criticalStockCount,
      label: 'Estoque Crítico',
      description: 'Itens com baixo estoque',
      className: 'col-6 md:col-6 lg:col-3 mb-3'
    }
  ];

  return (
    <div className="grid">
      {metricCards.map((card, index) => (
        <div key={index} className={card.className}>
          <Card className="h-full shadow-1 border-1 surface-border p-2 md:p-3">
            <div className="text-xl md:text-2xl font-bold text-primary mb-1">{card.value}</div>
            <p className="text-xs md:text-sm text-600 m-0">{card.label}</p>
            <small className="text-500 text-xs">{card.description}</small>
          </Card>
        </div>
      ))}
    </div>
  );
}