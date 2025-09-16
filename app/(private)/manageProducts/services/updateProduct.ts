import { Product } from "../page";

export const updateProduct = async (
  product: Product,
  selectedFile: File | null,
  setSubmitted: (submitted: boolean) => void,
  fetchProducts: () => Promise<void>,
  hideDialog: () => void,
  toast: any
) => {
  setSubmitted(true);

  // Validação básica para produto
  if (
    !product.name || 
    !product.type || 
    product.purchaseValue <= 0 || 
    product.saleValue <= 0 || 
    product.quantity < 0 || 
    !product.supplier || 
    !product.model || 
    !product.color || 
    !product.size || 
    product.sizeNumber < 0 || 
    !product.material
  ) {
    toast.current?.show({
      severity: 'error',
      summary: 'Erro',
      detail: 'Preencha todos os campos obrigatórios corretamente',
      life: 3000
    });
    return;
  }

  try {
    // Criar FormData em vez de enviar JSON
    const formData = new FormData();
    
    // Adicionar todos os campos do produto (exceto image)
    Object.keys(product).forEach(key => {
      if (key !== 'image' && key !== 'id') {
        const value = (product as any)[key];
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      }
    });
    
    // Adicionar a imagem se existir
    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    // URL específica para edição de produto com ID
    const response = await fetch(`/api/products/${product.id}`, {
      method: 'PATCH',
      body: formData,
      // Não definir Content-Type header - o browser fará isso automaticamente
    });

    if (response.ok) {
      // Sucesso
      const result = await response.json();
      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: result.message || 'Produto atualizado com sucesso!',
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