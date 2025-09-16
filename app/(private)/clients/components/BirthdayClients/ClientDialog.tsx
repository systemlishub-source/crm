'use client';
import { Dialog } from "primereact/dialog";
import { Avatar } from "primereact/avatar";
import { Client } from "../../types";

interface ClientDialogProps {
    client: Client | null;
    visible: boolean;
    onHide: () => void;
}

export default function ClientDialog({ client, visible, onHide }: ClientDialogProps) {
    if (!client) return null;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }

    const calculateAge = (birthDate: string) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    }

    return (
        <Dialog 
            header={
                <div className="flex align-items-center">
                    <Avatar 
                        label={client.name.charAt(0)} 
                        size="large" 
                        className="bg-primary text-white mr-2" 
                        shape="circle"
                    />
                    <span className="text-lg">Detalhes de {client.name}</span>
                </div>
            } 
            visible={visible} 
            style={{ width: '500px', maxWidth: '90vw' }} 
            onHide={onHide}
            className="text-sm"
        >
            <div style={{ maxHeight: '60vh', overflowY: 'auto' }} className="pr-2">
                <div className="grid">
                    <div className="col-12">
                        <h5 className="text-base mb-3 border-bottom-1 surface-border pb-2">Informações Pessoais</h5>
                        
                        <div className="grid text-sm">
                            <div className="col-6 mb-2">
                                <strong>Email:</strong>
                                <div className="text-600">{client.email}</div>
                            </div>
                            <div className="col-6 mb-2">
                                <strong>Telefone:</strong>
                                <div className="text-600">{client.phoneNumber}</div>
                            </div>
                            <div className="col-6 mb-2">
                                <strong>CPF:</strong>
                                <div className="text-600">{client.cpf}</div>
                            </div>
                            <div className="col-6 mb-2">
                                <strong>RG:</strong>
                                <div className="text-600">{client.rg}</div>
                            </div>
                            <div className="col-6 mb-2">
                                <strong>Gênero:</strong>
                                <div className="text-600">{client.gender}</div>
                            </div>
                            <div className="col-6 mb-2">
                                <strong>Idade:</strong>
                                <div className="text-600">{calculateAge(client.birthDate)} anos</div>
                            </div>
                            <div className="col-12 mb-2">
                                <strong>Data de Nascimento:</strong>
                                <div className="text-600">{formatDate(client.birthDate)}</div>
                            </div>
                        </div>
                    </div>
                    
                    {client.address && client.address.length > 0 && (
                        <div className="col-12 mt-3">
                            <h5 className="text-base mb-2 border-bottom-1 surface-border pb-2">Endereço</h5>
                            <div className="grid text-sm">
                                <div className="col-6 mb-2">
                                    <strong>CEP:</strong>
                                    <div className="text-600">{client.address[0].cep}</div>
                                </div>
                                <div className="col-6 mb-2">
                                    <strong>Estado:</strong>
                                    <div className="text-600">{client.address[0].state}</div>
                                </div>
                                <div className="col-12 mb-2">
                                    <strong>Cidade:</strong>
                                    <div className="text-600">{client.address[0].city}</div>
                                </div>
                                <div className="col-12 mb-2">
                                    <strong>Bairro:</strong>
                                    <div className="text-600">{client.address[0].district}</div>
                                </div>
                                <div className="col-12 mb-2">
                                    <strong>Rua:</strong>
                                    <div className="text-600">{client.address[0].street}</div>
                                </div>
                                {client.address[0].complement && (
                                    <div className="col-12 mb-2">
                                        <strong>Complemento:</strong>
                                        <div className="text-600">{client.address[0].complement}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Dialog>
    );
}