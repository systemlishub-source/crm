import { Product } from "../page";

export const updateQuantity = async (
  product: Product,
  setSubmitted: (submitted: boolean) => void,
  fetchProducts: () => Promise<void>,
  hideDialog: () => void,
  toast: any,
  quantityToAdd: number, 
) => {
  setSubmitted(true);

  if (quantityToAdd < 0) {
    toast.current?.show({
      severity: 'error',
      summary: 'Erro',
      detail: 'Quantidade não pode ser negativa',
      life: 3000
    });
    return;
  }

  try {
     const newQuantity = (product.quantity || 0) + quantityToAdd;

    // Criar FormData mesmo para atualizar apenas a quantidade
    const formData = new FormData();
    formData.append('quantity', newQuantity.toString());

    // URL específica para edição de produto com ID
    const response = await fetch(`/api/products/${product.id}`, {
      method: 'PATCH',
      body: formData, // Enviar como FormData
      // Não definir Content-Type header, o browser vai definir automaticamente para FormData
    });

    if (response.ok) {
      // Sucesso
      const result = await response.json();
      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: result.message || 'Entrada de produto atualizada com sucesso',
        life: 3000
      });
      
      fetchProducts(); // Recarregar a lista de produtos
      hideDialog();
    } else {
      // Tratar erros da API
      const errorData = await response.json();
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: errorData.error || 'Erro ao atualizar produto',
        life: 3000
      });
    }
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    toast.current?.show({
      severity: 'error',
      summary: 'Erro',
      detail: 'Erro de conexão ao atualizar produto',
      life: 3000
    });
  }
};