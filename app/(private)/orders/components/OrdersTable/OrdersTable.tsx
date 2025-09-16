'use client';
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { Order } from "../../types";
import { useRouter } from "next/navigation";
import { useRef, useState, useMemo } from "react";
import { FilterMatchMode } from "primereact/api";
import { Dialog } from "primereact/dialog";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import DetailOrder from "./DetailOrder";

interface OrdersTableProps {
    orders: Order[];
    loading?: boolean;
}

export default function OrdersTable({ orders, loading = false }: OrdersTableProps) {
    const dt = useRef<DataTable<any>>(null);
    const [selectedOrders, setSelectedOrders] = useState(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const [visible, setVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    
    const [filters, setFilters] = useState({
        global: { value: '', matchMode: FilterMatchMode.CONTAINS }
    });

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters['global'].value = value;
        setFilters(_filters);
        setGlobalFilter(value); // Atualiza também o filtro mobile
    };

    // Filtra os pedidos para a visualização mobile
    const filteredOrders = useMemo(() => {
        if (!globalFilter) return orders;
        
        const filterValue = globalFilter.toLowerCase();
        return orders.filter(order => 
            order.id.toString().includes(filterValue) ||
            order.client.name.toLowerCase().includes(filterValue) ||
            order.client.email.toLowerCase().includes(filterValue) ||
            order.user.name.toLowerCase().includes(filterValue) ||
            order.total.toString().includes(filterValue)
        );
    }, [orders, globalFilter]);

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-2">
            <h5 className="m-0 text-lg md:text-xl">Registros de vendas</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left w-full md:w-auto">
                <i className="pi pi-search" />
                <InputText
                    type="search"
                    value={filters.global.value}
                    onChange={onGlobalFilterChange}
                    placeholder="Buscar registros..."
                    className="w-full"
                />
            </span>
        </div>
    );

    const dateBodyTemplate = (rowData: Order) => {
        return (
            <div className="text-xs md:text-sm">
                {new Date(rowData.purchaseDate).toLocaleDateString('pt-BR')}
            </div>
        );
    };

    const clientBodyTemplate = (rowData: Order) => {
        return (
            <div>
                <div className="font-semibold text-sm md:text-base">{rowData.client.name}</div>
                <div className="text-xs text-500 hidden md:block">{rowData.client.email}</div>
            </div>
        );
    };

    const totalBodyTemplate = (rowData: Order) => {
        return (
            <span className="font-bold text-blue-600 text-sm md:text-base">
                R$ {rowData.total.toFixed(2)}
            </span>
        );
    };

    const itemsBodyTemplate = (rowData: Order) => {
        return (
            <Tag 
                value={rowData.orderItems.length} 
                severity="info" 
                className="min-w-2rem justify-content-center text-xs"
            />
        );
    };

    const sellerBodyTemplate = (rowData: Order) => {
        return (
            <div className="hidden md:block">
                {rowData.user.name}
            </div>
        );
    };

    const actionBodyTemplate = (rowData: Order) => {
        return (
            <Button
                icon="pi pi-eye"
                className="p-button-sm p-button-text p-button-rounded md:p-button-outlined"
                tooltip="Ver detalhes da venda"
                tooltipOptions={{ position: 'top' }}
                onClick={() => showOrderDetails(rowData)}
            />
        );
    };

    const showOrderDetails = (order: Order) => {
       setSelectedOrder(order)
       setVisible(true)
    }

    const hideOrderDetails = () => {
       setSelectedOrder(null)
       setVisible(false)
    }

    // Template para visualização mobile
    const mobileRowTemplate = (rowData: Order) => {
        return (
            <div className="p-3 surface-0 border-round shadow-1 mb-2">
                <div className="flex justify-content-between align-items-start mb-2">
                    <div>
                        <div className="font-bold text-sm">#{rowData.id}</div>
                        <div className="text-xs text-500">
                            {new Date(rowData.purchaseDate).toLocaleDateString('pt-BR')}
                        </div>
                    </div>
                    <Tag 
                        value={rowData.orderItems.length + ' itens'} 
                        severity="info" 
                        className="text-xs"
                    />
                </div>
                
                <div className="mb-2">
                    <div className="font-semibold text-sm">{rowData.client.name}</div>
                    <div className="text-xs text-500">{rowData.client.email}</div>
                </div>
                
                <div className="flex justify-content-between align-items-center">
                    <span className="font-bold text-blue-600 text-sm">
                        R$ {rowData.total.toFixed(2)}
                    </span>
                    <Button
                        icon="pi pi-eye"
                        className="p-button-sm p-button-text p-button-rounded"
                        onClick={() => showOrderDetails(rowData)}
                    />
                </div>
            </div>
        );
    };

    

    return (
        <div>
            {/* Visualização desktop */}
            <div className="hidden md:block">
                <DataTable
                    ref={dt}
                    value={orders}
                    selection={selectedOrders}
                    onSelectionChange={(e) => setSelectedOrders(e.value as any)}
                    loading={loading}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    className="datatable-responsive"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Mostrando {first} até {last} de {totalRecords} vendas"
                    emptyMessage="Nenhuma venda encontrada."
                    header={header}
                    responsiveLayout="scroll"
                    filters={filters}
                    filterDisplay="row"
                    globalFilterFields={['id', 'client.name', 'client.email', 'user.name', 'total']}
                    size="small"
                >
                    <Column 
                        field="id" 
                        header="ID" 
                        sortable 
                        style={{ width: '80px' }}
                        headerStyle={{ minWidth: '80px' }}
                    />
                    <Column 
                        header="Data" 
                        body={dateBodyTemplate} 
                        sortable 
                        sortField="purchaseDate"
                        style={{ width: '120px' }}
                        headerStyle={{ minWidth: '120px' }}
                    />
                    <Column 
                        header="Cliente" 
                        body={clientBodyTemplate} 
                        style={{ minWidth: '200px' }}
                        headerStyle={{ minWidth: '200px' }}
                    />
                    <Column 
                        header="Vendedor" 
                        body={sellerBodyTemplate} 
                        sortable
                        sortField="user.name"
                        style={{ width: '150px' }}
                        headerStyle={{ minWidth: '150px' }}
                    />
                    <Column 
                        header="Itens" 
                        body={itemsBodyTemplate} 
                        align="center"
                        style={{ width: '100px' }}
                        headerStyle={{ minWidth: '100px' }}
                    />
                    <Column 
                        header="Total" 
                        body={totalBodyTemplate} 
                        sortable 
                        sortField="total"
                        align="right"
                        style={{ width: '120px' }}
                        headerStyle={{ minWidth: '120px' }}
                    />
                    <Column 
                        header="Ações" 
                        body={actionBodyTemplate} 
                        align="center"
                        style={{ width: '80px' }}
                        headerStyle={{ minWidth: '80px' }}
                    />
                </DataTable>
            </div>

            {/* Visualização mobile */}
            <div className="block md:hidden">
                <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-2 mb-4">
                    <h5 className="m-0 text-lg">Registro de vendas</h5>
                    <span className="block p-input-icon-left w-full">
                        <i className="pi pi-search" />
                        <InputText
                            type="search"
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Buscar registros..."
                            className="w-full"
                        />
                    </span>
                </div>

                {loading ? (
                    <div className="text-center p-4">
                        <i className="pi pi-spin pi-spinner text-2xl"></i>
                        <p className="mt-2">Carregando registros...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center p-4">
                        <i className="pi pi-inbox text-3xl text-400"></i>
                        <p className="mt-2 text-500">
                            {globalFilter ? 'Nenhuma venda encontrada para "' + globalFilter + '"' : 'Nenhuma venda encontrada'}
                        </p>
                        {globalFilter && (
                            <Button 
                                label="Limpar busca" 
                                className="p-button-text p-button-sm mt-2"
                                onClick={() => setGlobalFilter('')}
                            />
                        )}
                    </div>
                ) : (
                    <div className="grid">
                        {filteredOrders.map((order) => (
                            <div key={order.id} className="col-12">
                                {mobileRowTemplate(order)}
                            </div>
                        ))}
                    </div>
                )}

                {/* Contador de resultados */}
                {!loading && filteredOrders.length > 0 && (
                    <div className="mt-3 text-center">
                        <span className="text-xs text-500">
                            Mostrando {filteredOrders.length} de {orders.length} vendas
                            {globalFilter && ` para "${globalFilter}"`}
                        </span>
                    </div>
                )}
            </div>
            
            <DetailOrder visible={visible} hideOrderDetails={hideOrderDetails} selectedOrder={selectedOrder} />
        </div>
    );
}