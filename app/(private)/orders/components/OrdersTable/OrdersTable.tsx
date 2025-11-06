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
import { Toast } from "primereact/toast";
import DetailOrder from "./DetailOrder";

interface OrdersTableProps {
    orders: Order[];
    loading?: boolean;
    onOrderDeleted?: () => void; // Adicione esta prop para atualizar a lista
}

export default function OrdersTable({ orders, loading = false, onOrderDeleted }: OrdersTableProps) {
    const dt = useRef<DataTable<any>>(null);
    const toast = useRef<Toast>(null);
    const [selectedOrders, setSelectedOrders] = useState(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const [visible, setVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
    const [deleting, setDeleting] = useState(false);
    
    const [filters, setFilters] = useState({
        global: { value: '', matchMode: FilterMatchMode.CONTAINS }
    });

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters['global'].value = value;
        setFilters(_filters);
        setGlobalFilter(value);
    };

    // Filtra os vendas para a visualização mobile
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
            <>
                <Button
                    icon="pi pi-eye"
                    className="p-button-sm p-button-text p-button-rounded md:p-button-outlined"
                    tooltip="Ver detalhes da venda"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => showOrderDetails(rowData)}
                />
                <Button
                    icon="pi pi-trash"
                    className="p-button-sm p-button-text p-button-rounded md:p-button-outlined p-button-danger"
                    tooltip="Excluir venda"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => confirmDeleteOrder(rowData)}
                />
            </>
        );
    };

    const showOrderDetails = (order: Order) => {
        setSelectedOrder(order);
        setVisible(true);
    };

    const hideOrderDetails = () => {
        setSelectedOrder(null);
        setVisible(false);
    };

    const confirmDeleteOrder = (order: Order) => {
        setOrderToDelete(order);
        setDeleteDialogVisible(true);
    };

    const hideDeleteDialog = () => {
        setDeleteDialogVisible(false);
        setOrderToDelete(null);
    };

    const deleteOrder = async () => {
        if (!orderToDelete) return;

        setDeleting(true);
        try {
            const response = await fetch(`/api/orders/${orderToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao excluir ordem');
            }

            toast.current?.show({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Venda excluída com sucesso!',
                life: 3000
            });

            // Fecha o dialog de exclusão
            hideDeleteDialog();
            
            // Fecha o dialog de detalhes se estiver aberto
            if (selectedOrder?.id === orderToDelete.id) {
                hideOrderDetails();
            }

            // Atualiza a lista chamando a função do parent
            if (onOrderDeleted) {
                onOrderDeleted();
            }

        } catch (error) {
            console.error('Erro ao excluir venda:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: error instanceof Error ? error.message : 'Erro ao excluir venda',
                life: 3000
            });
        } finally {
            setDeleting(false);
        }
    };

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
                    <div className="flex gap-1">
                        <Button
                            icon="pi pi-eye"
                            className="p-button-sm p-button-text p-button-rounded"
                            onClick={() => showOrderDetails(rowData)}
                        />
                        <Button
                            icon="pi pi-trash"
                            className="p-button-sm p-button-text p-button-rounded p-button-danger"
                            onClick={() => confirmDeleteOrder(rowData)}
                        />
                    </div>
                </div>
            </div>
        );
    };

    // Footer do dialog de exclusão
    const deleteDialogFooter = (
        <div className="flex justify-content-end gap-2">
            <Button
                label="Cancelar"
                icon="pi pi-times"
                onClick={hideDeleteDialog}
                className="p-button-text"
                disabled={deleting}
            />
            <Button
                label="Excluir"
                icon="pi pi-trash"
                onClick={deleteOrder}
                className="p-button-danger"
                loading={deleting}
            />
        </div>
    );

    return (
        <div>
            <Toast ref={toast} position="top-right" />
            
            {/* Dialog de Confirmação de Exclusão */}
            <Dialog
                visible={deleteDialogVisible}
                style={{ width: '450px' }}
                header="Confirmar Exclusão"
                modal
                footer={deleteDialogFooter}
                onHide={hideDeleteDialog}
                className="p-fluid"
            >
                <div className="flex align-items-center gap-3">
                    <i 
                        className="pi pi-exclamation-triangle text-red-500" 
                        style={{ fontSize: '2rem' }} 
                    />
                    <div>
                        <span>
                            Tem certeza que deseja excluir a venda <strong>#{orderToDelete?.id}</strong>?
                            <br />
                            <br />
                            <strong>Cliente:</strong> {orderToDelete?.client.name}
                            <br />
                            <strong>Total:</strong> R$ {orderToDelete?.total.toFixed(2)}
                            <br />
                            <strong>Data:</strong> {orderToDelete && new Date(orderToDelete.purchaseDate).toLocaleDateString('pt-BR')}
                            <br />
                            <br />
                            <strong className="text-red-500">Esta ação não pode ser desfeita!</strong>
                        </span>
                    </div>
                </div>
            </Dialog>

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
                        style={{ width: '120px' }}
                        headerStyle={{ minWidth: '120px' }}
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