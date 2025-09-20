export const createClient = async (clientData: any) => {
    const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ...clientData,
            address: clientData.address[0]
        }),
    });
    if (response.status === 401) {
        // Token expirado - redireciona para login
        window.location.href = '/login';
        throw new Error('Não autorizado - redirecionando para login');
        }
    return response.json();
};