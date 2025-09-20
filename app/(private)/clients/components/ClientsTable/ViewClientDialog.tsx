'use client';
import { Dialog } from "primereact/dialog";
import { Avatar } from "primereact/avatar";
import { Divider } from "primereact/divider";
import { Tag } from "primereact/tag";
import { Client } from "../../types";
import { useEffect, useState } from "react";

interface ViewClientDialogProps {
    client: Client | null;
    visible: boolean;
    onHide: () => void;
}

interface SpendingData {
    totalSpent: number;
    averageTicket: number;
    totalOrders: number;
    totalItems: number;
}

const ViewClientDialog = ({ client, visible, onHide }: ViewClientDialogProps) => {
    const [spendingData, setSpendingData] = useState<SpendingData>({
        totalSpent: 0,
        averageTicket: 0,
        totalOrders: 0,
        totalItems: 0
    });

    useEffect(() => {
        if (client && client.orders) {
            calculateSpendingData(client.orders);
        }
    }, [client]);

    const calculateSpendingData = (orders: any[]) => {
        let totalSpent = 0;
        let totalItems = 0;
        const totalOrders = orders.length;

        // Calcular o total gasto e total de itens
        orders.forEach(order => {
            if (order.orderItems && Array.isArray(order.orderItems)) {
                order.orderItems.forEach((item: any) => {
                    const price = Number(item.price) || 0;
                    const quantity = Number(item.quantity) || 0;
                    totalSpent += price * quantity;
                    totalItems += quantity;
                });
            }
        });

        // Calcular o ticket médio
        const averageTicket = totalOrders > 0 ? totalSpent / totalOrders : 0;

        setSpendingData({
            totalSpent,
            averageTicket,
            totalOrders,
            totalItems
        });
    };

    if (!client) return null;

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const calculateAge = (birthDate: string) => {
        try {
            const today = new Date();
            const birth = new Date(birthDate);
            let age = today.getFullYear() - birth.getFullYear();
            const m = today.getMonth() - birth.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
                age--;
            }
            return age;
        } catch {
            return 0;
        }
    };

    const getDaysUntilBirthday = (birthDate: string) => {
        try {
            const today = new Date();
            const birth = new Date(birthDate);
            birth.setFullYear(today.getFullYear());
            
            if (birth < today) {
                birth.setFullYear(today.getFullYear() + 1);
            }
            
            const diffTime = Math.abs(birth.getTime() - today.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        } catch {
            return 0;
        }
    };

    const formatPhone = (phone: string) => {
        // Remove caracteres não numéricos
        const cleaned = phone.replace(/\D/g, '');
        
        // Formatação para diferentes tamanhos de telefone
        if (cleaned.length === 11) {
            return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (cleaned.length === 10) {
            return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return phone;
    };

    const formatCPF = (cpf: string) => {
        if (!cpf) return 'Não informado';
        const cleaned = cpf.replace(/\D/g, '');
        if (cleaned.length === 11) {
            return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }
        return cpf;
    };

    const formatRG = (rg: string) => {
        if (!rg) return 'Não informado';
        return rg;
    };

    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const footerContent = (
        <div className="flex justify-content-end gap-2">
            <button
                className="p-button p-component p-button-outlined p-button-secondary"
                onClick={onHide}
            >
                <span className="p-button-label">Fechar</span>
            </button>
        </div>
    );

    return (
        <Dialog 
            header={
                <div className="flex align-items-center gap-2">
                    <Avatar 
                        label={client.name.charAt(0)} 
                        size="large" 
                        className="bg-primary text-white" 
                        shape="circle"
                    />
                    <span className="text-xl font-semibold">Detalhes do Cliente</span>
                </div>
            }
            visible={visible} 
            style={{ width: '700px', maxWidth: '90vw' }}
            onHide={onHide}
            footer={footerContent}
            className="view-client-dialog"
            breakpoints={{ '960px': '75vw', '641px': '90vw' }}
        >
            <div className="grid p-fluid">
                {/* Informações Pessoais */}
                <div className="col-12">
                    <div className="flex align-items-center justify-content-between mb-3">
                        <h4 className="m-0">Informações Pessoais</h4>
                        <Tag 
                            value={client.gender} 
                            severity="info" 
                            className="text-sm"
                        />
                    </div>
                    
                    <Divider />
                    
                    <div className="grid">
                        <div className="col-6 mb-3">
                            <label className="block text-600 text-sm font-medium mb-1">Nome Completo</label>
                            <div className="text-900 font-semibold">{client.name}</div>
                        </div>
                        
                        <div className="col-6 mb-3">
                            <label className="block text-600 text-sm font-medium mb-1">Data de Nascimento</label>
                            <div className="text-900">
                                {formatDate(client.birthDate)}
                                <Tag 
                                    value={`${calculateAge(client.birthDate)} anos`} 
                                    severity="success" 
                                    className="ml-2 text-xs"
                                />
                            </div>
                        </div>
                        
                        <div className="col-6 mb-3">
                            <label className="block text-600 text-sm font-medium mb-1">CPF</label>
                            <div className="text-900">{formatCPF(client.cpf)}</div>
                        </div>
                        
                        <div className="col-6 mb-3">
                            <label className="block text-600 text-sm font-medium mb-1">RG</label>
                            <div className="text-900">{formatRG(client.rg)}</div>
                        </div>
                        
                        <div className="col-6 mb-3">
                            <label className="block text-600 text-sm font-medium mb-1">E-mail</label>
                            <div className="text-900">
                                <a href={`mailto:${client.email}`} className="text-primary no-underline hover:underline">
                                    {client.email}
                                </a>
                            </div>
                        </div>
                        
                        <div className="col-6 mb-3">
                            <label className="block text-600 text-sm font-medium mb-1">Telefone</label>
                            <div className="text-900">
                                <a href={`tel:${client.phoneNumber}`} className="text-primary no-underline hover:underline">
                                    {formatPhone(client.phoneNumber)}
                                </a>
                            </div>
                        </div>
                        
                        <div className="col-12 mb-3">
                            <label className="block text-600 text-sm font-medium mb-1">Próximo Aniversário</label>
                            <div className="text-900">
                                <Tag 
                                    value={`Faltam ${getDaysUntilBirthday(client.birthDate)} dias`} 
                                    severity="warning" 
                                    icon="pi pi-calendar"
                                    className="text-xs"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Estatísticas de Compras */}
                <div className="col-12 mt-4">
                    <h4 className="m-0 mb-3">Estatísticas de Compras</h4>
                    <Divider />
                    
                    <div className="grid">
                        <div className="col-6 md:col-3 mb-3">
                            <label className="block text-600 text-sm font-medium mb-1">Total de Vendas</label>
                            <div className="text-900 font-bold text-xl">
                                {spendingData.totalOrders}
                                {spendingData.totalOrders > 0 && (
                                    <Tag 
                                        value="Ativo" 
                                        severity="success" 
                                        className="ml-2 text-xs"
                                    />
                                )}
                            </div>
                        </div>
                        
                        <div className="col-6 md:col-3 mb-3">
                            <label className="block text-600 text-sm font-medium mb-1">Itens Comprados</label>
                            <div className="text-900 font-bold text-xl text-blue-500">
                                {spendingData.totalItems}
                            </div>
                        </div>
                        
                        <div className="col-6 md:col-3 mb-3">
                            <label className="block text-600 text-sm font-medium mb-1">Gastos Totais</label>
                            <div className="text-900 font-bold text-xl text-green-500">
                                {formatCurrency(spendingData.totalSpent)}
                            </div>
                        </div>
                        
                        <div className="col-6 md:col-3 mb-3">
                            <label className="block text-600 text-sm font-medium mb-1">Ticket Médio</label>
                            <div className="text-900 font-bold text-xl text-orange-500">
                                {formatCurrency(spendingData.averageTicket)}
                            </div>
                        </div>
                        
                        {spendingData.totalOrders > 0 && (
                            <div className="col-12 mb-3">
                                <div className="text-600 text-sm">
                                    {spendingData.totalOrders} venda(s) • {spendingData.totalItems} item(s) • 
                                    Média de {formatCurrency(spendingData.averageTicket)} por venda
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Endereço */}
                {client.address && client.address.length > 0 && (
                    <div className="col-12 mt-4">
                        <h4 className="m-0 mb-3">Endereço</h4>
                        <Divider />
                        
                        <div className="grid">
                            <div className="col-6 mb-3">
                                <label className="block text-600 text-sm font-medium mb-1">CEP</label>
                                <div className="text-900">{client.address[0].cep}</div>
                            </div>
                            
                            <div className="col-6 mb-3">
                                <label className="block text-600 text-sm font-medium mb-1">País</label>
                                <div className="text-900">{client.address[0].country}</div>
                            </div>
                            
                            <div className="col-6 mb-3">
                                <label className="block text-600 text-sm font-medium mb-1">Estado</label>
                                <div className="text-900">{client.address[0].state}</div>
                            </div>
                            
                            <div className="col-6 mb-3">
                                <label className="block text-600 text-sm font-medium mb-1">Cidade</label>
                                <div className="text-900">{client.address[0].city}</div>
                            </div>
                            
                            <div className="col-6 mb-3">
                                <label className="block text-600 text-sm font-medium mb-1">Bairro</label>
                                <div className="text-900">{client.address[0].district}</div>
                            </div>
                            
                            <div className="col-6 mb-3">
                                <label className="block text-600 text-sm font-medium mb-1">Rua</label>
                                <div className="text-900">{client.address[0].street}</div>
                            </div>
                            
                            {client.address[0].complement && (
                                <div className="col-12 mb-3">
                                    <label className="block text-600 text-sm font-medium mb-1">Complemento</label>
                                    <div className="text-900">{client.address[0].complement}</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Histórico de Vendas */}
                {client.orders && client.orders.length > 0 && (
                    <div className="col-12 mt-4">
                        <h4 className="m-0 mb-3">Últimos Vendas</h4>
                        <Divider />
                        
                        <div className="flex flex-column gap-3">
                            {client.orders.slice(0, 5).map((order: any, index: number) => (
                                <div key={index} className="p-3 border-round surface-100">
                                    <div className="flex justify-content-between align-items-start mb-2">
                                        <span className="font-semibold">Venda #{index + 1}</span>
                                        <span className="text-green-500 font-bold">
                                            {formatCurrency(
                                                order.orderItems.reduce((total: number, item: any) => 
                                                    total + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0
                                                )
                                            )}
                                        </span>
                                    </div>
                                    
                                    <div className="text-sm text-600">
                                        {order.orderItems.map((item: any, itemIndex: number) => (
                                            <div key={itemIndex} className="flex justify-content-between mt-1">
                                                <span>{item.product.name}</span>
                                                <span>
                                                    {item.quantity} × {formatCurrency(Number(item.price) || 0)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            
                            {client.orders.length > 5 && (
                                <div className="text-center text-sm text-600 mt-2">
                                    + {client.orders.length - 5} venda(s) anterior(es)
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Dialog>
    );
};

export default ViewClientDialog;