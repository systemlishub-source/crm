
export const deleteProduct = async (
  id: number,
  fetchProducts: () => Promise<void>,
  hideDeleteProductDialog: () => void,
  toast: any,
) => {

  try {
    const res = await fetch(`/api/products/${id}`, {
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
        detail: data.error || 'Erro ao Excluir o produto.',
        life: 3000,
      });
      return;
    }

    toast.current?.show({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'produto excluido com sucesso.',
      life: 3000,
    });

    fetchProducts();
    hideDeleteProductDialog();

  } catch (err) {
    console.error('Erro ao excluir produto:', err);
    toast.current?.show({
      severity: 'error',
      summary: 'Erro',
      detail: 'Erro inesperado ao excluir produto.',
      life: 3000,
    });
  }


}