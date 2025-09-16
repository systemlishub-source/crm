'use client';
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Card } from "primereact/card";
import { Image } from "primereact/image";
import { Product } from "../../types";
import { useState, useRef, useEffect } from "react";

interface ProductSelectionProps {
    products: Product[];
    selectedProduct: Product | null;
    quantity: number;
    onProductChange: (product: Product | null) => void;
    onQuantityChange: (quantity: number) => void;
    onAddProduct: () => void;
    loading?: boolean;
}

export default function ProductSelection({
    products,
    selectedProduct,
    quantity,
    onProductChange,
    onQuantityChange,
    onAddProduct,
    loading = false
}: ProductSelectionProps) {
    const [quantityError, setQuantityError] = useState<string>('');
    const [isMobile, setIsMobile] = useState(false);
    const dropdownRef = useRef<any>(null);

    // Detectar se é mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const availableProducts = products.filter(p => p.quantity > 0);

    const handleQuantityChange = (e: InputNumberValueChangeEvent) => {
        const newQuantity = e.value || 1;

        if (selectedProduct && newQuantity > selectedProduct.quantity) {
            setQuantityError(`Estoque insuficiente. Disponível: ${selectedProduct.quantity}`);
            return;
        } else {
            setQuantityError('');
        }

        onQuantityChange(newQuantity);
    };

    const handleProductChange = (product: Product | null) => {
        onProductChange(product);
        setQuantityError('');
    };

    // Template responsivo para os itens do dropdown
    const productTemplate = (option: Product) => (
        <div className="flex align-items-center p-2">
            {option.image ? (
                <Image
                    src={option.image}
                    alt={option.name}
                    width={isMobile ? "32" : "40"}
                    height={isMobile ? "32" : "40"}
                    className="mr-2 border-round"
                    imageStyle={{ objectFit: 'cover' }}
                />
            ) : (
                <div className="mr-2">
                    <i className="pi pi-image text-2xl text-400" />
                </div>
            )}
            <div className="flex-1" style={{ minWidth: 0 }}> {/* Permite que o texto quebre */}
                <div className="text-sm font-semibold whitespace-nowrap overflow-hidden text-overflow-ellipsis">
                    {option.code} - {option.name}
                </div>
                {!isMobile && (
                    <>
                        <div className="text-xs text-500">Tamanho: {option.size}{option.sizeNumber ? `(${option.sizeNumber})` : ''}</div>
                        <div className="text-xs text-500">R$ {option.saleValue.toFixed(2)}</div>
                        <div className="text-xs">
                            Em estoque: {option.quantity}
                        </div>
                    </>
                )}
                {isMobile && (
                    <>
                        <div className="text-xs text-500">Tamanho: {option.size} {option.sizeNumber ? `(${option.sizeNumber})` : ''}</div>

                        <div className="text-xs text-500">
                            R$ {option.saleValue.toFixed(2)} • Estoque: {option.quantity}
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    // Template simplificado para mobile
    const selectedProductTemplate = (option: Product) => (
        option ? (
            <div className="flex align-items-center">
                {option.image && (
                    <Image
                        src={option.image}
                        alt={option.name}
                        width="28"
                        height="28"
                        className="mr-2 border-round"
                        imageStyle={{ objectFit: 'cover' }}
                    />
                )}
                <div className="truncate" style={{ maxWidth: isMobile ? '120px' : 'none' }}>
                    <div className="text-xs font-semibold truncate">{option.code}</div>
                    <div className="text-xs truncate">{option.name}</div>
                </div>
            </div>
        ) : (
            <span className="text-sm">Selecione um produto</span>
        )
    );

    // Estilos responsivos para o panel do dropdown
    const getPanelStyle = () => {
        if (isMobile) {
            return {
                width: 'calc(100vw - 32px)',
                maxWidth: '100%',
                left: '16px !important',
                transform: 'none !important'
            };
        }
        return { minWidth: '30rem' };
    };

    return (
        <Card title="Seleção de Produtos" className="mb-3">
            <div className="grid p-fluid">
                <div className="col-12 md:col-6">
                    <div className="field">
                        <label htmlFor="product" className="text-sm font-semibold">Produto</label>
                        <Dropdown
                            ref={dropdownRef}
                            id="product"
                            value={selectedProduct}
                            options={availableProducts}
                            onChange={(e) => handleProductChange(e.value)}
                            optionLabel="name"
                            placeholder="Selecione um produto"
                            filter
                            showClear
                            disabled={loading}
                            itemTemplate={productTemplate}
                            valueTemplate={selectedProductTemplate}
                            filterBy="code,name,model"
                            className="w-full"
                            panelStyle={getPanelStyle()}
                            virtualScrollerOptions={{
                                itemSize: isMobile ? 60 : 80,
                                style: { maxHeight: isMobile ? '200px' : '300px' }
                            }}
                        />
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="field">
                        <label htmlFor="quantity" className="text-sm font-semibold">Qtd</label>
                        <InputNumber
                            id="quantity"
                            value={quantity}
                            onValueChange={(e) => handleQuantityChange(e)}
                            min={1}
                            max={selectedProduct ? selectedProduct.quantity : 999}
                            disabled={!selectedProduct || loading}
                            className="w-full"
                            showButtons
                            buttonLayout="horizontal"
                            incrementButtonIcon="pi pi-plus"
                            decrementButtonIcon="pi pi-minus"
                        />
                        {quantityError && (
                            <small className="p-error block mt-1">{quantityError}</small>
                        )}
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="field pt-4">
                        <Button
                            label={isMobile ? "Adicionar" : "Adicionar ao Pedido"}
                            icon="pi pi-shopping-cart"
                            onClick={onAddProduct}
                            disabled={!selectedProduct || loading || quantityError !== '' || quantity > (selectedProduct?.quantity || 0)}
                            className="w-full"
                            size="small"
                        />
                    </div>
                </div>
            </div>

            {selectedProduct && (
                <div className="mt-3 p-3 surface-50 border-round text-sm">
                    <div className="flex align-items-center">
                        {selectedProduct.image && (
                            <Image
                                src={selectedProduct.image}
                                alt={selectedProduct.name}
                                width={isMobile ? "48" : "60"}
                                height={isMobile ? "48" : "60"}
                                className="mr-3 border-round"
                                imageStyle={{ objectFit: 'cover' }}
                            />
                        )}
                        <div className="flex-1">
                            <div className="font-semibold text-sm md:text-base">
                                {selectedProduct.code} - {selectedProduct.name}
                            </div>
                            <div className="text-xs md:text-sm">Modelo: {selectedProduct.model}</div>
                            <div className="text-xs md:text-sm">Preço: R$ {selectedProduct.saleValue.toFixed(2)}</div>
                            <div className="text-xs md:text-sm">Estoque disponível: {selectedProduct.quantity}</div>
                            {quantityError && (
                                <div className="text-red-500 font-semibold mt-2 text-xs md:text-sm">
                                    ⚠️ {quantityError}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}