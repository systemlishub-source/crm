// app/reports/components/InsightsProductsTable.tsx
import { Card } from 'primereact/card';

interface InsightsProductsTableProps {
  data: any;
  periodType: string;
}

export default function InsightsProductsTable({ data, periodType }: InsightsProductsTableProps) {
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

  const periodText = getPeriodText(periodType);

  return (
    <Card className="shadow-1 border-1 surface-border">
      <h3 className="text-base md:text-lg font-semibold mb-4">Detalhes dos Produtos Mais Vendidos {periodText}</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-bottom-1 surface-border">
              <th className="text-left p-2 md:p-3 text-xs md:text-sm">Produto</th>
              <th className="text-left p-2 md:p-3 text-xs md:text-sm">Código</th>
              <th className="text-right p-2 md:p-3 text-xs md:text-sm">Quantidade</th>
              <th className="text-right p-2 md:p-3 text-xs md:text-sm">Faturamento</th>
              <th className="text-right p-2 md:p-3 text-xs md:text-sm">Margem</th>
            </tr>
          </thead>
          <tbody>
            {data.topProducts.slice(0, 5).map((product: any) => (
              <tr key={product.id} className="border-bottom-1 surface-border">
                <td className="p-2 md:p-3 text-xs md:text-sm">{product.name}</td>
                <td className="p-2 md:p-3 text-600 text-xs md:text-sm">{product.code}</td>
                <td className="p-2 md:p-3 text-right font-semibold text-xs md:text-sm">{product.totalSold}</td>
                <td className="p-2 md:p-3 text-right text-xs md:text-sm">R$ {product.totalRevenue.toFixed(2)}</td>
                <td className="p-2 md:p-3 text-right text-xs md:text-sm">{product.profitMargin.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}