'use client'
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { User } from "../page";
import { useRef, useState } from "react";
import { FilterMatchMode } from "primereact/api";

interface UserTableProps {
    users: User[];
    openEdit: (user: User) => void;
    confirmDeleteProduct: (user: User) => void;
    openActive: (user: User) => void;
}

const UserTable = ({ users, openEdit, confirmDeleteProduct, openActive }: UserTableProps) => {
    const [selectedUsers, setSelectedUsers] = useState(null);
    const dt = useRef<DataTable<any>>(null);

    const [filters, setFilters] = useState({
        global: { value: '', matchMode: FilterMatchMode.CONTAINS }
    });

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filters = { ...filters };

        _filters['global'].value = value;

        setFilters(_filters);
    };


    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Cadastro de Usuários</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                    type="search"
                    value={filters.global.value}
                    onChange={onGlobalFilterChange}
                    placeholder="Buscar..."
                />
            </span>
        </div>
    );

    const nameBodyTemplate = (rowData: User) => <span>{rowData.name}</span>;
    const cpfBodyTemplate = (rowData: User) => <span>{rowData.cpf}</span>;
    const emailBodyTemplate = (rowData: User) => <span>{rowData.email}</span>;

    const statusBodyTemplate = (rowData: User) => (
        <>
            {rowData.status === 1 ? (
                <span className="product-badge status-available">Ativo</span>
            ) : rowData.status === 2 ? (
                <span className="product-badge status-outofstock">Inativo</span>
            ) : null}
        </>
    );


    const actionBodyTemplate = (rowData: User) => {
        if (rowData.status === 1) {
            // Botões para usuarios ativos (editar/excluir)
            return (
                <>
                    <Button
                        icon="pi pi-pencil"
                        rounded
                        severity="info"
                        className="mr-2"
                        tooltip="Editar usuário"
                        onClick={() => openEdit(rowData)}
                    />
                    <Button
                        icon="pi pi-trash"
                        rounded
                        severity="danger"
                        tooltip="Excluir usuário"
                        onClick={() => confirmDeleteProduct(rowData)}
                    />
                </>
            );
        } else {
            // Botão para usuarios inativos (reativar)
            return (
                <Button
                    icon="pi pi-refresh"
                    rounded
                    severity="success"
                    tooltip="Reativar transporte"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => openActive(rowData)}
                />
            );
        }
    }
    return (
        <DataTable
            ref={dt}
            value={users}
            selection={selectedUsers}
            onSelectionChange={(e) => setSelectedUsers(e.value as any)}
            paginator
            rows={5}
            rowsPerPageOptions={[5, 10, 25]}
            className="datatable-responsive"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} até {last} de {totalRecords} usuários"
            emptyMessage="Nenhum usuário encontrado."
            header={header}
            responsiveLayout="scroll"
            filters={filters}
            filterDisplay="row"
            globalFilterFields={['name', 'email', 'role']}
        >
            <Column field="name" header="Nome" sortable body={nameBodyTemplate} headerStyle={{ minWidth: '15rem' }} />
            <Column field="cpf" header="Cpf" sortable body={cpfBodyTemplate} headerStyle={{ minWidth: '15rem' }} />
            <Column field="email" header="E-mail" sortable body={emailBodyTemplate} headerStyle={{ minWidth: '15rem' }} />
            <Column field="status" header="Status" body={statusBodyTemplate} sortable headerStyle={{ minWidth: '10rem' }} />
            <Column body={actionBodyTemplate} header="Ações" headerStyle={{ minWidth: '10rem' }} />
        </DataTable>
    )
}

export default UserTable;