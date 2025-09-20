// app/products/components/ProductDialog.tsx
import { Dialog } from 'primereact/dialog';
import { Image } from 'primereact/image';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';
import { Product } from '../types';

interface ProductDialogProps {
  product: Product | null;
  visible: boolean;
  onHide: () => void;
}

export default function ProductDialog({ product, visible, onHide }: ProductDialogProps) {
  if (!product) return null;

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { severity: 'danger', label: 'Esgotado' };
    if (quantity < 5) return { severity: 'warning', label: 'Baixo' };
    if (quantity < 10) return { severity: 'info', label: 'Moderado' };
    return { severity: 'success', label: 'Disponível' };
  };

  const getMarginColor = (margin: number) => {
    if (margin > 50) return 'text-green-600';
    if (margin > 30) return 'text-orange-600';
    return 'text-red-600';
  };

  const stockStatus = getStockStatus(product.quantity);

  return (
    <Dialog
      visible={visible}
      style={{ width: '95vw', maxWidth: '1200px' }}
      header={product.name}
      modal
      onHide={onHide}
      className="max-h-screen overflow-auto"
    >
      <div className="grid">
        <div className="col-12 md:col-5 mb-4 md:mb-0">
          {product.image ? (
            <Image 
              src={product.image} 
              alt={product.name}
              width="100%"
              className="border-round"
              preview
            />
          ) : (
            <div className="w-full h-15rem md:h-20rem bg-gray-100 border-round flex align-items-center justify-content-center">
              <i className="pi pi-image text-4xl md:text-6xl text-400"></i>
            </div>
          )}
        </div>
        
        <div className="col-12 md:col-7">
          <div className="flex flex-column gap-3">
            <div>
              <h2 className="text-xl md:text-2xl font-bold m-0">{product.name}</h2>
              <div className="text-sm text-600">{product.model}</div>
            </div>

            <div className="flex flex-wrap gap-1 md:gap-2">
              <Tag value={product.code}  className="secondary text-xs md:text-sm" />
              <Tag value={product.type} severity="info" className="text-xs md:text-sm" />
              {product.size && (
                <Tag value={`Tamanho: ${product.size} (${product.sizeNumber})`} severity="success" className="text-xs" />
              )}
              <Tag value={product.color} severity="info" className="text-xs md:text-sm" />
            </div>

            <div className="grid">
              <div className="col-12 md:col-6 mb-2 md:mb-0">
                <div className="text-sm text-600">Material</div>
                <div className="font-semibold text-sm md:text-base">{product.material}</div>
              </div>
              <div className="col-12 md:col-6">
                <div className="text-sm text-600">Fornecedor</div>
                <div className="font-semibold text-sm md:text-base">{product.supplier || 'Não informado'}</div>
              </div>
            </div>

            {product.description && (
              <div>
                <div className="text-sm text-600">Descrição</div>
                <div className="text-900 text-sm md:text-base">{product.description}</div>
              </div>
            )}

            <div className="grid">
              <div className="col-12  mb-2 md:mb-0">
                <div className="text-sm text-600">Preço de Venda</div>
                <div className="text-xl md:text-2xl font-bold text-primary">
                  R$ {product.saleValue.toFixed(2)}
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-content-between align-items-center mb-2">
                <span className="text-sm text-600">Estoque</span>
                <Tag 
                  value={stockStatus.label}  
                  className={`text-xs md:text-sm ${stockStatus.severity}`}
                />
              </div>
              <ProgressBar 
                value={(product.quantity / 50) * 100} 
                showValue={false}
                className="h-0.75rem md:h-1rem"
                color={
                  product.quantity === 0 ? '#ef4444' :
                  product.quantity < 5 ? '#f59e0b' :
                  product.quantity < 10 ? '#3b82f6' : '#10b981'
                }
              />
              <div className="text-xs text-500 text-center mt-1">
                {product.quantity} unidades disponíveis
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}