import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { Order } from "../../types";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { useMediaQuery } from "react-responsive";

interface DetailOrderProps {
    visible: boolean;
    selectedOrder: Order | null;
    hideOrderDetails: () => void;
}

export default function DetailOrder({
    visible,
    selectedOrder,
    hideOrderDetails
}: DetailOrderProps) {
    const isMobile = useMediaQuery({ maxWidth: 768 });

    const orderModalFooter = (
        <div className="flex justify-content-end">
            <Button
                label="Fechar"
                icon="pi pi-times"
                onClick={hideOrderDetails}
                className="p-button-text"
            />
        </div>
    );

    const hasDiscount = selectedOrder?.discount && selectedOrder.discount > 0;

    // Função para obter o label da forma de pagamento
    const getPaymentMethodLabel = (method: string) => {
        const labels: { [key: string]: string } = {
            'Pix': 'Pix',
            'Credito': 'Cartão de Crédito',
            'Debito': 'Cartão de Débito',
            'Dinheiro': 'Dinheiro'
        };
        return labels[method] || method;
    };

    // Função para obter a severidade da tag
    const getPaymentMethodSeverity = (method: string) => {
        const severities: { [key: string]: any } = {
            'Pix': 'success',
            'Credito': 'warning',
            'Debito': 'info',
            'Dinheiro': 'help'
        };
        return severities[method] || 'info';
    };

    // Layout mobile simplificado
    const renderMobileView = () => (
        <div className="flex flex-column gap-3">
            {/* Header mobile */}
            <div className="flex align-items-center justify-content-between">
                <div>
                    <h3 className="m-0 text-lg">Venda #{selectedOrder?.id}</h3>
                    <span className="text-sm text-500">
                        {selectedOrder && new Date(selectedOrder.purchaseDate).toLocaleDateString('pt-BR')}
                    </span>
                </div>
                <div className="flex flex-column align-items-end gap-1">
                    <Tag
                        value={`${selectedOrder?.orderItems.length} itens`}
                        severity="info"
                    />
                    {selectedOrder?.paymentMethod && (
                        <Tag
                            value={getPaymentMethodLabel(selectedOrder.paymentMethod)}
                            severity={getPaymentMethodSeverity(selectedOrder.paymentMethod)}
                            className="text-xs"
                        />
                    )}
                </div>
            </div>

            <Divider className="my-2" />

            {/* Informações do Cliente */}
            <Card className="shadow-1">
                <div className="flex align-items-center mb-2">
                    <i className="pi pi-user mr-2 text-primary"></i>
                    <h4 className="m-0 text-base">Cliente</h4>
                </div>
                <div className="grid">
                    <div className="col-12 mb-2">
                        <strong>Nome:</strong> {selectedOrder?.client.name}
                    </div>
                    <div className="col-12">
                        <strong>Email:</strong> {selectedOrder?.client.email || 'Não informado'}
                    </div>
                </div>
            </Card>

            {/* Informações do Vendedor */}
            <Card className="shadow-1">
                <div className="flex align-items-center mb-2">
                    <i className="pi pi-id-card mr-2 text-primary"></i>
                    <h4 className="m-0 text-base">Vendedor</h4>
                </div>
                <div className="grid">
                    <div className="col-12 mb-2">
                        <strong>Nome:</strong> {selectedOrder?.user.name}
                    </div>
                    <div className="col-12">
                        <strong>Email:</strong> {selectedOrder?.user.email}
                    </div>
                </div>
            </Card>

            {/* Forma de Pagamento */}
            <Card className="shadow-1">
                <div className="flex align-items-center mb-2">
                    <i className="pi pi-credit-card mr-2 text-primary"></i>
                    <h4 className="m-0 text-base">Forma de Pagamento</h4>
                </div>
                <div className="flex align-items-center gap-2">
                    <Tag
                        value={selectedOrder?.paymentMethod ? getPaymentMethodLabel(selectedOrder.paymentMethod) : 'Não informado'}
                        severity={selectedOrder?.paymentMethod ? getPaymentMethodSeverity(selectedOrder.paymentMethod) : 'info'}
                        icon="pi pi-tag"
                    />
                </div>
            </Card>

            {/* Itens da Venda */}
            <Card className="shadow-1">
                <div className="flex align-items-center mb-3">
                    <i className="pi pi-shopping-cart mr-2 text-primary"></i>
                    <h4 className="m-0 text-base">Itens da Venda</h4>
                </div>

                {selectedOrder?.orderItems.map((item, index) => (
                    item.product.status === 1 ? (
                        <div key={item.id} className="mb-3 pb-2 border-bottom-1 surface-border">
                            <div className="flex justify-content-between align-items-start mb-1">
                                <strong className="text-sm">{item.product.name}</strong>
                                <span className="font-bold text-blue-600 text-sm">
                                    R$ {item.price.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-content-between text-xs text-500">
                                <span>Cód: {item.product.code}</span>
                                <span>Qntd: {item.quantity}</span>
                            </div>
                            <div className="flex justify-content-between text-xs mt-1">
                                <span>Subtotal:</span>
                                <span className="font-semibold">
                                    R$ {(item.price * item.quantity).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div key={item.id} className="mb-3 pb-2 border-bottom-1 surface-border">
                            <div className="flex justify-content-between align-items-start mb-1 text-red-600">
                                <strong className="text-sm">{item.product.name}</strong>
                                <span className="font-bold text-red-600 text-sm">
                                    R$ {item.price.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-content-between text-xs text-red-500">
                                <span>Cód: {item.product.code}</span>
                                <span>Qntd: {item.quantity}</span>
                            </div>
                            <div className="flex justify-content-between text-xs mt-1 text-red-600">
                                <span>Subtotal:</span>
                                <span className="font-semibold">
                                    R$ {(item.price * item.quantity).toFixed(2)}
                                </span>
                            </div>
                            <span className="block mt-1 text-xs text-red-500 font-semibold">
                                Produto foi deletado da base pelo administrador!
                            </span>
                        </div>
                    )
                ))}

                <Divider className="my-2" />

                {/* RESUMO DE VALORES */}
                <div className="space-y-2">
                    <div className="flex justify-content-between text-sm">
                        <span>Subtotal:</span>
                        <span>R$ {selectedOrder?.subtotal?.toFixed(2)}</span>
                    </div>

                    {hasDiscount && (
                        <div className="flex justify-content-between text-sm text-red-500">
                            <span>Desconto:</span>
                            <span>- R$ {selectedOrder?.discount?.toFixed(2)}</span>
                        </div>
                    )}

                    <div className="flex justify-content-between align-items-center font-bold text-lg">
                        <span>Total Final:</span>
                        <span className="text-blue-600">
                            R$ {selectedOrder?.total?.toFixed(2)}
                        </span>
                    </div>
                </div>
            </Card>

            {/* Observações */}
            {selectedOrder?.notes && (
                <Card className="shadow-1">
                    <div className="flex align-items-center mb-2">
                        <i className="pi pi-comment mr-2 text-primary"></i>
                        <h4 className="m-0 text-base">Observações</h4>
                    </div>
                    <p className="m-0 text-sm">{selectedOrder.notes}</p>
                </Card>
            )}
        </div>
    );

    // Layout desktop
    const renderDesktopView = () => (
        <div className="grid">
            <div className="col-12 md:col-4">
                <Card title="Informações do Cliente" className="h-full">
                    <div className="grid">
                        <div className="col-12 mb-2">
                            <strong>Nome:</strong> {selectedOrder?.client.name}
                        </div>
                        <div className="col-12 mb-2">
                            <strong>Email:</strong> {selectedOrder?.client.email || 'Não informado'}
                        </div>
                        <div className="col-12">
                            <strong>Data da Venda:</strong> {selectedOrder && new Date(selectedOrder.purchaseDate).toLocaleDateString('pt-BR')}
                        </div>
                    </div>
                </Card>
            </div>

            <div className="col-12 md:col-4">
                <Card title="Informações do Vendedor" className="h-full">
                    <div className="grid">
                        <div className="col-12 mb-2">
                            <strong>Nome:</strong> {selectedOrder?.user.name}
                        </div>
                        <div className="col-12">
                            <strong>Email:</strong> {selectedOrder?.user.email}
                        </div>
                    </div>
                </Card>
            </div>

            <div className="col-12 md:col-4">
                <Card title="Forma de Pagamento" className="h-full">
                    <div className="flex flex-column align-items-center justify-content-center h-full">
                        <i className="pi pi-credit-card text-4xl text-primary mb-3"></i>
                        <Tag
                            value={selectedOrder?.paymentMethod ? getPaymentMethodLabel(selectedOrder.paymentMethod) : 'Não informado'}
                            severity={selectedOrder?.paymentMethod ? getPaymentMethodSeverity(selectedOrder.paymentMethod) : 'info'}
                            className="text-lg py-2 px-3"
                        />
                    </div>
                </Card>
            </div>

            <div className="col-12">
                <Card title="Itens da Venda">
                    <div className="grid font-bold mb-2">
                        <div className="col-5">Produto</div>
                        <div className="col-2 text-center">Código</div>
                        <div className="col-2 text-center">Qntd.</div>
                        <div className="col-3 text-right">Preço Unitário</div>
                    </div>

                    <Divider />

                    {selectedOrder?.orderItems.map((item, index) => (
                        item.product.status === 1 ? (
                            <div key={item.id} className="grid mb-2">
                                <div className="col-5">{item.product.name}</div>
                                <div className="col-2 text-center">{item.product.code}</div>
                                <div className="col-2 text-center">{item.quantity}</div>
                                <div className="col-3 text-right">
                                    R$ {item.price.toFixed(2)}
                                </div>
                            </div>
                        ) : (
                            <div key={item.id} className="grid mb-2 text-red-600">
                                <div className="col-5">
                                    {item.product.name} 
                                    <span className="text-xs text-red-500 font-semibold ml-2">
                                        (Produto deletado!)
                                    </span>
                                </div>
                                <div className="col-2 text-center">{item.product.code}</div>
                                <div className="col-2 text-center">{item.quantity}</div>
                                <div className="col-3 text-right">
                                    R$ {item.price.toFixed(2)}
                                </div>
                            </div>
                        )
                    ))}

                    <Divider />

                    {/* RESUMO DE VALORES */}
                    <div className="space-y-2">
                        <div className="grid text-sm">
                            <div className="col-9 text-right">Subtotal:</div>
                            <div className="col-3 text-right">
                                R$ {selectedOrder?.subtotal?.toFixed(2)}
                            </div>
                        </div>

                        {hasDiscount && (
                            <div className="grid text-sm text-red-500">
                                <div className="col-9 text-right">Desconto:</div>
                                <div className="col-3 text-right">
                                    - R$ {selectedOrder?.discount?.toFixed(2)}
                                </div>
                            </div>
                        )}

                        <div className="grid font-bold text-lg border-top-1 pt-2">
                            <div className="col-9 text-right">Total Final:</div>
                            <div className="col-3 text-right text-blue-600">
                                R$ {selectedOrder?.total?.toFixed(2)}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {selectedOrder?.notes && (
                <div className="col-12">
                    <Card title="Observações">
                        <p className="m-0">{selectedOrder.notes}</p>
                    </Card>
                </div>
            )}
        </div>
    );

    return (
        <Dialog
            header={
                <div className="flex align-items-center gap-2">
                    <i className="pi pi-shopping-bag mr-2"></i>
                    <span>Detalhes da Venda #{selectedOrder?.id}</span>
                    {selectedOrder?.paymentMethod && (
                        <Tag
                            value={getPaymentMethodLabel(selectedOrder.paymentMethod)}
                            severity={getPaymentMethodSeverity(selectedOrder.paymentMethod)}
                            className="ml-2"
                        />
                    )}
                </div>
            }
            visible={visible}
            style={{ width: isMobile ? '95vw' : '90vw', maxWidth: '900px' }}
            footer={orderModalFooter}
            onHide={hideOrderDetails}
            className="p-fluid"
            breakpoints={{ '960px': '75vw', '641px': '95vw' }}
        >
            {selectedOrder && (
                <div className={isMobile ? "p-2" : "p-3"}>
                    {isMobile ? renderMobileView() : renderDesktopView()}
                </div>
            )}
        </Dialog>
    );
}