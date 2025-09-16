/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter } from 'next/navigation';
import React, { useContext, useState } from 'react';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { LayoutContext } from '../../../layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import Swal from 'sweetalert2'
import { ProgressSpinner } from 'primereact/progressspinner';
import { Dialog } from 'primereact/dialog';
import { set } from 'zod';

const LoginPage = () => {
    const [checked, setChecked] = useState(false);
    const { layoutConfig, refreshUser } = useContext(LayoutContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [token, setToken] = useState('');


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {

            if (!email || !password) {
                Swal.fire({
                    title: "Erro!",
                    text: 'Por favor, preencha todos os campos.',
                    icon: "error",
                });
                setLoading(false);
                return
            }

            if (password.length < 6) {
                Swal.fire({
                    title: "Erro!",
                    text: 'A senha deve ter pelo menos 6 caracteres.',
                    icon: "error",
                });
                setLoading(false);
                return
            }
            const res = await fetch('/api/authenticate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // ESSENCIAL para enviar e receber cookies
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (data.token) {
                setToken(data.token); // <- Agora o token estará disponível para as próximas chamadas
            }

            if (!res.ok) {
                // Login bem-sucedido, redireciona
                Swal.fire({
                    title: "Erro!",
                    text: data.error,
                    icon: "error",
                });
                setLoading(false);
                return;
            }


            if (data.mustChangePassword) {
                setShowPasswordModal(true)

            } else {
                await refreshUser()
                router.push('/');
            }

        } catch (err) {
            console.error('Erro inesperado:', err);
            setLoading(false);
        }
    };

    const handlePassword = async (e: React.FormEvent) => {
        try {

            const res = await fetch('/api/forgetPassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',

                },
                credentials: 'include', // ESSENCIAL para enviar e receber cookies
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (!res.ok) {
                // Erro ao enviar email
                Swal.fire({
                    title: "Erro!",
                    text: data.error,
                    icon: "error",
                });
                setLoading(false);
                return;
            }
            // Email enviado com sucesso
            Swal.fire({
                title: "Sucesso!",
                text: "Um email foi enviado para você com instruções para redefinir sua senha.",
                icon: "success",
            });

        } catch (err) {
            console.error('Erro inesperado:', err);
            setLoading(false);
        }
    }

    const handleNewPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!newPassword || !confirmNewPassword) {
            setErrorMessage('Por favor, preencha todos os campos.');
            setShowErrorModal(true);
            setLoading(false);
            return;
        }
        if (newPassword.length < 6) {
            setErrorMessage('A senha deve ter pelo menos 6 caracteres.');
            setShowErrorModal(true);
            setLoading(false);
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setErrorMessage('As senhas não coincidem.');
            setShowErrorModal(true);
            setLoading(false);
            return;
        }
        try {
            const res = await fetch('/api/changePassword', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${token}`
                },
                credentials: 'include', // ESSENCIAL para enviar e receber cookies
                body: JSON.stringify({ newPassword, token })
            });

            const data = await res.json();

            if (!res.ok) {

                Swal.fire({
                    title: "Erro!",
                    text: data.error,
                    icon: "error",
                });
                setLoading(false);
                return;
            }
            hideDialog()
            await refreshUser()
            router.push('/');

        } catch (err) {
            console.error('Erro inesperado:', err);
            setLoading(false);
        }
    };

    const hideDialog = () => {
        setShowPasswordModal(false);
        setLoading(false);
    };

    const DialogFooter = (
        <>
            <Button label="Salvar" icon="pi pi-check" text onClick={handleNewPassword} />
        </>
    );

    const ErrorFooter = (
        <>
            <Button label="OK" icon="pi pi-check" text onClick={() => setShowErrorModal(false)} />
        </>
    );
    const router = useRouter();
    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden', { 'p-input-filled': layoutConfig.inputStyle === 'filled' });
    return (
        <div className={containerClassName}>
            <div className="grid grid-nogutter w-full h-screen">
                {/* Formulário de Login - Lado Esquerdo */}
                <div className="col-12 md:col-4 flex align-items-center justify-content-center py-5"
                    style={{
                        backgroundImage: "url('/layout/bg_lg4.svg')",
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                >
                    <div className="w-full px-4 sm:px-6 md:px-8" style={{ maxWidth: '500px' }}>
                        <div className="text-center mb-5">
                            <img src={`/layout/logotipo.png`} alt="Logo Lis Hub" className="mb-5 w-6rem flex-shrink-0" />
                            <div className="text-900 text-3xl font-medium mb-3 text-blue-500"></div>
                            <span className="text-600 font-medium line-height-3">Entre com sua conta</span>
                        </div>

                        <form onSubmit={handleLogin}>
                            <label htmlFor="email1" className="block text-900 text-xl font-medium mb-2">
                                Email:
                            </label>
                            <InputText
                                id="email1"
                                type="text"
                                placeholder="Endereço de e-mail"
                                className="w-full mb-5"
                                style={{ padding: '1rem' }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />

                            <label htmlFor="password1" className="block text-900 font-medium text-xl mb-2">
                                Senha de Acesso:
                            </label>
                            <Password
                                inputId="password1"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                feedback={false}
                                toggleMask
                                className="w-full mb-5"
                                inputClassName="w-full p-3"
                            />

                            <div className="flex align-items-center justify-content-between mb-5 gap-5">
                                <div className="flex align-items-center">
                                    <Checkbox inputId="rememberme1" checked={checked} onChange={(e) => setChecked(e.checked ?? false)} className="mr-2"></Checkbox>
                                    <label htmlFor="rememberme1">Lembre-se de mim</label>
                                </div>
                                <a
                                    className="font-medium no-underline ml-2 text-right cursor-pointer"
                                    style={{ color: 'var(--primary-color)' }}
                                    onClick={handlePassword}
                                >
                                    Esqueci minha senha?
                                </a>
                            </div>

                            {loading ? (
                                <div className="flex justify-content-center">
                                    <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="6" />
                                </div>
                            ) : (
                                <Button label="Login" className="w-full p-3 text-xl" type="submit" />
                            )}


                        </form>
                    </div>
                </div>

                {/* Imagem - Lado Direito (visível apenas em desktop) */}
                <div className="col-8 hidden md:flex p-0">
                    <img
                        src="/layout/login_bg2.png"
                        alt="Background image"
                        className="h-full w-full"
                        style={{ objectFit: 'cover' }}
                    />
                </div>
            </div>

            {/* Modais (mantidos da implementação original) */}
            <Dialog visible={showPasswordModal} style={{ width: '450px' }} header="Defina sua Senha" modal className="p-fluid" footer={DialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label htmlFor="newPassword">Nova Senha:</label>
                    <Password
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        toggleMask
                        feedback={false}
                    />
                </div>
                <div className="field">
                    <label htmlFor="confirPassword">Confirmar Senha:</label>
                    <Password
                        id="confirPassword"
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        value={confirmNewPassword}
                        required
                        toggleMask
                        feedback={false}

                    />
                </div>
            </Dialog>

            <Dialog visible={showErrorModal} style={{ width: '450px' }} header="Erro" modal footer={ErrorFooter} onHide={() => setShowErrorModal(false)}>
                <div className="flex align-items-center justify-content-center">
                    <span>{errorMessage}</span>
                </div>
            </Dialog>
        </div>
    );
};

export default LoginPage;
