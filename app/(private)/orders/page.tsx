'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { Order } from "./types";
import OrdersTable from "./components/OrdersTable/OrdersTable";

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/orders');
            
            if (!response.ok) {
                throw new Error('Falha ao carregar pedidos');
            }
            
            const data = await response.json();
            setOrders(data.orders || []);
            
        } catch (error) {
            console.error("Erro ao buscar pedidos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleNewOrder = () => {
        router.push('/orders/new');
    };

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card p-2 md:p-4">
                    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-3 mb-4">
                        <div>
                            <h1 className="m-0 text-xl md:text-2xl font-bold">Registro de Vendas</h1>
                            <p className="m-0 text-500 mt-1 text-sm md:text-base">
                                Gerencie todos as vendas da loja
                            </p>
                        </div>
                        <Button
                            label="Nova Venda"
                            icon="pi pi-plus"
                            onClick={handleNewOrder}
                            className="p-button-primary w-full md:w-auto"
                            size="small"
                        />
                    </div>

                    <OrdersTable orders={orders} loading={loading} />

                    <div className="mt-4 flex justify-content-between align-items-center">
                        <span className="text-xs md:text-sm text-500">
                            Total de {orders.length} vendas cadastradas
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}