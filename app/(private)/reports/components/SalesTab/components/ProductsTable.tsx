// app/reports/components/ProductsTable.tsx
'use client';

import { Card } from 'primereact/card';

interface Product {
  name: string;
  quantity: number;
  revenue: number;
}

interface ProductsTableProps {
  products: Product[];
  title: string;
}

export default function ProductsTable({ products, title }: ProductsTableProps) {
  if (!products || products.length === 0) {
    return (
      <Card className="shadow-1 border-1 surface-border">
        <h3 className="text-lg font-semibold mb-4 text-900">{title}</h3>
        <div className="text-center p-4 text-500">
          Nenhum dado disponível
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-1 border-1 surface-border">
      <h3 className="text-lg font-semibold mb-4 text-900">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-1 surface-border">
              <th className="text-left p-2 md:p-3 text-sm md:text-base">Produto</th>
              <th className="text-right p-2 md:p-3 text-sm md:text-base">Quantidade</th>
              <th className="text-right p-2 md:p-3 text-sm md:text-base">Faturamento</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={index} className="border-b-1 surface-border hover:surface-50 transition-colors">
                <td className="p-2 md:p-3 text-sm md:text-base">
                  <span className="line-clamp-2" title={product.name}>
                    {product.name}
                  </span>
                </td>
                <td className="text-right p-2 md:p-3 text-sm md:text-base">
                  {product.quantity.toLocaleString('pt-BR')}
                </td>
                <td className="text-right p-2 md:p-3 text-sm md:text-base font-semibold">
                  R$ {product.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}