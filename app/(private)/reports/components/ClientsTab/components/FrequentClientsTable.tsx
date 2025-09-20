// app/reports/components/clients/FrequentClientsTable.tsx
import { Card } from 'primereact/card';

interface Client {
  id: string;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  lastPurchase: Date | null;
}

interface FrequentClientsTableProps {
  data: Client[];
}

export default function FrequentClientsTable({ data }: FrequentClientsTableProps) {
  return (
    <Card className="p-3 surface-card shadow-1 border-1 surface-border">
      <h3 className="text-base md:text-lg font-semibold mb-3">Clientes Mais Frequentes</h3>
      <div className="overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="border-bottom-1 surface-border">
              <th className="text-left p-2 text-xs md:text-sm">Nome</th>
              <th className="text-left p-2 text-xs md:text-sm hidden md:table-cell">Email</th>
              <th className="text-center p-2 text-xs md:text-sm">Vendas</th>
              <th className="text-right p-2 text-xs md:text-sm">Valor Gasto</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 5).map((client, index) => (
              <tr key={client.id} className="border-bottom-1 surface-border">
                <td className="p-2">
                  <div className="flex align-items-center gap-1">
                    <span className="font-semibold text-xs md:text-sm">{index + 1}.</span>
                    <span className="text-xs md:text-sm whitespace-nowrap overflow-hidden text-overflow-ellipsis max-w-8rem">
                      {client.name}
                    </span>
                  </div>
                </td>
                <td className="p-2 text-600 text-xs hidden md:table-cell">
                  {client.email}
                </td>
                <td className="p-2 text-center">
                  <span className="bg-primary-100 text-primary-800 px-2 py-1 border-round text-xs font-semibold">
                    {client.totalOrders}
                  </span>
                </td>
                <td className="p-2 text-right font-semibold text-xs md:text-sm">
                  R$ {client.totalSpent.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}