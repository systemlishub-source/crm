// app/products/components/ProductCard.tsx
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Badge } from 'primereact/badge';
import { ProgressBar } from 'primereact/progressbar';
import { Image } from 'primereact/image';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
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
    <Card 
      className="h-full border-1 surface-border shadow-2 hover:shadow-4 transition-all transition-duration-300 cursor-pointer"
      onClick={() => onClick(product)}
    >
      <div className="flex flex-column h-full">
        {/* Imagem do Produto */}
        <div className="relative mb-3">
          {product.image ? (
            <Image 
              src={product.image} 
              alt={product.name}
              width="100%"
              height="200px"
              className="border-round-top"
              imageClassName="w-full h-10rem md:h-12rem object-cover border-round-top"
            />
          ) : (
            <div className="w-full h-10rem md:h-12rem bg-gray-100 border-round-top flex align-items-center justify-content-center">
              <i className="pi pi-image text-3xl md:text-4xl text-400"></i>
            </div>
          )}
          
          {/* Badge de Status */}
          <Tag 
            value={stockStatus.label}
            className={`absolute top-0 right-0 m-1 md:m-2 text-xs ${stockStatus.severity}`}
          />
        </div>

        {/* Informações do Produto */}
        <div className="flex flex-column flex-1 gap-2 p-2 md:p-3">
          <div className="flex justify-content-between align-items-start">
            <h3 className="text-base md:text-lg font-semibold text-900 m-0 line-clamp-2 flex-1">
              {product.name}
            </h3>
            <Badge 
              value={product.code} 
               
              className="text-xs ml-2 flex-shrink-0 secondary"
            />
          </div>

          <div className="text-sm text-600 hidden md:block">{product.model}</div>
          
          <div className="flex gap-1 md:gap-2 flex-wrap">
            <Tag value={product.type} severity="info" className="text-xs" />
            {product.size && (
              <Tag value={`Tamanho: ${product.size} (${product.sizeNumber})`}  className="text-xs secondary" />
            )}
          </div>

          <div className="mt-auto">
            <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-1 md:gap-2 mb-2">
              <span className="text-xl md:text-2xl font-bold text-primary">
                R$ {product.saleValue.toFixed(2)}
              </span>
            </div>

            <div className="text-xs text-500 mb-1 md:mb-2">
              {product.quantity} unid. em estoque
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
          </div>
        </div>
      </div>
    </Card>
  );
}