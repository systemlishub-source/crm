import { Toast } from "primereact/toast";
import { User } from "../page";

interface editUserParams {
  user: User;
  users: User[];
  setUsers: (users: User[]) => void;
  setUserDialog: (visible: boolean) => void;
  setUser: (user: User) => void;
  emptyUser: User;
  toast: React.RefObject<Toast>;
}


// Edita o usuario
export const editUser = async ({
  user,
  users,
  setUser,
  setUsers,
  setUserDialog,
  emptyUser,
  toast
}: editUserParams) => {
  if (!user.id) return;

  try {
    const res = await fetch(`/api/users/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        name: user.name,
        email: user.email,
        role: user.role,
      }),
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
        detail: data.error || 'Erro ao editar o usuário.',
        life: 3000,
      });
      return;
    }

    toast.current?.show({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Usuário atualizado com sucesso.',
      life: 3000,
    });

    // Atualiza lista local
    const updatedUsers = users.map((u) => (u.id === user.id ? data : u));
    setUsers(updatedUsers);
    setUser(data);
    setUserDialog(false);
    setUser(emptyUser);

  } catch (err) {
    console.error('Erro ao editar usuário:', err);
    toast.current?.show({
      severity: 'error',
      summary: 'Erro',
      detail: 'Erro inesperado ao editar usuário.',
      life: 3000,
    });
  }
};