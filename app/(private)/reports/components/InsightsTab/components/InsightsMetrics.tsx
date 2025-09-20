// Versão simplificada com hover no card inteiro
// app/reports/components/InsightsMetrics.tsx
import { Card } from 'primereact/card';
import { Tooltip } from 'primereact/tooltip';

interface InsightsMetricsProps {
  data: any;
  periodType: string;
}

export default function InsightsMetrics({ data, periodType }: InsightsMetricsProps) {
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

  // Dados para os cards métricos
  const metricCards = [
    {
      id: 'avgTicket',
      title: 'Ticket Médio',
      value: `R$ ${data.metrics.averageTicket.toFixed(2)}`,
      description: 'Valor médio por venda',
      tooltip: 'Valor médio de cada venda realizado no período selecionado'
    },
    {
      id: 'periodSales',
      title: `Vendas ${periodText}`,
      value: data.metrics.periodSales,
      description: 'Total de vendas realizadas',
      tooltip: 'Número total de vendas realizadas no período selecionado'
    },
    {
      id: 'periodRevenue',
      title: `Faturamento ${periodText}`,
      value: `R$ ${data.metrics.periodRevenue.toFixed(2)}`,
      description: 'Total faturado',
      tooltip: 'Valor total em reais faturado no período selecionado'
    },
    {
      id: 'activeClients',
      title: `Clientes Ativos ${periodText}`,
      value: data.metrics.activeClients,
      description: `Compraram ${periodText}`,
      tooltip: 'Número de clientes únicos que realizaram pelo menos uma compra no período'
    }
  ];

  return (
    <>
      {metricCards.map((card) => (
        <div key={card.id} className="col-6 sm:col-6 md:col-3 mb-4">
          <Tooltip 
            target={`.tooltip-${card.id}`} 
            content={card.tooltip} 
            position="top" 
          />
          
          <Card 
            className={`h-full shadow-1 border-1 surface-border tooltip-${card.id}`}
            data-pr-tooltip={card.tooltip}
            data-pr-position="top"
          >
            <div className="flex flex-column h-full cursor-help">
              <p className="text-xs md:text-sm text-600 m-0">
                {card.title}
              </p>
              <div className="text-lg md:text-2xl lg:text-3xl font-bold text-primary my-2">
                {card.value}
              </div>
            </div>
          </Card>
        </div>
      ))}
    </>
  );
}