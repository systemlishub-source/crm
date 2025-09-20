// app/reports/components/products/BestSellersCard.tsx
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

interface BestSellersCardProps {
  bestSellers: any[];
  formatCurrency: (value: number) => string;
}

export default function BestSellersCard({ bestSellers, formatCurrency }: BestSellersCardProps) {
  return (
    <Card className="shadow-1 border-1 surface-border">
      <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Top 5 Produtos Mais Vendidos</h3>
      <div className="flex align-items-center justify-content-center h-8rem md:h-10rem">
        {bestSellers.length > 0 ? (
          <DataTable 
            value={bestSellers.slice(0, 5)} 
            size="small" 
            className="text-xs md:text-sm w-full"
            showGridlines
            scrollable
            scrollHeight="150px"
          >
            <Column field="name" header="Produto" style={{ minWidth: '100px' }} />
            <Column field="model" header="Modelo" style={{ minWidth: '80px' }} />
            <Column field="totalSold" header="Vendidos" style={{ width: '70px' }} />
            <Column 
              field="totalRevenue" 
              header="Faturamento" 
              body={(row) => formatCurrency(row.totalRevenue)}
              style={{ minWidth: '100px' }}
            />
          </DataTable>
        ) : (
          <Message 
            severity="info" 
            text="Nenhuma venda no período" 
            className="w-full text-xs md:text-sm"
          />
        )}
      </div>
    </Card>
  );
}