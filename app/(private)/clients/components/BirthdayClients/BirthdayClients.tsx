'use client';
import { useState, useEffect } from "react";
import { Toolbar } from "primereact/toolbar";
import ClientDialog from "./ClientDialog";
import { Client } from "../../types";
import ClientList from "./ClientList";



export default function BirthdayClients() {
    const [clients, setClients] = useState<Client[]>([]);
    const [birthdayClients, setBirthdayClients] = useState<Client[]>([]);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [visible, setVisible] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/clients');
            if (response.status === 401) {
        // Token expirado - redireciona para login
        window.location.href = '/login';
        throw new Error('Não autorizado - redirecionando para login');
        }
            const data = await response.json();
            setClients(data);
            
            // Filtrar apenas os aniversariantes do mês atual
            const currentMonth = new Date().getMonth();
            const birthdayClients = data.filter((client: Client) => {
                const birthDate = new Date(client.birthDate);
                return birthDate.getMonth() === currentMonth;
            });
            
            setBirthdayClients(birthdayClients);
        } catch (error) {
            console.error("Erro ao buscar clientes:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchClients();
    }, []);

    const openClientDetails = (client: Client) => {
        setSelectedClient(client);
        setVisible(true);
    }

    const hideDialog = () => {
        setVisible(false);
        setSelectedClient(null);
    }

    if (loading) {
        return (
            <div className="text-center py-4">
                <i className="pi pi-spinner pi-spin text-xl"></i>
                <p className="text-sm mt-2">Carregando aniversariantes...</p>
            </div>
        );
    }

    return (
        <div className="border-round border-1 surface-border">
            <Toolbar 
                className="border-bottom-1 surface-border px-3 py-2" 
                left={<h3 className="text-lg m-0">🎂 Aniversariantes do Mês</h3>}
                right={<span className="bg-primary border-circle text-white w-2rem h-2rem flex align-items-center justify-content-center text-sm">{birthdayClients.length}</span>}
            />
            
            {birthdayClients.length === 0 ? (
                <div className="text-center py-4">
                    <i className="pi pi-calendar-times text-3xl text-400"></i>
                    <h4 className="text-base mt-2">Nenhum aniversariante este mês</h4>
                    <p className="text-sm text-600">Não há clientes fazendo aniversário no mês atual.</p>
                </div>
            ) : (
                <ClientList 
                    clients={birthdayClients} 
                    onClientClick={openClientDetails} 
                />
            )}
            
            <ClientDialog 
                client={selectedClient} 
                visible={visible} 
                onHide={hideDialog} 
            />
        </div>
    );
}