import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useRef, useState, useEffect } from "react";
import { Product } from "../page";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode } from "primereact/api";
import { Card } from "primereact/card";
import { Badge } from "primereact/badge";
import { getOptimizedImageUrl } from "../../untils/cloudinaryOptimizer";

const formatCurrency = (value: string | number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(Number(value));
};

const formatDate = (value: string) => {
  const date = new Date(value);
  return date.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// Função para obter a URL da imagem do produto
const getProductImage = (imageUrl: string | null | undefined) => {
  if (!imageUrl) {
    return '/layout/no-image.jpg'; // Caminho para a imagem padrão na pasta public
  }
  const optimizedUrl = getOptimizedImageUrl(imageUrl,300, 'auto');
  console.log('Optimized Image URL:', optimizedUrl);
  return optimizedUrl;
};

const ProductsTable = (
  { products, editProduct, confirmDeleteProduct, entryProduct }: any
) => {
  const dt = useRef<DataTable<any>>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [filters, setFilters] = useState({
      global: { value: '', matchMode: FilterMatchMode.CONTAINS }
    });

  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

  // Verificar o tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getInventoryStatus = (quantity: number) => {
    if (quantity === 0) return { status: 'outofstock', label: 'Fora de Estoque' };
    if (quantity > 0 && quantity <= 10) return { status: 'lowstock', label: 'Estoque Baixo' };
    if (quantity > 10) return { status: 'instock', label: 'Estoque Alto' };
    return { status: 'outofstock', label: 'Sem Estoque' };
  };

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      let _filters = { ...filters };
  
      _filters['global'].value = value;
  
      setFilters(_filters);
      setGlobalFilter(value);
    };

  const header = (
      <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
          <h5 className="m-0">Controle de Produtos</h5>
          <span className="block mt-2 md:mt-0 p-input-icon-left">
              <i className="pi pi-search" />
              <InputText
                type="search"
                value={filters.global.value}
                onChange={onGlobalFilterChange}
                placeholder="Buscar por Código, Nome, Tipo..."
              />
          </span>
      </div>
  );

  // Filtra os produtos com base no filtro global
  const filteredProducts = products.filter((product: Product) => {
    const searchTerm = filters.global.value.toLowerCase();
    return (
      product.name?.toLowerCase().includes(searchTerm) ||
      product.code?.toLowerCase().includes(searchTerm) ||
      product.type?.toLowerCase().includes(searchTerm) ||
      formatCurrency(product.purchaseValue as number).toLowerCase().includes(searchTerm) ||
      formatCurrency(product.saleValue as number).toLowerCase().includes(searchTerm) ||
      formatDate(product.createdAt).toLowerCase().includes(searchTerm)
    );
  });

  // Renderização para mobile - Cards
  const renderMobileView = () => {
    return (
      <div className="flex flex-column">
        {/* Header com título e busca para mobile */}
        <div className="flex flex-column mb-3">
          <h5 className="m-0 mb-2">Controle de Produtos</h5>
          <div className="p-input-icon-left w-full">
            <i className="pi pi-search" />
            <InputText
              type="search"
              value={filters.global.value}
              onChange={onGlobalFilterChange}
              placeholder="Buscar por Código, Nome, Tipo..."
              className="w-full"
            />
          </div>
          {filters.global.value && (
            <div className="text-sm text-color-secondary mt-2">
              {filteredProducts.length} produto(s) encontrado(s)
            </div>
          )}
        </div>

        {/* Lista de produtos */}
        <div className="grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product: Product) => {
              const inventoryStatus = getInventoryStatus(product.quantity);
              const productImage = getProductImage(product.image);
              
              return (
                <div key={product.id} className="col-12 p-2">
                  <Card>
                    <div className="flex flex-column">
                      <div className="flex align-items-center justify-content-between mb-2">
                        <div className="flex align-items-center">
                          <img 
                            src={productImage} 
                            alt={product.name || 'Product Image'} 
                            className="mr-3 shadow-2" 
                            width="60" 
                            height="60"
                            style={{ objectFit: 'cover', borderRadius: '4px' }}
                            onError={(e) => {
                              // Fallback adicional caso a imagem padrão também não carregue
                              const target = e.target as HTMLImageElement;
                              target.src = '/layout/no-image.jpg';
                            }}
                          />
                          <div>
                            <div className="text-lg font-bold">{product.name}</div>
                            <div className="text-sm text-color-secondary">Cód: {product.code}</div>
                          </div>
                        </div>
                        <Badge 
                          value={inventoryStatus.label} 
                          severity={
                            inventoryStatus.status === 'instock' ? 'success' : 
                            inventoryStatus.status === 'lowstock' ? 'warning' : 'danger'
                          } 
                        />
                      </div>
                      
                      <div className="grid text-sm mt-2">
                        <div className="col-6">
                          <div className="text-color-secondary">Tipo:</div>
                          <div>{product.type}</div>
                        </div>
                        <div className="col-6">
                          <div className="text-color-secondary">Criado em:</div>
                          <div>{formatDate(product.createdAt)}</div>
                        </div>
                        <div className="col-6 mt-2">
                          <div className="text-color-secondary">Compra:</div>
                          <div>{formatCurrency(product.purchaseValue as number)}</div>
                        </div>
                        <div className="col-6 mt-2">
                          <div className="text-color-secondary">Venda:</div>
                          <div>{formatCurrency(product.saleValue as number)}</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-content-end mt-3 gap-2">
                        <Button 
                          icon="pi pi-pencil" 
                          rounded 
                          text 
                          severity="info" 
                          onClick={() => editProduct(product)} 
                          aria-label="Editar"
                        />
                        <Button 
                          icon="pi pi-trash" 
                          rounded 
                          text 
                          severity="danger" 
                          onClick={() => confirmDeleteProduct(product)} 
                          aria-label="Excluir"
                        />
                        <Button 
                          icon="pi pi-plus" 
                          rounded 
                          text 
                          severity="success" 
                          onClick={() => console.log('Dar entrada no produto')} 
                          aria-label="Adicionar"
                        />
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })
          ) : (
            <div className="col-12 text-center py-5">
              <i className="pi pi-search" style={{ fontSize: '2rem' }} />
              <p className="mt-2">Nenhum produto encontrado</p>
              {filters.global.value && (
                <Button 
                  label="Limpar busca" 
                  className="p-button-text mt-2" 
                  onClick={() => {
                    setFilters({ global: { value: '', matchMode: FilterMatchMode.CONTAINS } });
                    setGlobalFilter('');
                  }} 
                />
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Renderização para desktop - Tabela tradicional
  const renderDesktopView = () => {
    const codeBodyTemplate = (rowData: Product) => <span>{rowData.code}</span>;
    const nameBodyTemplate = (rowData: Product) => <span>{rowData.name}</span>;
    const purchaseValueTemplate = (rowData: Product) => <span>{formatCurrency(rowData.purchaseValue as number)}</span>;
    const saleValueTemplate = (rowData: Product) => <span>{formatCurrency(rowData.saleValue as number)}</span>;
    const typeBodyTemplate = (rowData: Product) => <span>{rowData.type}</span>;
    const createdAtBodyTemplate = (rowData: Product) => <span>{formatDate(rowData.createdAt)}</span>;

    const imageBodyTemplate = (rowData: Product) => {
      const productImage = getProductImage(rowData.image);
      
      return (
        <>
          <span className="p-column-title">Image</span>
          <img 
            src={productImage} 
            alt={rowData.name || 'Product Image'} 
            className="shadow-2" 
            width="100" 
            height="100"
            style={{ objectFit: 'cover', borderRadius: '4px' }}
            onError={(e) => {
              // Fallback adicional caso a imagem padrão também não carregue
              const target = e.target as HTMLImageElement;
              target.src = '/layout/no-image.jpg';
            }}
          />
        </>
      );
    };

    const statusBodyTemplate = (rowData: Product) => {
      const inventoryStatus = getInventoryStatus(rowData.quantity);
      
      return (
        <span className={`product-badge status-${inventoryStatus.status}`}>
          {inventoryStatus.label}
        </span>
      );
    };

    const actionBodyTemplate = (rowData: Product) => {
      return (
        <>
          <Button icon="pi pi-pencil" rounded severity="info"  tooltip="Editar produto" className="mr-2" onClick={() => editProduct(rowData)} />
          <Button icon="pi pi-trash" rounded severity="danger" tooltip="Excluir produto" className="mr-2" onClick={() => confirmDeleteProduct(rowData)} />
          <Button icon="pi pi-plus" rounded severity="success" tooltip="Dar entrada no produto" onClick={() => entryProduct(rowData)} />
        </>
      );
    };

    return (
      <DataTable
        ref={dt}
        value={filteredProducts}
        dataKey="id"
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25]}
        className="datatable-responsive"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} produtos"
        globalFilter={globalFilter}
        emptyMessage="Nenhum produto encontrado."
        header={header}
        responsiveLayout="scroll"
        filters={filters}
        filterDisplay="row"
        globalFilterFields={['code', 'name', 'type', 'inventoryStatus']}
      >
        <Column field="code" header="Codigo" sortable body={codeBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
        <Column field="name" header="Nome" sortable body={nameBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
        <Column field="type" header="Tipo" sortable body={typeBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
        <Column field="purchaseValue" header="Preço de compra" body={purchaseValueTemplate} sortable></Column>
        <Column field="saleValue" header="Preço de venda" body={saleValueTemplate} sortable></Column>
        <Column field="createdAt" header="Data de Criação" body={createdAtBodyTemplate} sortable headerStyle={{ minWidth: '10rem' }}></Column>
        <Column field="inventoryStatus" header="Status" body={statusBodyTemplate} sortable headerStyle={{ minWidth: '10rem' }}></Column>
        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '12rem' }}></Column>
      </DataTable>
    );
  };

  return (
    <div>
      {isMobile ? renderMobileView() : renderDesktopView()}
    </div>
  );
};

export default ProductsTable;