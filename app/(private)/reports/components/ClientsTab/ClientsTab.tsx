// app/reports/components/ClientsTab.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';
import { Skeleton } from 'primereact/skeleton';
import PeriodSelector from '../PeriodSelector';
import MetricsCards from './components/MetricsCards';
import ActiveInactiveChart from './components/ActiveInactiveChart';
import GenderDistributionChart from './components/GenderDistributionChart';
import AgeDistributionChart from './components/AgeDistribuitionChart';
import NewClientsChart from './components/NewClientsChart';
import FrequentClientsTable from './components/FrequentClientsTable';


interface ClientData {
  newClientsByPeriod: Array<{ date: string; count: number }>;
  activeVsInactive: Array<{ name: string; value: number; color: string }>;
  genderDistribution: Array<{ name: string; value: number; color: string }>;
  ageDistribution: Array<{ name: string; value: number }>;
  mostFrequentClients: Array<{
    id: string;
    name: string;
    email: string;
    totalOrders: number;
    totalSpent: number;
    lastPurchase: Date | null;
  }>;
  metrics: {
    totalClients: number;
    activeClients: number;
    inactiveClients: number;
    totalOrders: number;
    totalRevenue: number;
    averageTicket: number;
    averageOrdersPerClient: number;
  };
  regionDistribution: Array<{ name: string; value: number }>;
  period: string;
}

type PeriodType = '7' | '30' | '90' | '180' | '365' | 'all';

export default function ClientsTab() {
  const [data, setData] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('30');

  useEffect(() => {
    fetchClientData(selectedPeriod);
  }, [selectedPeriod]);

  const fetchClientData = async (period: PeriodType) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/clients?period=${period}`);
      
      if (response.status === 401) {
        window.location.href = '/login';
        throw new Error('Não autorizado - redirecionando para login');
      }
      
      if (!response.ok) {
        throw new Error('Erro ao carregar dados dos clientes');
      }
      
      const clientData = await response.json();
      setData(clientData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Erro ao buscar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const LoadingSkeleton = () => (
    <div className="grid">
      <div className="col-12 mb-4">
        <Card className="p-3">
          <Skeleton width="250px" height="1.5rem" className="mb-2" />
          <Skeleton width="200px" height="1rem" />
        </Card>
      </div>
      
      {[...Array(6)].map((_, i) => (
        <div key={i} className="col-12 sm:col-6 lg:col-4 mb-3">
          <Card className="h-full p-3">
            <Skeleton width="100%" height="120px" />
          </Card>
        </div>
      ))}
    </div>
  );

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

      {/* Métricas Gerais */}
      <MetricsCards metrics={data.metrics} />

      {/* Gráficos */}
      <div className="col-12 lg:col-6 mb-4">
        <ActiveInactiveChart data={data.activeVsInactive} />
      </div>
      
      <div className="col-12 lg:col-6 mb-4">
        <GenderDistributionChart data={data.genderDistribution} />
      </div>

      <div className="col-12 lg:col-6 mb-4">
        <AgeDistributionChart data={data.ageDistribution} />
      </div>

      <div className="col-12 lg:col-6 mb-4">
        <NewClientsChart data={data.newClientsByPeriod} />
      </div>

      {/* Tabelas */}
      <div className="col-12 mb-4">
        <FrequentClientsTable data={data.mostFrequentClients} />
      </div>

    </div>
  );
}