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



// services/productService.ts
export const saveProductWithVariations = async (
  product: Product,
  selectedFile: File | null,
  setSubmitted: (submitted: boolean) => void,
  fetchProducts: () => Promise<void>,
  hideDialog: () => void,
  toast: any
) => {
  setSubmitted(true);

  // Validação básica (sem os campos que agora estão nas variações)
  if (!product.name ||
    !product.type ||
    product.purchaseValue <= 0 ||
    product.saleValue <= 0 ||
    !product.supplier ||
    !product.model ||
    !product.material ||
    !product.variations || 
    product.variations.length === 0) {
    toast.current?.show({
      severity: 'error',
      summary: 'Erro',
      detail: 'Preencha todos os campos obrigatórios e adicione pelo menos uma variação',
      life: 3000
    });
    return;
  }

  // Validar cada variação
  const invalidVariation = product.variations.find(variation => 
    !variation.color || 
    !variation.size || 
    variation.sizeNumber <= 0 || 
    variation.quantity < 0
  );

  if (invalidVariation) {
    toast.current?.show({
      severity: 'error',
      summary: 'Erro',
      detail: 'Preencha todos os campos obrigatórios em cada variação',
      life: 3000
    });
    return;
  }

  try {
    let successCount = 0;
    let errorCount = 0;

    // Para cada variação, criar um produto individual
    for (const variation of product.variations) {
      try {
        const formData = new FormData();

        // Criar objeto de produto individual para esta variação
        const individualProduct = {
          name: product.name,
          type: product.type,
          purchaseValue: product.purchaseValue,
          saleValue: product.saleValue,
          supplier: product.supplier,
          model: product.model,
          description: product.description || '',
          material: product.material,
          // Campos da variação se tornam campos do produto individual
          color: variation.color,
          size: variation.size,
          sizeNumber: variation.sizeNumber,
          quantity: variation.quantity,
          margin: product.margin,
          

        };

        // Adicionar todos os campos do produto individual
        Object.keys(individualProduct).forEach(key => {
          const value = (individualProduct as any)[key];
          if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
          }
        });

        // Adicionar a mesma imagem para todos (se existir)
        if (selectedFile) {
          // Criar uma nova instância do File para cada requisição
          const fileCopy = new File([selectedFile], selectedFile.name, {
            type: selectedFile.type,
            lastModified: selectedFile.lastModified
          });
          formData.append('image', fileCopy);
        }

        const response = await fetch('/api/products', {
          method: 'POST',
          body: formData,
        });

        if (response.status === 401) {
          window.location.href = '/login';
          throw new Error('Não autorizado - redirecionando para login');
        }

        if (response.ok) {
          successCount++;
        } else {
          const errorData = await response.json();
          console.error(`Erro na variação ${variation.color}-${variation.size}:`, errorData);
          errorCount++;
        }
      } catch (error) {
        console.error(`Erro ao salvar variação ${variation.color}-${variation.size}:`, error);
        errorCount++;
      }
    }

    // Mostrar resultado consolidado
    if (errorCount === 0) {
      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: `Todos os ${successCount} produtos foram criados com sucesso`,
        life: 5000
      });
    } else if (successCount > 0) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Parcial',
        detail: `${successCount} produtos criados, ${errorCount} falhas`,
        life: 5000
      });
    } else {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Falha ao criar todos os produtos',
        life: 5000
      });
      return; // Não fecha o dialog se todos falharem
    }

    // Só fecha e recarrega se pelo menos um foi salvo com sucesso
    if (successCount > 0) {
      fetchProducts();
      hideDialog();
    }

  } catch (error) {
    console.error('Erro geral ao salvar produtos:', error);
    toast.current?.show({
      severity: 'error',
      summary: 'Erro',
      detail: 'Erro ao processar os produtos. Tente novamente.',
      life: 3000
    });
  }
};