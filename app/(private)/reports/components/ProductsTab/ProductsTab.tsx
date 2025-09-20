// app/reports/components/ProductsTab.tsx
'use client';

import { useState, useEffect } from 'react';
import { Message } from 'primereact/message';
import PeriodSelector from '../PeriodSelector';
import ProductsMetrics from './components/ProductsMetrics';
import CriticalStockCard from './components/CriticalStockCard';
import BestSellersCard from './components/BestSellersCard';
import CategoryPerformanceCard from './components/CategoryPerformanceCard';
import BrandPerformanceCard from './components/BrandPerformanceCard';
import LoadingSkeleton from './components/LoadingSkeleton';
import ProfitMarginChart from './components/ProfitMarginChart';


interface ProductData {
  profitMargin: any[];
  criticalStock: any[];
  bestSellers: any[];
  categoryPerformance: any[];
  brandPerformance: any[];
  metrics: {
    totalProducts: number;
    totalActiveProducts: number;
    totalInStock: number;
    totalStockValue: number;
    averageMargin: number;
    criticalStockCount: number;
  };
  period: string;
  periodType: string;
  timestamp: string;
}

type PeriodType = '7' | '30' | '365' | 'all';

export default function ProductsTab() {
  const [data, setData] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('30');

  useEffect(() => {
    fetchProductsData(selectedPeriod);
  }, [selectedPeriod]);

  const fetchProductsData = async (period: PeriodType) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/products?period=${period}`);

      if (response.status === 401) {
        window.location.href = '/login';
        throw new Error('Não autorizado - redirecionando para login');
      }
      
      if (!response.ok) {
        throw new Error('Falha ao carregar dados de produtos');
      }
      
      const productsData = await response.json();
      setData(productsData);
    } catch (err: any) {
      console.error('Erro ao buscar produtos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const stockTemplate = (rowData: any) => {
    const severity = rowData.quantity <= 2 ? 'danger' : rowData.quantity <= 5 ? 'warn' : 'success';
    return (
      <div className="flex align-items-center gap-1">
        <span className={`font-bold text-${severity} text-xs md:text-sm`}>{rowData.quantity}</span>
        {rowData.quantity <= 5 && (
          <i className="pi pi-exclamation-triangle text-red-500 text-xs"></i>
        )}
      </div>
    );
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="grid">
        <div className="col-12">
          <Message severity="error" text={`Erro ao carregar dados: ${error}`} className="text-xs md:text-sm" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid">
        <div className="col-12">
          <Message severity="warn" text="Nenhum dado disponível" className="text-xs md:text-sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid">
      {/* Seletor de período */}
      <div className="col-12 mb-3 md:mb-4">
        <PeriodSelector 
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          periodText={data.period}
        />
      </div>

      {/* Métricas Rápidas */}
      <div className="col-12 mb-3 md:mb-4">
        <ProductsMetrics metrics={data.metrics} formatCurrency={formatCurrency} />
      </div>

      {/* Margem de Lucro e Estoque Crítico */}
      <div className="col-12 lg:col-8 mb-3 md:mb-4">
        <ProfitMarginChart 
          profitMargin={data.profitMargin} 
          averageMargin={data.metrics.averageMargin} 
        />
      </div>
      
      <div className="col-12 lg:col-4 mb-3 md:mb-4">
        <CriticalStockCard 
          criticalStock={data.criticalStock} 
          stockTemplate={stockTemplate} 
        />
      </div>
      
      {/* Produtos Mais Vendidos */}
      <div className="col-12 mb-3 md:mb-4">
        <BestSellersCard 
          bestSellers={data.bestSellers} 
          formatCurrency={formatCurrency} 
        />
      </div>

      {/* Categorias e Marcas */}
      <div className="col-12 md:col-6 mb-3 md:mb-4">
        <CategoryPerformanceCard 
          categoryPerformance={data.categoryPerformance} 
          formatCurrency={formatCurrency} 
        />
      </div>

      <div className="col-12 md:col-6 mb-3 md:mb-4">
        <BrandPerformanceCard 
          brandPerformance={data.brandPerformance} 
          formatCurrency={formatCurrency} 
        />
      </div>
    </div>
  );
}