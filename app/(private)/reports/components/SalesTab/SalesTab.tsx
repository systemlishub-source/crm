// app/reports/components/SalesTab.tsx
'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from 'primereact/skeleton';
import { Message } from 'primereact/message';

import MetricCard from './components/MetricCard';
import ChartContainer from './components/ChartContainer';
import ProductsTable from './components/ProductsTable';
import { SalesData, PeriodType } from './types'
import PeriodSelector from '../PeriodSelector';

export default function SalesTab() {
    const [salesData, setSalesData] = useState<SalesData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('30');

    useEffect(() => {
        fetchSalesData(selectedPeriod);
    }, [selectedPeriod]);

    const fetchSalesData = async (period: PeriodType) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/analytics/sales?period=${period}`);

            if (response.status === 401) {
                window.location.href = '/login';
                throw new Error('Não autorizado - redirecionando para login');
            }

            if (!response.ok) {
                throw new Error('Erro ao carregar dados de vendas');
            }

            const data = await response.json();
            setSalesData(data);
        } catch (err: any) {
            console.error('Erro ao buscar dados de vendas:', err);
            setError(err.message || 'Falha ao carregar dados. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    // Configuração dos gráficos
    const salesEvolutionChartData = {
        labels: salesData?.salesEvolution.labels || [],
        datasets: [
            {
                label: 'Faturamento (R$)',
                data: salesData?.salesEvolution.data || [],
                fill: false,
                borderColor: '#3B82F6',
                tension: 0.4,
                pointBackgroundColor: '#3B82F6',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#3B82F6'
            }
        ]
    };

    const salesEvolutionChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top' as const,
                labels: {
                    font: {
                        size: window.innerWidth < 768 ? 10 : 12
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    font: {
                        size: window.innerWidth < 768 ? 10 : 12
                    },
                    maxRotation: 45,
                    minRotation: 45
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value: any) {
                        return 'R$ ' + value.toLocaleString('pt-BR');
                    },
                    font: {
                        size: window.innerWidth < 768 ? 10 : 12
                    }
                }
            }
        }
    };

    const salesByCategoryChartData = {
        labels: salesData?.salesByCategory.labels || [],
        datasets: [
            {
                label: 'Faturamento por Categoria (R$)',
                data: salesData?.salesByCategory.data || [],
                backgroundColor: [
                    '#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6',
                    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
                ],
                borderColor: 'transparent',
                borderWidth: 1
            }
        ]
    };

    const salesByCategoryChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value: any) {
                        return 'R$ ' + value.toLocaleString('pt-BR');
                    },
                    font: {
                        size: window.innerWidth < 768 ? 10 : 12
                    }
                }
            },
            x: {
                ticks: {
                    font: {
                        size: window.innerWidth < 768 ? 10 : 12
                    }
                }
            }
        }
    };

    const salesByTimePeriodChartData = {
        labels: salesData?.salesByTimePeriod.labels || [],
        datasets: [
            {
                label: 'Faturamento por Período (R$)',
                data: salesData?.salesByTimePeriod.data || [],
                backgroundColor: '#10B981',
                borderColor: 'transparent',
                borderWidth: 1
            }
        ]
    };

    const salesByTimePeriodChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value: any) {
                        return 'R$ ' + value.toLocaleString('pt-BR');
                    },
                    font: {
                        size: window.innerWidth < 768 ? 10 : 12
                    }
                }
            },
            x: {
                ticks: {
                    font: {
                        size: window.innerWidth < 768 ? 10 : 12
                    }
                }
            }
        }
    };

    if (loading) {
        return <LoadingSkeleton />;
    }

    if (error) {
        return (
            <div className="grid">
                <div className="col-12">
                    <Message severity="error" text={error} />
                    <div className="mt-4 text-center">
                        <button
                            onClick={() => fetchSalesData(selectedPeriod)}
                            className="p-button p-button-primary p-button-sm md:p-button"
                        >
                            Tentar Novamente
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid">
            {/* Seletor de Período */}
            <div className="col-12 mb-4">
                <PeriodSelector
                    selectedPeriod={selectedPeriod}
                    setSelectedPeriod={setSelectedPeriod}
                    periodText={salesData?.period || ''}
                />
            </div>

            {/* Cards de Métricas */}
            <div className="col-6 md:col-6 lg:col-3 mb-3">
                <MetricCard
                    title="Faturamento Total"
                    value={`R$ ${salesData?.metrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`}
                    subtitle="Período analisado"
                    description="Total arrecadado"
                />
            </div>

            <div className="col-6 md:col-6 lg:col-3 mb-3">
                <MetricCard
                    title="Total de Vendas"
                    value={salesData?.metrics.totalOrders || 0}
                    subtitle="Vendas realizadas"
                    description="Quantidade de vendas"
                />
            </div>

            <div className="col-6 md:col-6 lg:col-3 mb-3">
                <MetricCard
                    title="Ticket Médio"
                    value={`R$ ${salesData?.metrics.averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`}
                    subtitle="Por venda"
                    description="Valor médio por venda"
                />
            </div>

            <div className="col-6 md:col-6 lg:col-3 mb-3">
                <MetricCard
                    title="Clientes Únicos"
                    value={salesData?.metrics.uniqueClients || 0}
                    subtitle="Realizaram compras"
                    description="Clientes ativos"
                />
            </div>

            {/* Gráfico de Evolução de Vendas */}
            <div className="col-12 mb-4">
                <ChartContainer
                    title="Evolução de Vendas"
                    type="line"
                    data={salesEvolutionChartData}
                    options={salesEvolutionChartOptions}
                    height="h-12rem md:h-15rem"
                    className="shadow-2"
                />
            </div>

            {/* Gráfico de Vendas por Categoria */}
            <div className="col-12 md:col-6 mb-3">
                <ChartContainer
                    title="Vendas por Categoria"
                    type="bar"
                    data={salesByCategoryChartData}
                    options={salesByCategoryChartOptions}
                    height="h-10rem md:h-12rem"
                />
            </div>

            {/* Gráfico de Vendas por Período */}
            <div className="col-12 md:col-6 mb-3">
                <ChartContainer
                    title="Vendas por Período do Dia"
                    type="bar"
                    data={salesByTimePeriodChartData}
                    options={salesByTimePeriodChartOptions}
                    height="h-10rem md:h-12rem"
                />
            </div>

            {/* Top Produtos */}
            <div className="col-12 mb-4">
                <ProductsTable
                    products={salesData?.topProducts || []}
                    title="Top 10 Produtos Mais Vendidos"
                />
            </div>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="grid">
            <div className="col-12 mb-4">
                <div className="card shadow-2 border-1 surface-border p-4">
                    <Skeleton width="120px" height="1.5rem" className="mb-3" />
                    <Skeleton width="100%" height="12rem" />
                </div>
            </div>
            
            {[...Array(4)].map((_, i) => (
                <div key={i} className="col-6 md:col-6 lg:col-3 mb-3">
                    <div className="card shadow-1 border-1 surface-border p-3">
                        <Skeleton width="80%" height="2rem" className="mb-2" />
                        <Skeleton width="60%" height="1rem" />
                        <Skeleton width="40%" height="0.8rem" className="mt-1" />
                    </div>
                </div>
            ))}
            
            {[...Array(2)].map((_, i) => (
                <div key={i} className="col-12 md:col-6 mb-3">
                    <div className="card shadow-1 border-1 surface-border p-4">
                        <Skeleton width="140px" height="1.5rem" className="mb-3" />
                        <Skeleton width="100%" height="10rem" />
                    </div>
                </div>
            ))}
        </div>
    );
}