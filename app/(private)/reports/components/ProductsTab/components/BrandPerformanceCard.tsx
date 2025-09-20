// app/reports/components/products/BrandPerformanceCard.tsx
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

interface BrandPerformanceCardProps {
  brandPerformance: any[];
  formatCurrency: (value: number) => string;
}

export default function BrandPerformanceCard({ brandPerformance, formatCurrency }: BrandPerformanceCardProps) {
  return (
    <Card className="h-full shadow-1 border-1 surface-border">
      <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Top Modelos</h3>
      <div className="flex align-items-center justify-content-center h-8rem md:h-10rem">
        {brandPerformance.length > 0 ? (
          <DataTable 
            value={brandPerformance.slice(0, 5)} 
            size="small" 
            className="text-xs md:text-sm w-full"
            showGridlines
            scrollable
            scrollHeight="150px"
          >
            <Column field="model" header="Modelo" style={{ minWidth: '100px' }} />
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
            text="Nenhuma modelo com vendas" 
            className="w-full text-xs md:text-sm"
          />
        )}
      </div>
    </Card>
  );
}