// app/reports/components/employees/EmployeesTab.tsx
'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from 'primereact/skeleton';
import { Message } from 'primereact/message';

import { ApiResponse, PeriodType } from './types';
import PeriodSelector from '../PeriodSelector';
import EmployeeMetricsGrid from './components/EmployeeMetricsGrid';
import PerformanceChart from './components/PerformanceChart';
import RankingChart from './components/RankigChart';
import EmployeeCardsGrid from './components/EmployeeCardsGrid';

export default function EmployeesTab() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('30');
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/analytics/employees?period=${selectedPeriod}`);

      if (response.status === 401) {
        // Token expirado - redireciona para login
        window.location.href = '/login';
        throw new Error('Não autorizado - redirecionando para login');
      }
      
      if (!response.ok) {
        throw new Error('Erro ao carregar dados dos funcionários');
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPeriod]);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!data) {
    return <NoDataState />;
  }

  return (
    <div className="grid">
      <div className="col-12 mb-4">
        <PeriodSelector 
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          periodText={data.period}
        />
      </div>

      {/* Métricas Gerais */}
      <div className="col-12 mb-6">
        <EmployeeMetricsGrid totalMetrics={data.totalMetrics} />
      </div>

      {/* Gráficos Principais */}
      <div className="col-12 lg:col-8 mb-6">
        <PerformanceChart chartData={data.chartData} />
      </div>

      <div className="col-12 lg:col-4 mb-6">
        <RankingChart employees={data.employees} />
      </div>

      {/* Métricas Detalhadas por Funcionário */}
      <div className="col-12 mb-6">
        <EmployeeCardsGrid employees={data.employees} />
      </div>
    </div>
  );
}

// Componentes de Estado
function LoadingState() {
  return (
    <div className="grid">
      <div className="col-12">
        <Skeleton width="100%" height="2rem" className="mb-4" />
        <div className="grid">
          {[1, 2, 3, 4, 5, 6].map(item => (
            <div key={item} className="col-12 md:col-6 lg:col-4 mb-4">
              <Skeleton width="100%" height="150px" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorState({ error }: { error: string }) {
  return (
    <div className="grid">
      <div className="col-12">
        <Message severity="error" text={error} className="border-round-lg" />
      </div>
    </div>
  );
}

function NoDataState() {
  return (
    <div className="grid">
      <div className="col-12">
        <Message severity="warn" text="Nenhum dado encontrado" className="border-round-lg" />
      </div>
    </div>
  );
}