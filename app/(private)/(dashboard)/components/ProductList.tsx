// app/products/components/ProductList.tsx
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Image } from 'primereact/image';
import { Product } from '../types';

interface ProductListProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

export default function ProductList({ products, onProductClick }: ProductListProps) {
  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { severity: 'danger', label: 'Esgotado' };
    if (quantity < 5) return { severity: 'warning', label: 'Baixo' };
    if (quantity < 10) return { severity: 'info', label: 'Moderado' };
    return { severity: 'success', label: 'Disponível' };
  };

  return (
    <div className="flex flex-column gap-2 md:gap-3">
      {products.map((product) => {
        const stockStatus = getStockStatus(product.quantity);
        
        return (
          <Card 
            key={product.id} 
            className="cursor-pointer hover:shadow-3 transition-all p-2 md:p-3"
            onClick={() => onProductClick(product)}
          >
            <div className="flex flex-column md:flex-row gap-2 md:gap-4">
              {/* Imagem */}
              <div className="w-full md:w-8rem h-8rem flex-shrink-0 mx-auto md:mx-0">
                {product.image ? (
                  <Image 
                    src={product.image} 
                    alt={product.name}
                    width="100%"
                    height="100%"
                    className="border-round"
                    imageClassName="w-full h-full object-cover border-round"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 border-round flex align-items-center justify-content-center">
                    <i className="pi pi-image text-2xl md:text-3xl text-400"></i>
                  </div>
                )}
              </div>
              
              {/* Informações */}
              <div className="flex-1">
                <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-start gap-1 md:gap-2 mb-2">
                  <h3 className="text-lg md:text-xl font-semibold m-0 text-center md:text-left">
                    {product.name}
                  </h3>
                  <span className="text-xl md:text-2xl font-bold text-primary text-center md:text-right">
                    R$ {product.saleValue.toFixed(2)}
                  </span>
                </div>
                
                <div className="text-sm text-600 mb-2 text-center md:text-left hidden md:block">
                  {product.model}
                </div>
                
                <div className="flex flex-wrap gap-1 md:gap-2 mb-2 justify-center md:justify-start">
                  <Tag value={product.code} className="text-xs secondary" />
                  <Tag value={product.type} severity="info" className="text-xs" />
                  <Tag value={product.color} severity="warning" className="text-xs" />
                  <Tag 
                    value={stockStatus.label}
                    className={`text-xs ${stockStatus.severity}`}
                  />
                </div>
                

                {/* Modelo visível apenas no mobile */}
                <div className="text-xs text-600 mt-1 text-center md:hidden">
                  {product.model}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}