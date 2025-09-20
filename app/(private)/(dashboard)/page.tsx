// app/products/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Skeleton } from 'primereact/skeleton';
import ProductGrid from './components/ProductGrid';
import ProductList from './components/ProductList';
import ProductDialog from './components/ProductDialog';
import FiltersPanel from './components/FiltersPanel';
import StatsCards from './components/StatsCards';
import { Product, ViewMode } from './types';


export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productDialog, setProductDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [uniqueTypes, setUniqueTypes] = useState<string[]>([]);
  const [uniqueSizes, setUniqueSizes] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const toast = useRef<Toast>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      
      if (response.status === 401) {
        window.location.href = '/login';
        throw new Error('Não autorizado');
      }
      
      if (!response.ok) {
        throw new Error('Erro ao carregar produtos');
      }
      
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);
      
      const types = Array.from(new Set(data.map((p: Product) => p.type).filter(Boolean)));
      const sizes = Array.from(new Set(data.map((p: Product) => p.size).filter(Boolean)));
      const maxPrice = Math.max(...data.map((p: Product) => p.saleValue));
      
      setUniqueTypes(types as string[]);
      setUniqueSizes(sizes as string[]);
      setPriceRange([0, maxPrice]);
      
    } catch (error) {
      console.error('Erro:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Falha ao carregar produtos',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedType, selectedSize, priceRange, products]);

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.material.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType) {
      filtered = filtered.filter(product => product.type === selectedType);
    }

    if (selectedSize) {
      filtered = filtered.filter(product => product.size === selectedSize);
    }

    filtered = filtered.filter(product => 
      product.saleValue >= priceRange[0] && product.saleValue <= priceRange[1]
    );

    setFilteredProducts(filtered);
  };

  const openProductDialog = (product: Product) => {
    setSelectedProduct(product);
    setProductDialog(true);
  };

  const handleHideDialog = () => {
    setProductDialog(false);
    setSelectedProduct(null);
  };

  return (
    <div className="grid">
      <div className="col-12">
        <Toast ref={toast} />
        
        {/* Header */}
        <Card className="mb-4">
          <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold m-0 text-900">Catálogo de Produtos</h1>
              <p className="text-600 m-0 mt-2">Explore nossa coleção completa de produtos</p>
            </div>
            
            <div className="flex gap-2">
              <Button
                icon="pi pi-th-large"
                className={viewMode === 'grid' ? 'primary' : 'secondary'}
                onClick={() => setViewMode('grid')}
                tooltip="Visualização em grade"
              />
              <Button
                icon="pi pi-bars"
                className={viewMode === 'list' ? 'primary' : 'secondary'}
                onClick={() => setViewMode('list')}
                tooltip="Visualização em lista"
              />
            </div>
          </div>
        </Card>

        {/* Filtros */}
        <Card className="mb-4">
          <FiltersPanel
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            selectedSize={selectedSize}
            setSelectedSize={setSelectedSize}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            uniqueTypes={uniqueTypes}
            uniqueSizes={uniqueSizes}
            maxPrice={Math.max(...products.map(p => p.saleValue))}
          />
        </Card>

        {/* Estatísticas */}
        <StatsCards products={products} />

        {/* Resultados */}
        <Card>
          <div className="flex justify-content-between align-items-center mb-4">
            <span className="text-lg font-semibold">
              {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loading ? (
            <div className="grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="col-12 sm:col-6 lg:col-4 xl:col-3 mb-4">
                  <Card>
                    <Skeleton width="100%" height="200px" className="mb-3" />
                    <Skeleton width="80%" height="1.5rem" className="mb-2" />
                    <Skeleton width="60%" height="1rem" className="mb-3" />
                    <Skeleton width="100%" height="1rem" className="mb-2" />
                  </Card>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-6">
              <i className="pi pi-search text-6xl text-400 mb-3"></i>
              <h3 className="text-xl text-600">Nenhum produto encontrado</h3>
              <p className="text-500">Tente ajustar os filtros de busca</p>
            </div>
          ) : viewMode === 'grid' ? (
            <ProductGrid 
              products={filteredProducts} 
              onProductClick={openProductDialog} 
            />
          ) : (
            <ProductList 
              products={filteredProducts} 
              onProductClick={openProductDialog} 
            />
          )}
        </Card>

        {/* Dialog de Detalhes */}
        <ProductDialog
          product={selectedProduct}
          visible={productDialog}
          onHide={handleHideDialog}
        />
      </div>
    </div>
  );
}