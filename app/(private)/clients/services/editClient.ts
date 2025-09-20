import { Toast } from "primereact/toast";
import { Client } from "../types";

interface EditClientParams {
    client: Client;
    setClientDialog: (visible: boolean) => void;
    setClient: (client: Client) => void;
    emptyClient: Client;
    toast: React.RefObject<Toast>;
    fetchClients: () => void;
}

export const editClient = async ({
    client,
    setClient,
    setClientDialog,
    emptyClient,
    toast,
    fetchClients
}: EditClientParams) => {
    if (!client.id) return;

    console.log('Editando cliente:', client);
    try {
        const res = await fetch(`/api/clients/${client.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(
                {
                    ...client,
                    address: client.address[0] // Envia apenas o primeiro endereço
                }
            ),
        });

        if (res.status === 401) {
        // Token expirado - redireciona para login
        window.location.href = '/login';
        throw new Error('Não autorizado - redirecionando para login');
        }

        const data = await res.json();

        if (!res.ok) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: data.error || 'Erro ao editar o cliente.',
                life: 3000,
            });
            return;
        }
        
        fetchClients(); // Recarrega a lista de clientes do servidor
        setClientDialog(false);
        setClient(emptyClient);

        toast.current?.show({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Cliente atualizado com sucesso.',
            life: 3000,
        });

    } catch (err) {
        console.error('Erro ao editar cliente:', err);
        toast.current?.show({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro inesperado ao editar cliente.',
            life: 3000,
        });
    }
};