// app/orders/components/ClientSection/ClientSection.tsx
'use client';
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Client } from "@/app/(private)/clients/types";

interface ClientSectionProps {
    clients: Client[];
    selectedClient: Client | null;
    onClientChange: (client: Client | null) => void;
    onNewClient: () => void;
    loading?: boolean;
}

export default function ClientSection({
    clients,
    selectedClient,
    onClientChange,
    onNewClient,
    loading = false
}: ClientSectionProps) {
    const clientTemplate = (option: Client) => (
        <div className="flex align-items-center">
            <div>
                <div className="text-sm font-semibold">{option.name}</div>
                <div className="text-xs text-500">{option.email} | {option.phoneNumber}</div>
                <div className="text-xs">CPF: {option.cpf}</div>
            </div>
        </div>
    );

    const selectedClientTemplate = (option: Client) => (
        option ? (
            <div className="flex align-items-center">
                <div>
                    <div className="text-sm font-semibold">{option.name}</div>
                    <div className="text-xs">{option.email}</div>
                </div>
            </div>
        ) : (
            <span>Selecione um cliente</span>
        )
    );

    return (
        <Card title="Cliente" className="mb-3">
            <div className="grid">
                <div className="col-12 md:col-9">
                    <div className="field">
                        <label htmlFor="client" className="text-sm font-semibold">Cliente</label>
                        <Dropdown
                            id="client"
                            value={selectedClient}
                            options={clients}
                            onChange={(e) => onClientChange(e.value)}
                            optionLabel="name"
                            placeholder="Selecione um cliente"
                            filter
                            showClear
                            disabled={loading}
                            itemTemplate={clientTemplate}
                            valueTemplate={selectedClientTemplate}
                            filterBy="name,email,cpf,phoneNumber"
                            className="w-full"
                        />
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="field pt-4">
                        <Button
                            label="Novo Cliente"
                            icon="pi pi-user-plus"
                            onClick={onNewClient}
                            className="w-full"
                            size="small"
                            outlined
                        />
                    </div>
                </div>
            </div>

            {selectedClient && (
                <div className="mt-3 p-3 surface-50 border-round text-sm">
                    <div className="grid">
                        <div className="col-6">
                            <div><strong>Nome:</strong> {selectedClient.name}</div>
                            <div><strong>E-mail:</strong> {selectedClient.email}</div>
                        </div>
                        <div className="col-6">
                            <div><strong>Telefone:</strong> {selectedClient.phoneNumber}</div>
                            <div><strong>CPF:</strong> {selectedClient.cpf}</div>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}