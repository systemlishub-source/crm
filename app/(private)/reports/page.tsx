// app/reports/page.tsx
'use client';

import { useState, useEffect } from "react";
import { TabView, TabPanel } from 'primereact/tabview';
import { Skeleton } from 'primereact/skeleton';

import './styles.css';
import InsightsTab from "./components/InsightsTab/InsightsTab";
import SalesTab from "./components/SalesTab/SalesTab";
import ProductsTab from "./components/ProductsTab/ProductsTab";
import ClientsTab from "./components/ClientsTab/ClientsTab";
import EmployeesTab from "./components/EmployessTab/EmployessTab";

export default function ReportsPage() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const tabHeaderTemplate = (options: any, title: string, icon: string) => {
        return (
            <div 
                className={`flex align-items-center gap-2 p-3 transition-all transition-duration-200 ${options.className}`}
                onClick={options.onClick}
                style={{ 
                    borderRadius: '8px 8px 0 0',
                    marginRight: '4px',
                    borderBottom: options.active ? '3px solid var(--primary-color)' : '3px solid transparent'
                }}
            >
                <i className={`pi ${icon} text-lg`}></i>
                <span className="font-medium">{title}</span>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="grid">
                <div className="col-12">
                    <div className="card p-6">
                        <Skeleton width="250px" height="2rem" className="mb-4" />
                        <Skeleton width="400px" height="1.5rem" className="mb-6" />
                        <Skeleton width="100%" height="400px" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card p-4 md:p-6">
                    <div className="mb-6">
                        <h1 className="m-0 text-2xl md:text-3xl font-bold text-900">Relatórios e Análises</h1>
                        <p className="m-0 text-600 mt-2 text-base md:text-lg">
                            Visualize insights e métricas importantes do seu negócio
                        </p>
                    </div>

                    <TabView 
                        activeIndex={activeIndex} 
                        onTabChange={(e) => setActiveIndex(e.index)}
                        className="custom-tabview"
                        panelContainerClassName="p-4"
                    >
                        <TabPanel 
                            headerTemplate={(options) => tabHeaderTemplate(options, "Insights", "pi-chart-line")}
                        >
                            <InsightsTab />
                        </TabPanel>

                        <TabPanel 
                            headerTemplate={(options) => tabHeaderTemplate(options, "Vendas", "pi-shopping-cart")}
                        >
                            <SalesTab />
                        </TabPanel>

                        <TabPanel 
                            headerTemplate={(options) => tabHeaderTemplate(options, "Produtos", "pi-box")}
                        >
                            <ProductsTab />
                        </TabPanel>

                        <TabPanel 
                            headerTemplate={(options) => tabHeaderTemplate(options, "Clientes", "pi-users")}
                        >
                            <ClientsTab />
                        </TabPanel>

                        <TabPanel 
                            headerTemplate={(options) => tabHeaderTemplate(options, "Funcionários", "pi-id-card")}
                        >
                            <EmployeesTab />
                        </TabPanel>
                    </TabView>
                </div>
            </div>
        </div>
    );
}