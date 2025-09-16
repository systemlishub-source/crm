'use client';
import { Avatar } from "primereact/avatar";
import { Badge } from "primereact/badge";
import { Client } from "../../types";


interface ClientListProps {
    clients: Client[];
    onClientClick: (client: Client) => void;
}

export default function ClientList({ clients, onClientClick }: ClientListProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit' 
        });
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

    const getDaysUntilBirthday = (birthDate: string) => {
        const today = new Date();
        const birth = new Date(birthDate);
        birth.setFullYear(today.getFullYear());
        
        if (birth < today) {
            birth.setFullYear(today.getFullYear() + 1);
        }
        
        const diffTime = Math.abs(birth.getTime() - today.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    return (
        <div 
            className="client-list-container"
            style={{ 
                maxHeight: '250px', 
                overflowY: 'auto',
                padding: '0.5rem'
            }}
        >
            {clients.map((client) => (
                <div 
                    key={client.id}
                    className="flex align-items-center p-2 border-bottom-1 surface-border cursor-pointer hover:surface-hover transition-duration-150"
                    onClick={() => onClientClick(client)}
                >
                    <Avatar 
                        label={client.name.charAt(0)} 
                        size="normal" 
                        className="bg-primary text-white mr-3" 
                        shape="circle"
                    />
                    
                    <div className="flex-1">
                        <div className="flex align-items-center justify-content-between">
                            <span className="text-sm font-semibold">{client.name}</span>
                            <Badge 
                                value={`${calculateAge(client.birthDate)} anos`} 
                                severity="info"
                            />
                        </div>
                        
                        <div className="flex align-items-center justify-content-between mt-1">
                            <span className="text-xs text-600">
                                <i className="pi pi-calendar mr-1"></i>
                                {formatDate(client.birthDate)}
                            </span>
                            
                            <span className="text-xs text-600">
                                <i className="pi pi-star mr-1"></i>
                                em {getDaysUntilBirthday(client.birthDate)} dias
                            </span>
                        </div>
                    </div>
                    
                    <i className="pi pi-chevron-right text-500 ml-2"></i>
                </div>
            ))}
        </div>
    );
}