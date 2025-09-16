'use client';
import { Toast } from "primereact/toast";
import { useRef, useState, useEffect } from "react";
import BirthdayClients from "./components/BirthdayClients/BirthdayClients";
import ClientsTable from "./components/ClientsTable/ClientsTable";
import { Client } from "./types";
import { editClient } from "./services/editClient";
import { ClientDialog } from "./components/ClientsTable/ClientDialog";
import { Dialog } from "primereact/dialog";
import { deleteClient } from "./services/deleteClient";

const emptyClient: Client = {
    id: '',
    name: '',
    email: '',
    cpf: '',
    phoneNumber: '',
    birthDate: '',
    gender: '',
    rg: '',
    address: [{
        id: 0,
        cep: '',
        country: '',
        state: '',
        city: '',
        district: '',
        street: '',
        complement: '',
        userId: null,
        clientId: ''
    }]
}

export default function ClientsPage() {
    const toast = useRef<Toast>(null);
    const [clients, setClients] = useState<Client[]>([]);
    const [client, setClient] = useState<Client>(emptyClient);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [clientDialog, setClientDialog] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [deleteClientDialog, setDeleteClientDialog] = useState<boolean>(false);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/clients');
            const data = await response.json();
            setClients(data);
        } catch (error) {
            console.error("Erro ao buscar clientes:", error);
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Falha ao carregar clientes',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    //Abre o dialogo de editar cliente
    const openEdit = (client: Client) => {
        setClient({ ...client });
        setSubmitted(false);
        setClientDialog(true);
    };

    const openDelete = (client: Client) => {
        setClient({ ...client });
        setSubmitted(false);
        setDeleteClientDialog(true);
    }

    // esconde o diagolo 
    const hideDialog = () => {
        setSubmitted(false);
        setClientDialog(false);
    };

    const handleEditClient = async () => {

        editClient({
            client,
            setClient,
            setClientDialog,
            emptyClient,
            toast,
            fetchClients
        })
    }

    const handleDeleteClient = async (client: Client) => {
        
        deleteClient({
            client,
            setLoading,
            toast,
            setClient,
            emptyClient,
            setDeleteClientDialog,
            fetchClients
        })
    }

    const deleteClientDialogFooter = (
        <>
            <button className="p-button p-button-text" onClick={() => setDeleteClientDialog(false)}>Não</button>
            <button className="p-button p-button-text" onClick={() => handleDeleteClient(client)}>Sim</button>
        </>
    );
    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <BirthdayClients />

                    {/* Divisor visual */}
                    <div className="my-5 border-top-1 surface-border"></div>

                    {/* Tabela de todos os clientes */}
                    <ClientsTable
                        clients={clients}
                        onEdit={openEdit}
                        onDelete={openDelete}
                    />

                    <ClientDialog
                        open={clientDialog}
                        onClose={hideDialog}
                        client={client}
                        setClient={setClient}
                        submitted={submitted}
                        handleClient={handleEditClient}
                        typeEdit={clientDialog}
                    />

                    <Dialog visible={deleteClientDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteClientDialogFooter} onHide={() => setDeleteClientDialog(false)}>
                        <div className="confirmation-content">
                            <i className="pi pi-exclamation-triangle mr-3" />
                            {client && <span>Tem certeza que deseja excluir <b>{client.name}</b>?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}