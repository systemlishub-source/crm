// app/reports/components/products/CriticalStockCard.tsx
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

interface CriticalStockCardProps {
  criticalStock: any[];
  stockTemplate: (rowData: any) => JSX.Element;
}

export default function CriticalStockCard({ criticalStock, stockTemplate }: CriticalStockCardProps) {
  return (
    <Card className="h-full shadow-1 border-1 surface-border">
      <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">
        Estoque Crítico ({criticalStock.length})
      </h3>
      <div className="flex align-items-center justify-content-center h-12rem md:h-15rem">
        {criticalStock.length > 0 ? (
          <DataTable 
            value={criticalStock.slice(0, 5)} 
            size="small" 
            className="text-xs md:text-sm"
            scrollable 
            scrollHeight="180px"
            showGridlines
          >
            <Column field="name" header="Produto" style={{ minWidth: '120px' }} />
            <Column field="quantity" header="Estoque" body={stockTemplate} style={{ width: '80px' }} />
            <Column field="code" header="Código" style={{ width: '80px' }} />
          </DataTable>
        ) : (
          <Message 
            severity="success" 
            text="Nenhum produto em estoque crítico" 
            className="w-full text-xs md:text-sm"
          />
        )}
      </div>
    </Card>
  );
}