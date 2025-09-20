// app/products/components/StatsCards.tsx
import { Card } from 'primereact/card';
import { Product } from '../types';

interface StatsCardsProps {
  products: Product[];
}

export default function StatsCards({ products }: StatsCardsProps) {
  const stats = {
    total: products.length,
    inStock: products.filter(p => p.quantity > 0).length,
    lowStock: products.filter(p => p.quantity < 5 && p.quantity > 0).length,
    outOfStock: products.filter(p => p.quantity === 0).length
  };

  return (
    <div className="grid mb-4">
      <div className="col-6 md:col-3 mb-2 md:mb-0">
        <Card className="text-center shadow-1 p-2 md:p-3">
          <div className="text-xl md:text-3xl font-bold text-primary">{stats.total}</div>
          <div className="text-xs md:text-sm text-500">Total</div>
        </Card>
      </div>
      <div className="col-6 md:col-3 mb-2 md:mb-0">
        <Card className="text-center shadow-1 p-2 md:p-3">
          <div className="text-xl md:text-3xl font-bold text-green-600">{stats.inStock}</div>
          <div className="text-xs md:text-sm text-500">Em Estoque</div>
        </Card>
      </div>
      <div className="col-6 md:col-3">
        <Card className="text-center shadow-1 p-2 md:p-3">
          <div className="text-xl md:text-3xl font-bold text-orange-600">{stats.lowStock}</div>
          <div className="text-xs md:text-sm text-500">Estoque Baixo</div>
        </Card>
      </div>
      <div className="col-6 md:col-3">
        <Card className="text-center shadow-1 p-2 md:p-3">
          <div className="text-xl md:text-3xl font-bold text-red-600">{stats.outOfStock}</div>
          <div className="text-xs md:text-sm text-500">Esgotados</div>
        </Card>
      </div>
    </div>
  );
}