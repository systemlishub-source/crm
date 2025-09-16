import { Dialog } from "primereact/dialog";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Product } from "../page";
import { classNames } from "primereact/utils";
import { Divider } from "primereact/divider";
import { Tag } from "primereact/tag";
import { Badge } from "primereact/badge";
import { useState, useEffect } from "react";

interface EntryDialogProps {
    entryDialog: boolean,
    product: Product,
    submitted: boolean,
    setProduct: React.Dispatch<React.SetStateAction<Product>>,
    entryDialogFooter: React.ReactNode
    hideDialog: () => void,
    quantityToAdd: number,
    setQuantityToAdd: React.Dispatch<React.SetStateAction<number>>,
}

const EntryDialog = (
    { product, setProduct, entryDialog, submitted, entryDialogFooter, hideDialog, quantityToAdd, setQuantityToAdd }: EntryDialogProps
) => {
    const [currentStock, setCurrentStock] = useState<number>(0);

    // Quando o produto ou dialog mudar, atualiza o estoque atual
    useEffect(() => {
        if (entryDialog && product) {
            setCurrentStock(product.quantity || 0);
            setQuantityToAdd(0); // Reseta para zero sempre que abrir o dialog
        }
    }, [entryDialog, product]);

    const onInputNumberChange = (e: InputNumberValueChangeEvent) => {
        const val = e.value || 0;
        setQuantityToAdd(val);
    }

    // Função para formatar valores monetários
    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    };

    // Função para calcular o valor total do investimento
    const calculateInvestmentValue = () => {
        return quantityToAdd * product.purchaseValue;
    };

    // Função para calcular o novo total em estoque
    const calculateNewStock = () => {
        return currentStock + quantityToAdd;
    };

    return (
        <Dialog
            header={
                <div className="flex align-items-center gap-2">
                    <i className="pi pi-box" style={{ fontSize: '1.5rem' }}></i>
                    <span>Adicionar ao Estoque</span>
                </div>
            }
            visible={entryDialog}
            style={{ width: '700px' }}
            breakpoints={{ '960px': '75vw', '641px': '90vw' }}
            modal
            onHide={hideDialog}
            footer={entryDialogFooter}
            className="entry-dialog"
        >
            <div className="grid">
                {/* Informações do produto */}
                <div className="col-12 md:col-6">
                    <div className="text-xl font-bold mb-2">{product.name}</div>
                    <div className="text-color-secondary mb-3">{product.description}</div>
                    
                    <div className="grid">
                        <div className="col-6">
                            <div className="field">
                                <label className="font-medium block mb-1">Código</label>
                                <div className="text-color-secondary">{product.code}</div>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="field">
                                <label className="font-medium block mb-1">Modelo</label>
                                <div className="text-color-secondary">{product.model}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid mt-2">
                        <div className="col-6">
                            <div className="field">
                                <label className="font-medium block mb-1">Tipo</label>
                                <Tag value={product.type} severity="info" className="mr-2" />
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="field">
                                <label className="font-medium block mb-1">Fornecedor</label>
                                <div className="text-color-secondary">{product.supplier}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid mt-2">
                        <div className="col-4">
                            <div className="field">
                                <label className="font-medium block mb-1">Cor</label>
                                <div className="flex align-items-center">
                                    <div 
                                        className="border-circle w-1rem h-1rem mr-2" 
                                        style={{ backgroundColor: product.color || '#ccc' }}
                                    ></div>
                                    <span className="text-color-secondary">{product.color}</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="field">
                                <label className="font-medium block mb-1">Tamanho</label>
                                <div className="text-color-secondary">{`${product.size} (${product.sizeNumber})`}</div>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="field">
                                <label className="font-medium block mb-1">Material</label>
                                <div className="text-color-secondary">{product.material}</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Imagem do produto e informações financeiras */}
                <div className="col-12 md:col-6">
                    <div className="flex justify-content-center mb-3">
                        {product.image ? (
                            <img 
                                src={product.image} 
                                alt={product.name} 
                                className="border-round" 
                                style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                            />
                        ) : (
                            <div className="border-round flex align-items-center justify-content-center bg-gray-100" 
                                 style={{ width: '200px', height: '200px' }}>
                                <i className="pi pi-image" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                            </div>
                        )}
                    </div>
                    
                    <div className="surface-100 p-3 border-round">
                        <div className="grid">
                            <div className="col-6">
                                <div className="text-sm font-medium">Valor de Compra</div>
                                <div className="text-lg font-bold">{formatCurrency(product.purchaseValue)}</div>
                            </div>
                            <div className="col-6">
                                <div className="text-sm font-medium">Valor de Venda</div>
                                <div className="text-lg font-bold text-green-500">{formatCurrency(product.saleValue)}</div>
                            </div>
                        </div>
                        
                        <div className="grid mt-2">
                            <div className="col-6">
                                <div className="text-sm font-medium">Margem</div>
                                <div className="text-lg font-bold">{product.margin}%</div>
                            </div>
                            <div className="col-6">
                                <div className="text-sm font-medium">Estoque Atual</div>
                                <div className="text-lg font-bold">
                                    {currentStock}
                                    {currentStock <= 5 && (
                                        <Badge value="Baixo" severity="danger" className="ml-2"></Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <Divider />
            
            <div className="field">
                <label htmlFor="quantityToAdd" className="font-bold block mb-2">
                    Quantidade a Adicionar
                </label>
                <InputNumber
                    id="quantityToAdd"
                    value={quantityToAdd}
                    onValueChange={onInputNumberChange}
                    mode="decimal"
                    min={0}
                    max={10000}
                    required
                    className={classNames('w-full', {
                        'p-invalid': submitted && quantityToAdd < 0
                    })}
                    inputClassName="w-full"
                    showButtons
                    buttonLayout="horizontal"
                    decrementButtonClassName="p-button-danger"
                    incrementButtonClassName="p-button-success"
                    incrementButtonIcon="pi pi-plus"
                    decrementButtonIcon="pi pi-minus"
                    placeholder="0"
                />
                {submitted && quantityToAdd < 0 && (
                    <small className="p-error block mt-1">Quantidade não pode ser negativa.</small>
                )}
                
                <div className="grid mt-3">
                    <div className="col-4">
                        <div className="text-color-secondary">Quantidade a adicionar:</div>
                        <div className="font-bold">{quantityToAdd} unidades</div>
                    </div>
                    <div className="col-4">
                        <div className="text-color-secondary">Estoque atual:</div>
                        <div className="font-bold">{currentStock} unidades</div>
                    </div>
                    <div className="col-4">
                        <div className="text-color-secondary">Novo total em estoque:</div>
                        <div className="font-bold text-blue-500">{calculateNewStock()} unidades</div>
                    </div>
                </div>
                
            </div>
        </Dialog>
    );
}

export default EntryDialog;