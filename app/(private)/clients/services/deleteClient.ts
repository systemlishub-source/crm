import { Toast } from "primereact/toast";
import { Client } from "../types";


interface deleteClientParams {
    client: Client;
    setClient: (client: Client) => void;
    emptyClient: Client;
    setLoading: (loading: boolean) => void;
    toast: React.RefObject<Toast>;
    setDeleteClientDialog: (visible: boolean) => void;
    fetchClients: () => void;
}



export const deleteClient = async ({
        client,
        setLoading,
        toast,
        setClient,
        emptyClient,
        setDeleteClientDialog,
        fetchClients
    }: deleteClientParams) => {

        if (!client.id) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/clients/${client.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            const data = await res.json();

            if (!res.ok) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erro',
                    detail: data.error || 'Erro ao Excluir o usuário.',
                    life: 3000,
                });
                return;
            }

            toast.current?.show({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Usuário excluido com sucesso.',
                life: 3000,
            });

            setDeleteClientDialog(false);
            fetchClients()
            setClient(emptyClient);
            setLoading(false)

        } catch (err) {
            console.error('Erro ao excluir usuário:', err);
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro inesperado ao excluir usuário.',
                life: 3000,
            });
        }
    };
