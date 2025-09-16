'use client';
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { useRef, useState } from "react";
import { FilterMatchMode } from "primereact/api";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Client } from "../../types";
import ViewClientDialog from "./ViewClientDialog";
import { Badge } from "primereact/badge";
import { Avatar } from "primereact/avatar";

interface ClientsTableProps {
    clients: Client[];
    onEdit: (client: Client) => void;
    onDelete: (client: Client) => void;
}

const ClientsTable = ({ clients, onEdit, onDelete }: ClientsTableProps) => {
    const [viewClient, setViewClient] = useState<Client | null>(null);
    const [viewDialogVisible, setViewDialogVisible] = useState(false);
    const dt = useRef<DataTable<any>>(null);
    const toast = useRef<Toast>(null);

    const [filters, setFilters] = useState({
        global: { value: '', matchMode: FilterMatchMode.CONTAINS }
    });

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filters = { ...filters };

        _filters['global'].value = value;

        setFilters(_filters);
    };

    const handleViewClient = (client: Client) => {
        setViewClient(client);
        setViewDialogVisible(true);
    };

    const hideViewDialog = () => {
        setViewDialogVisible(false);
        setViewClient(null);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    };

    const calculateAge = (birthDate: string) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const formatPhone = (phone: string) => {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 11) {
            return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
        return phone;
    };

    const mobileRowTemplate = (rowData: Client) => {
        return (
            <div className="p-3 surface-0 border-round shadow-1 mb-2">
                <div className="flex align-items-center justify-content-between mb-2">
                    <div className="flex align-items-center gap-2">
                        <Avatar 
                            label={rowData.name.charAt(0)} 
                            size="normal" 
                            className="bg-primary text-white" 
                            shape="circle"
                        />
                        <div>
                            <div className="font-semibold text-sm md:text-base">{rowData.name}</div>
                            <div className="text-xs text-color-secondary">{calculateAge(rowData.birthDate)} anos</div>
                        </div>
                    </div>
                    <Badge 
                        value={rowData.gender} 
                        severity="info" 
                        
                    />
                </div>

                <div className="grid text-sm mt-3">
                    <div className="col-6">
                        <div className="text-600 text-xs">Email</div>
                        <div className="text-900 text-sm truncate">{rowData.email}</div>
                    </div>
                    <div className="col-6">
                        <div className="text-600 text-xs">Telefone</div>
                        <div className="text-900 text-sm">{formatPhone(rowData.phoneNumber)}</div>
                    </div>
                    <div className="col-12 mt-2">
                        <div className="text-600 text-xs">Nascimento</div>
                        <div className="text-900 text-sm">{formatDate(rowData.birthDate)}</div>
                    </div>
                </div>

                <div className="flex justify-content-end gap-1 mt-3 pt-2 border-top-1 surface-border">
                    <Button
                        icon="pi pi-eye"
                        rounded
                        severity="info"
                        size="small"
                        tooltip="Ver detalhes"
                        tooltipOptions={{ position: 'top' }}
                        onClick={() => handleViewClient(rowData)}
                    />
                    <Button
                        icon="pi pi-pencil"
                        rounded
                        severity="success"
                        size="small"
                        tooltip="Editar cliente"
                        tooltipOptions={{ position: 'top' }}
                        onClick={() => onEdit(rowData)}
                    />
                    <Button
                        icon="pi pi-trash"
                        rounded
                        severity="danger"
                        size="small"
                        tooltip="Excluir cliente"
                        tooltipOptions={{ position: 'top' }}
                        onClick={() => onDelete(rowData)}
                    />
                </div>
            </div>
        );
    };

    const nameBodyTemplate = (rowData: Client) => (
        <div className="flex align-items-center gap-2">
            <Avatar 
                label={rowData.name.charAt(0)} 
                size="normal" 
                className="bg-primary text-white" 
                shape="circle"
            />
            <span>{rowData.name}</span>
        </div>
    );

    const emailBodyTemplate = (rowData: Client) => <span className="truncate">{rowData.email}</span>;
    
    const phoneBodyTemplate = (rowData: Client) => <span>{formatPhone(rowData.phoneNumber)}</span>;

    const birthdayBodyTemplate = (rowData: Client) => (
        <div className="flex flex-column">
            <span>{formatDate(rowData.birthDate)}</span>
            <small className="text-color-secondary">{calculateAge(rowData.birthDate)} anos</small>
        </div>
    );

    const genderBodyTemplate = (rowData: Client) => (
        <Badge 
            value={rowData.gender} 
            severity="info" 
            
        />
    );

    const actionBodyTemplate = (rowData: Client) => {
        return (
            <div className="flex gap-1">
                <Button
                    icon="pi pi-eye"
                    rounded
                    severity="info"
                    size="small"
                    tooltip="Ver detalhes"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => handleViewClient(rowData)}
                />
                <Button
                    icon="pi pi-pencil"
                    rounded
                    severity="success"
                    size="small"
                    tooltip="Editar cliente"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => onEdit(rowData)}
                />
                <Button
                    icon="pi pi-trash"
                    rounded
                    severity="danger"
                    size="small"
                    tooltip="Excluir cliente"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => onDelete(rowData)}
                />
            </div>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-2">
            <h5 className="m-0 text-lg md:text-xl">Todos os Clientes</h5>
            <span className="p-input-icon-left w-full md:w-auto">
                <i className="pi pi-search" />
                <InputText
                    type="search"
                    value={filters.global.value}
                    onChange={onGlobalFilterChange}
                    placeholder="Buscar clientes..."
                    className="w-full"
                />
            </span>
        </div>
    );

    return (
        <div className="mt-5">
            <Toast ref={toast} />
            <ConfirmDialog />
            
            {/* Versão Desktop */}
            <div className="hidden md:block">
                <DataTable
                    ref={dt}
                    value={clients}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    className="datatable-responsive"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Mostrando {first} até {last} de {totalRecords} clientes"
                    emptyMessage="Nenhum cliente encontrado."
                    header={header}
                    responsiveLayout="scroll"
                    filters={filters}
                    filterDisplay="row"
                    globalFilterFields={['name', 'email', 'phoneNumber']}
                    dataKey="id"
                >
                    <Column 
                        field="name" 
                        header="Nome" 
                        sortable 
                        body={nameBodyTemplate} 
                        headerStyle={{ minWidth: '15rem' }} 
                    />
                    <Column 
                        field="email" 
                        header="E-mail" 
                        sortable 
                        body={emailBodyTemplate} 
                        headerStyle={{ minWidth: '15rem' }} 
                    />
                    <Column 
                        field="phoneNumber" 
                        header="Telefone" 
                        sortable 
                        body={phoneBodyTemplate} 
                        headerStyle={{ minWidth: '12rem' }} 
                    />
                    <Column 
                        field="birthDate" 
                        header="Nascimento" 
                        sortable 
                        body={birthdayBodyTemplate} 
                        headerStyle={{ minWidth: '12rem' }} 
                    />
                    <Column 
                        field="gender" 
                        header="Gênero" 
                        body={genderBodyTemplate} 
                        headerStyle={{ minWidth: '8rem' }} 
                    />
                    <Column 
                        body={actionBodyTemplate} 
                        header="Ações" 
                        headerStyle={{ minWidth: '10rem' }} 
                        exportable={false}
                    />
                </DataTable>
            </div>

            {/* Versão Mobile */}
            <div className="block md:hidden">
                <div className="mb-4">
                    {header}
                </div>
                
                <div className="grid">
                    {clients.map((client) => (
                        <div key={client.id} className="col-12">
                            {mobileRowTemplate(client)}
                        </div>
                    ))}
                </div>

                {/* Paginação manual para mobile */}
                {clients.length === 0 && (
                    <div className="text-center py-4 text-color-secondary">
                        Nenhum cliente encontrado.
                    </div>
                )}
            </div>

            <ViewClientDialog 
                client={viewClient} 
                visible={viewDialogVisible} 
                onHide={hideViewDialog} 
            />
        </div>
    );
};

export default ClientsTable;