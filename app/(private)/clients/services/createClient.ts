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
    return response.json();
};