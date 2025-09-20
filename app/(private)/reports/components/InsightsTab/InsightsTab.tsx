// app/reports/components/InsightsTab.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';
import { Skeleton } from 'primereact/skeleton';
import PeriodSelector from '../PeriodSelector';
import InsightsMetrics from './components/InsightsMetrics';
import InsightsCharts from './components/InsightsCharts';
import StatisticalSummary from './components/StatisticalSummary';
import InsightsProductsTable from './components/InsightsProductsTable';


interface InsightsData {
  metrics: {
    averageTicket: number;
    averageTicketPerClient: number;
    totalRevenue: number;
    totalOrders: number;
    uniqueClients: number;
    periodSales: number;
    periodRevenue: number;
    activeClients: number;
  };
  topProducts: any[];
  salesByDay: any[];
  period: string;
  periodType: string;
  timestamp: string;
}

type PeriodType = '7' | '30' | '365' | 'all';

export default function InsightsTab() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('30');

  useEffect(() => {
    fetchInsightsData(selectedPeriod);
  }, [selectedPeriod]);

  const fetchInsightsData = async (period: PeriodType) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/insights?period=${period}`);

      if (response.status === 401) {
        window.location.href = '/login';
        throw new Error('Não autorizado - redirecionando para login');
      }
      
      if (!response.ok) {
        throw new Error('Falha ao carregar dados de insights');
      }
      
      const insightsData = await response.json();
      setData(insightsData);
    } catch (err: any) {
      console.error('Erro ao buscar insights:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="grid">
        <div className="col-12">
          <Message severity="error" text={`Erro ao carregar dados: ${error}`} />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid">
        <div className="col-12">
          <Message severity="warn" text="Nenhum dado disponível" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid">
      {/* Seletor de período */}
      <div className="col-12 mb-4">
        <PeriodSelector 
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          periodText={data.period}
        />
      </div>

      {/* Métricas Principais */}
      <InsightsMetrics data={data} periodType={selectedPeriod} />
      
      {/* Gráficos */}
      <InsightsCharts data={data} />
      
      {/* Informações adicionais */}
      <div className="col-12">
        <StatisticalSummary data={data} />
      </div>

      {/* Tabela de Top Produtos */}
      <div className="col-12">
        <InsightsProductsTable data={data} periodType={selectedPeriod} />
      </div>
    </div>
  );
}

// Componente de carregamento
function LoadingSkeleton() {
  return (
    <div className="grid">
      {/* Seletor de período */}
      <div className="col-12 mb-4">
        <Card className="p-3">
          <div className="flex flex-wrap gap-2">
            {['7', '30', '365', 'all'].map(value => (
              <Skeleton key={value} width="80px" height="38px" />
            ))}
          </div>
        </Card>
      </div>
      
      {/* Métricas */}
      {[...Array(4)].map((_, i) => (
        <div key={i} className="col-6 sm:col-6 md:col-3 mb-4">
          <Card className="h-full">
            <Skeleton width="100%" height="2rem" className="mb-2" />
            <Skeleton width="80%" height="1rem" />
          </Card>
        </div>
      ))}
      
      {/* Gráficos */}
      <div className="col-12 lg:col-8 mb-4">
        <Card className="h-full">
          <Skeleton width="100%" height="300px" />
        </Card>
      </div>
      <div className="col-12 lg:col-4 mb-4">
        <Card className="h-full">
          <Skeleton width="100%" height="300px" />
        </Card>
      </div>
    </div>
  );
}