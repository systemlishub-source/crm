import { Toast } from "primereact/toast";
import { User } from "../page";


interface deleteUserParams {
    user: User;
    users: User[];
    setUsers: (users: User[]) => void;
    setUser: (user: User) => void;
    emptyUser: User;
    setLoading: (loading: boolean) => void;
    toast: React.RefObject<Toast>;
    setDeleteUserDialog: (visible: boolean) => void;
    fetchUsers: () => void;
}



export  // Deleta o usuario
    const deleteUser = async ({
        user,
        users,
        setLoading,
        toast,
        setUsers,
        setUser,
        emptyUser,
        setDeleteUserDialog,
        fetchUsers
    }: deleteUserParams) => {

        if (!user.id) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/users/${user.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
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
                    detail: data.error || 'Erro ao Excluir o usuário.',
                    life: 3000,
                });
                return;
            }

            toast.current?.show({
                severity: 'success',
                summary: 'Sucesso',
                detail: data.message || 'Usuário excluido com sucesso.',
                life: 3000,
            });

            // Atualiza lista local
            const updatedUsers = users.map((u) => (u.id === user.id ? data : u));
            setUsers(updatedUsers);
            setUser(data);
            setDeleteUserDialog(false);
            fetchUsers()
            setUser(emptyUser);
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
