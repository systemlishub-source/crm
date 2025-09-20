// app/products/components/ProductGrid.tsx
import ProductCard from './ProductCard';
import { Product } from '../types';

interface ProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

export default function ProductGrid({ products, onProductClick }: ProductGridProps) {
  return (
    <div className="grid">
      {products.map((product) => (
        <div key={product.id} className="col-12 sm:col-6 lg:col-4 xl:col-3 mb-3 md:mb-4">
          <ProductCard product={product} onClick={onProductClick} />
        </div>
      ))}
    </div>
  );
}