// app/orders/components/OrderItemsTable/OrderItemsTable.tsx
'use client';
import { Button } from "primereact/button";
import { Image } from "primereact/image";
import { OrderItem } from "../../types";
import { Card } from "primereact/card";
import './styles.css'

interface OrderItemsTableProps {
    orderItems: OrderItem[];
    onRemoveItem: (productId: number) => void;
    total: number;
}

export default function OrderItemsTable({
    orderItems,
    onRemoveItem,
    total
}: OrderItemsTableProps) {
    if (orderItems.length === 0) {
        return (
            <div className="mb-3 text-center py-4 border-2 border-dashed border-300 border-round">
                <i className="pi pi-shopping-cart text-4xl text-400 mb-2" />
                <p className="text-500 m-0">Nenhum produto adicionado ao carrinho</p>
            </div>
        );
    }

    return (
        <div className="mb-3 mt-3">
            
            {/* Desktop Table (hidden on mobile) */}
            <div className="hidden md:block">
                <div className="grid mb-2 font-semibold text-sm text-600">
                    <div className="col-2">Imagem</div>
                    <div className="col-3">Produto</div>
                    <div className="col-2">Modelo</div>
                    <div className="col-1 text-center">Qtd</div>
                    <div className="col-2 text-right">Preço</div>
                    <div className="col-2 text-right">Subtotal</div>
                </div>
                
                {orderItems.map((item, index) => (
                    <div key={item.productId} className="grid align-items-center py-2 border-bottom-1 surface-border">
                        <div className="col-2">
                            {item.product?.image ? (
                                <Image 
                                    src={item.product.image} 
                                    alt={item.product.name}
                                    width="45"
                                    height="45"
                                    className="border-round"
                                    imageStyle={{ objectFit: 'cover' }}
                                />
                            ) : (
                                <i className="pi pi-image text-2xl text-400" />
                            )}
                        </div>
                        <div className="col-3">
                            <div className="font-semibold text-sm">{item.product?.code}</div>
                            <div className="text-xs text-500">{item.product?.name}</div>
                        </div>
                        <div className="col-2 text-sm">{item.product?.model}</div>
                        <div className="col-1 text-center font-semibold">{item.quantity}</div>
                        <div className="col-2 text-right font-semibold">
                            R$ {item.price.toFixed(2)}
                        </div>
                        <div className="col-2 text-right">
                            <div className="font-bold ">
                                R$ {(item.price * item.quantity).toFixed(2)}
                            </div>
                            <Button
                                icon="pi pi-trash"
                                className="p-button-danger p-button-text p-button-sm mt-1"
                                onClick={() => onRemoveItem(item.productId)}
                                tooltip="Remover produto"
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Mobile Cards (visible only on mobile) */}
            <div className="block md:hidden">
                {orderItems.map((item, index) => (
                    <Card key={item.productId} className="mb-2">
                        <div className="flex align-items-start">
                            {/* Imagem do produto */}
                            <div className="mr-3">
                                {item.product?.image ? (
                                    <Image 
                                        src={item.product.image} 
                                        alt={item.product.name}
                                        width="50"
                                        height="50"
                                        className="border-round"
                                        imageStyle={{ objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div className="border-round bg-surface-100 p-2">
                                        <i className="pi pi-image text-2xl text-400" />
                                    </div>
                                )}
                            </div>

                            {/* Informações do produto */}
                            <div className="flex-1">
                                <div className="font-semibold text-sm mb-1">
                                    {item.product?.code} - {item.product?.name}
                                </div>
                                <div className="text-xs text-500 mb-2">
                                    Modelo: {item.product?.model}
                                </div>
                                
                                <div className="grid text-sm">
                                    <div className="col-6">
                                        <span className="text-600">Qtd:</span>
                                        <span className="font-semibold ml-1">{item.quantity}</span>
                                    </div>
                                    <div className="col-6">
                                        <span className="text-600">Preço:</span>
                                        <span className="font-semibold ml-1">R$ {item.price.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="flex justify-content-between align-items-center mt-2">
                                    <span className="font-bold text-blue-600">
                                        R$ {(item.price * item.quantity).toFixed(2)}
                                    </span>
                                    <Button
                                        icon="pi pi-trash"
                                        className="p-button-danger p-button-text p-button-sm"
                                        onClick={() => onRemoveItem(item.productId)}
                                        tooltip="Remover produto"
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Resumo do venda */}
            <div className="mt-4 p-3 surface-50 border-round">
                <div className="grid">
                    <div className="col-6 md:col-8 text-sm">
                        <div className="font-semibold">Total de itens: {orderItems.length}</div>
                        <div>Quantidade total: {orderItems.reduce((sum, item) => sum + item.quantity, 0)}</div>
                    </div>
                    <div className="col-6 md:col-4 text-right">
                        <div className="text-xl font-bold text-blue-600">
                            R$ {total.toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}