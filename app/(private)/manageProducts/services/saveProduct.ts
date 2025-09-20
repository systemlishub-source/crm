import { Product } from "../page";

export const saveProduct = async (
  product: Product,
  selectedFile: File | null,
  setSubmitted: (submitted: boolean) => void,
  fetchProducts: () => Promise<void>,
  hideDialog: () => void,
  toast: any
) => {
  setSubmitted(true);

  // Validação básica
  if (!product.name ||
    !product.type ||
    product.purchaseValue <= 0 ||
    product.saleValue <= 0 ||
    product.quantity < 0 ||
    !product.supplier ||
    !product.model ||
    !product.color ||
    !product.size ||
    !product.sizeNumber ||
    !product.material) {
    toast.current?.show({
      severity: 'error',
      summary: 'Erro',
      detail: 'Preencha todos os campos obrigatórios corretamente',
      life: 3000
    });
    return;
  }

  try {
    // Criar FormData em vez de JSON
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

    const response = await fetch('/api/products', {
      method: 'POST',
      body: formData, // Enviar FormData
      // NÃO definir Content-Type header - o browser fará isso automaticamente
    });

    if (response.status === 401) {
        // Token expirado - redireciona para login
        window.location.href = '/login';
        throw new Error('Não autorizado - redirecionando para login');
        }

    if (response.ok) {
      // Sucesso
      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: `Produto criado com sucesso`,
        life: 3000
      });

      fetchProducts();
      hideDialog();
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao salvar produto');
    }
  } catch (error) {
    console.error('Erro ao salvar produto:', error);
    toast.current?.show({
      severity: 'error',
      summary: 'Erro',
      detail: 'Erro ao salvar produto. Tente novamente.',
      life: 3000
    });
  }
};