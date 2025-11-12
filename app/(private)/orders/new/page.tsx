// app/orders/new/page.tsx
'use client';
import { Toast } from "primereact/toast";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { ClientDialog } from "../../clients/components/ClientsTable/ClientDialog";
import { Product, OrderItem } from "../types";
import ClientSection from "../components/ClientSection/ClientSection";
import ProductSelection from "../components/ProductSection/ProductSection";
import OrderItemsTable from "../components/OrderItemsTable/OrderItemsTable";
import OrderSummary from "../components/OrderSummary/OrderSummary";
import NotesSection from "../components/NotesSection/NotesSection";
import { fetchClientsProducts } from "../services/fetchClientsProducts";
import { Client } from "../../clients/types";
import { Toolbar } from "primereact/toolbar";
import DiscountSection from "./DiscountSection";
import PaymentMethodSection, { PaymentMethod } from "../components/PaymentMethodSection/PaymentMethodSection";


const emptyClient: Client = {
    id: '',
    name: '',
    email: '',
    cpf: '',
    phoneNumber: '',
    birthDate: '',
    gender: '',
    rg: '',
    address: [{
        id: 0,
        cep: '',
        country: '',
        state: '',
        city: '',
        district: '',
        street: '',
        complement: '',
        userId: null,
        clientId: ''
    }]
}

export default function NewOrderPage() {
    const router = useRouter();
    const toast = useRef<Toast>(null);
    const [clients, setClients] = useState<Client[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [notes, setNotes] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [clientDialog, setClientDialog] = useState<boolean>(false);
    const [newClient, setNewClient] = useState<Client>(emptyClient);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [discount, setDiscount] = useState<number>(0); // Agora é valor em reais
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Dinheiro');

    
    useEffect(() => {
        fetchClientsProducts({
            setLoading,
            setClients,
            setProducts,
            showToast
        });
    }, []);

    const showToast = (severity: 'success' | 'error' | 'warn' | 'info', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const addProductToOrder = () => {
    if (!selectedProduct) {
        showToast('warn', 'Aviso', 'Selecione um produto');
        return;
    }

    if (quantity <= 0) {
        showToast('warn', 'Aviso', 'Quantidade deve ser maior que zero');
        return;
    }

    if (quantity > selectedProduct.quantity) {
        showToast('error', 'Erro', `Estoque insuficiente. Disponível: ${selectedProduct.quantity}`);
        return;
    }

    const existingItemIndex = orderItems.findIndex(item => item.productId === selectedProduct.id);

    if (existingItemIndex > -1) {
        const updatedItems = [...orderItems];
        const newTotalQuantity = updatedItems[existingItemIndex].quantity + quantity;
        
        // Verifica se a soma não excede o estoque
        if (newTotalQuantity > selectedProduct.quantity) {
            showToast('error', 'Erro', `Quantidade total excede o estoque disponível. Disponível: ${selectedProduct.quantity}`);
            return;
        }
        
        updatedItems[existingItemIndex].quantity = newTotalQuantity;
        setOrderItems(updatedItems);
        showToast('success', 'Sucesso', `Quantidade de ${selectedProduct.name} atualizada`);
    } else {
        const newItem: OrderItem = {
            productId: selectedProduct.id,
            quantity: quantity,
            price: selectedProduct.saleValue,
            product: {
                id: selectedProduct.id,
                code: selectedProduct.code,
                name: selectedProduct.name,
                model: selectedProduct.model,
                saleValue: selectedProduct.saleValue,
                quantity: selectedProduct.quantity,
                image: selectedProduct.image
            }
        };
        setOrderItems([...orderItems, newItem]);
        showToast('success', 'Sucesso', `${selectedProduct.name} adicionado ao registro`);
    }

    setSelectedProduct(null);
    setQuantity(1);
};

    const removeProduct = (productId: number) => {
        const product = orderItems.find(item => item.productId === productId)?.product;
        setOrderItems(orderItems.filter(item => item.productId !== productId));
        if (product) {
            showToast('info', 'Removido', `${product.name} removido do registro`);
        }
    };

    const calculateSubtotal = () => {
        return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        return subtotal - discount; // Agora desconto é direto em reais
    };

    const createOrder = async () => {
        if (!selectedClient) {
            showToast('error', 'Erro', 'Selecione um cliente');
            return;
        }

        if (orderItems.length === 0) {
            showToast('error', 'Erro', 'Adicione pelo menos um produto ao registro');
            return;
        }

        const subtotal = calculateSubtotal();
        if (discount > subtotal) {
            showToast('error', 'Erro', 'Desconto não pode ser maior que o subtotal');
            return;
        }

        try {
            setLoading(true);

            const orderData = {
                clientId: selectedClient.id,
                notes: notes,
                discount: discount, 
                paymentMethod: paymentMethod,// Agora envia valor em reais
                orderItems: orderItems.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                }))
            };

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });

            if (response.ok) {
                showToast('success', 'Sucesso', 'Registro criado com sucesso!');
                router.push('/orders');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha ao criar registro');
            }

        } catch (error) {
            console.error("Erro ao criar registro:", error);
            showToast('error', 'Erro', error instanceof Error ? error.message : 'Falha ao criar registro');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClient = async () => {
        try {
            const response = await fetch('/api/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(
                    { ...newClient, address: newClient.address[0] }
                ),
            });

            if (response.status === 401) {
                window.location.href = '/login';
                throw new Error('Não autorizado - redirecionando para login');
            }

            if (response.ok) {
                showToast('success', 'Sucesso', 'Cliente criado com sucesso!');
                setClientDialog(false);
                setNewClient(emptyClient);
                await fetchClientsProducts({
                    setLoading,
                    setClients,
                    setProducts,
                    showToast
                });
            } else {
                const data = await response.json();
                const errorMsg = data?.error || 'Falha ao criar cliente';
                showToast('error', 'Erro', errorMsg);
                throw new Error(errorMsg);
            }
        } catch (error) {
            console.error("Erro ao criar cliente:", error);
        }
    };

    const handleCancel = () => {
        router.push('/orders');
    };

    const isValidOrder = !!selectedClient && orderItems.length > 0;

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card p-4">
                    <Toast ref={toast} position="top-right" />

                    <Toolbar 
                        className="border-bottom-1 surface-border px-3 py-2 mb-4" 
                        left={<h3 className="m-0 text-md">Registrar nova venda</h3>}
                        right={<Button
                            label="Cancelar"
                            icon="pi pi-times"
                            onClick={handleCancel}
                            className="p-button-outlined p-button-secondary"
                        />}
                    />

                    <div className="grid">
                        <div className="col-12 lg:col-8">
                            <ClientSection
                                clients={clients}
                                selectedClient={selectedClient}
                                onClientChange={setSelectedClient}
                                onNewClient={() => setClientDialog(true)}
                                loading={loading}
                            />

                            <ProductSelection
                                products={products}
                                selectedProduct={selectedProduct}
                                quantity={quantity}
                                onProductChange={setSelectedProduct}
                                onQuantityChange={setQuantity}
                                onAddProduct={addProductToOrder}
                                loading={loading}
                            />

                            <OrderItemsTable
                                orderItems={orderItems}
                                onRemoveItem={removeProduct}
                                total={calculateTotal()}
                            />
                        </div>

                        <div className="col-12 lg:col-4">
                            <NotesSection
                                notes={notes}
                                onNotesChange={setNotes}
                                loading={loading}
                            />

                            <PaymentMethodSection
                                paymentMethod={paymentMethod}
                                onPaymentMethodChange={setPaymentMethod}
                                loading={loading}
                            />

                            <DiscountSection
                                discount={discount}
                                onDiscountChange={setDiscount}
                                subtotal={calculateSubtotal()}
                                loading={loading}
                            />

                            <div className="sticky-top" style={{ top: '1rem' }}>
                                <OrderSummary
                                    onCreateOrder={createOrder}
                                    isValid={isValidOrder}
                                    loading={loading}
                                    subtotal={calculateSubtotal()}
                                    discount={discount}
                                    total={calculateTotal()}
                                    paymentMethod={paymentMethod}
                                />
                            </div>
                        </div>
                    </div>

                    <ClientDialog
                        open={clientDialog}
                        onClose={() => setClientDialog(false)}
                        client={newClient}
                        setClient={setNewClient}
                        submitted={submitted}
                        handleClient={handleCreateClient}
                        typeEdit={false}
                    />
                </div>
            </div>
        </div>
    );
}