
interface fetchClientsProductsParams {
    setLoading: (loading: boolean) => void;
    setClients: (clients: any[]) => void;
    setProducts: (products: any[]) => void;
    showToast: (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => void;
}

export const fetchClientsProducts = async (
    { setLoading, setClients, setProducts, showToast }: fetchClientsProductsParams
) => {
        try {
            setLoading(true);
            
            const [clientsResponse, productsResponse] = await Promise.all([
                fetch('/api/clients'),
                fetch('/api/products')
            ]);

            const clientsData = await clientsResponse.json();
            const productsData = await productsResponse.json();

            setClients(clientsData);
            setProducts(productsData);

        } catch (error) {
            console.error("Erro ao buscar dados:", error);
            showToast('error', 'Erro', 'Falha ao carregar dados');
        } finally {
            setLoading(false);
        }
    };
