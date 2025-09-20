import { Toast } from "primereact/toast";
import { User } from "../page";

interface saveUserParams {
    user: User;
    users: User[];
    setSubmitted: (submitted: boolean) => void;
    setUsers: (users: User[]) => void;
    setUserDialog: (visible: boolean) => void;
    setUser: (user: User) => void;
    emptyUser: User;
    toast: React.RefObject<Toast>;
}

 // Salva o usuario
  export const saveUser = async ({ user, users, setSubmitted, setUsers, setUserDialog, setUser, emptyUser, toast }: saveUserParams) => {
    setSubmitted(true);

    if (!user.name || !user.email || !user.password || !user.cpf || !user.phoneNumber || 
        !user.address.cep || !user.address.country || !user.address.state || 
        !user.address.city || !user.address.district || !user.address.street) {
        
        // Mostrar mensagem de erro se algum campo obrigatório estiver vazio
        toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Preencha todos os campos obrigatórios',
        life: 3000
        });
        return; // Impede o salvamento se houver campos vazios
    }

    const findIndexById = (id: string) => users.findIndex((u) => u.id === id);


    if (user.name.trim() && user.email.trim() && user.password && user.role) {
      let _users = [...users];
      let _user = { ...user };

      if (user.id) {
        const index = findIndexById(user.id);
        _users[index] = _user;
        toast.current?.show({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Usuário Atualizado',
          life: 3000,
        });
        setUsers(_users);
      } else {
        try {
          const res = await fetch('/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              name: user.name,
              email: user.email,
              password: user.password,
              role: user.role,
              cpf: user.cpf,
              phoneNumber: user.phoneNumber,
              address: {
                cep: user.address.cep,
                country: user.address.country,
                state: user.address.state,
                city: user.address.city,
                district: user.address.district,
                street: user.address.street,
                complement: user.address.complement
              }
            }),
          });

          if (res.status === 401) {
            // Token expirado - redireciona para login
            window.location.href = '/login';
            throw new Error('Não autorizado - redirecionando para login');
          }

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || errorData.error || 'Erro ao criar usuário');
          }

          const createdUser = await res.json();
          _user.id = createdUser.id; // assumindo que o back retorna o ID
          _users.push(_user);

          toast.current?.show({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Usuário Criado',
            life: 3000,
          });

          setUsers(_users);
        } catch (err: any) {
          console.error('Erro ao criar usuário:', err);
          toast.current?.show({
            severity: 'error',
            summary: 'Erro',
            detail: err.message || 'Erro ao criar usuário',
            life: 3000,
          });
          return;
        }
      }

      setUserDialog(false);
      setUser(emptyUser);
    }
  };