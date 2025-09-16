/* eslint-disable @next/next/no-img-element */
'use client';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import React, { useEffect, useRef, useState } from 'react';
import { ativateUser } from './untils/ativateUser';
import { saveUser } from './untils/saveUser';
import { UserDialog } from './components/UserDialog';
import { editUser } from './untils/editUser';
import { deleteUser } from './untils/deleteUser';
import UserTable from './components/UserTable';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: number;
  password?: string;
  cpf: string;
  phoneNumber: string;
  address: {
    cep: string;
    country: string;
    state: string;
    city: string;
    district: string;
    street: string;
    complement: string;
  };
}

const UsersPage = () => {
  const emptyUser = {
    id: '',
    name: '',
    email: '',
    role: '',
    status: 1,
    password: '',
    cpf: '',
    phoneNumber: '',
    address: {
      cep: '',
      country: '',
      state: '',
      city: '',
      district: '',
      street: '',
      complement: ''
    }
  };

  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User>(emptyUser);

  const [userDialog, setUserDialog] = useState(false);
  const [deleteUserDialog, setDeleteUserDialog] = useState(false);
  const [editUserDialog, setEditUserDialog] = useState(false);
  const [activeUserDialog, setActiveUserDialog] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const toast = useRef<Toast>(null);
  const [loading, setLoading] = useState(false);

  

  // BUsca a lista de usuarios
  const fetchUsers = async () => {
    try {

      const res = await fetch('/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Erro ao buscar os usuários:', data.error);
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao buscar os usuários.',
          life: 3000,
        });
        return;
      }

      setUsers(data);
    } catch (err) {
      console.error('Erro inesperado:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  //Abre o dialogo de novo usuario
  const openNew = () => {
    setUser(emptyUser);
    setSubmitted(false);
    setUserDialog(true);
  };

  const openActive = (user: User) => {
    setUser({ ...user });
    setSubmitted(false);
    setActiveUserDialog(true);
  }

  //Abre o dialogo de editar usuario
  const openEdit = (user: User) => {
    setUser({ ...user });
    setSubmitted(false);
    setUserDialog(true);
  };

  // esconde o diagolo 
  const hideDialog = () => {
    setSubmitted(false);
    setUserDialog(false);
  };

  const handleSaveUser = async () => {
    saveUser({
      user,
      users,
      setSubmitted,
      setUsers,
      setUserDialog,
      setUser,
      emptyUser,
      toast
    })
  }

  const handleEditUser = async () => {

    editUser({
      user,
      users,
      setUser,
      setUsers,
      setUserDialog,
      emptyUser,
      toast
    })
  }

   const handleDeleteUser = async () => {

    deleteUser({
      user,
      users,
      setLoading,
      toast,
      setUsers,
      setUser,
      emptyUser,
      setDeleteUserDialog,
      fetchUsers
    })
  }

  // Confirma a exclusão do usuario
  const confirmDeleteProduct = (user: User) => {
    setUser(user);
    setDeleteUserDialog(true);
  };

  const leftToolbarTemplate = () => (
    <div className="my-2">
      <Button label="Novo Usuário" icon="pi pi-plus" severity="success" className="mr-2" onClick={openNew} />
    </div>
  );

  const deleteUserDialogFooter = (
    <>
      <Button label="Não" icon="pi pi-times" text onClick={() => setDeleteUserDialog(false)} />
      <Button label="Sim" icon="pi pi-check" text onClick={handleDeleteUser} />
    </>
  );

  const handleActiveUser = () => {
    ativateUser(
      user,
      setActiveUserDialog,
      setUser,
      fetchUsers,
      users,
      toast,
      emptyUser,
    )
  }

  const activeUserDialogFooter = (
    <>
      <Button label="Não" icon="pi pi-times" text onClick={() => setActiveUserDialog(false)} />
      <Button label="Sim" icon="pi pi-check" text onClick={handleActiveUser} />
    </>
  );


  return (
    <div className="grid crud-demo">
      <div className="col-12">
        <div className="card">

          <Toast ref={toast} />
          <Toolbar className="mb-4" left={leftToolbarTemplate} />
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
              <ProgressSpinner
                style={{ width: '60px', height: '60px' }}
                strokeWidth="8"
                fill="var(--surface-ground)"
                animationDuration=".5s"
              />
            </div>
          ) : (
            <UserTable 
              users={users}
              openEdit={openEdit} 
              confirmDeleteProduct={confirmDeleteProduct}
              openActive={openActive}
            /> 
          )}

          <UserDialog 
            open={userDialog}
            onClose={hideDialog}
            user={user}
            setUser={setUser}
            submitted={submitted}
            handleUser={handleSaveUser}
          />

          <UserDialog 
            open={editUserDialog}
            onClose={hideDialog}
            user={user}
            setUser={setUser}
            submitted={submitted}
            handleUser={handleEditUser}
            typeEdit={editUserDialog}
          />


          <Dialog visible={deleteUserDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteUserDialogFooter} onHide={()=> setDeleteUserDialog(false)}>
            <div className="confirmation-content">
              <i className="pi pi-exclamation-triangle mr-3" />
              {user && <span>Tem certeza que deseja excluir <b>{user.name}</b>?</span>}
            </div>
          </Dialog>

          <Dialog visible={activeUserDialog} style={{ width: '450px' }} header="Confirmar" modal footer={activeUserDialogFooter} onHide={() => setActiveUserDialog(false)}>
            <div className="confirmation-content">
              <i className="pi pi-exclamation-triangle mr-3" />
              {user && <span>Tem certeza que deseja ativar o usuario de <b>{user.name}</b>?</span>}
            </div>
          </Dialog>


        </div>
      </div>
    </div>
  );
};

export default UsersPage;
