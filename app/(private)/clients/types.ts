import { Order } from "../orders/types";

export interface Client {
    id: string;
    name: string;
    email: string;
    cpf: string;
    status?: number;
    phoneNumber: string;
    birthDate: string;
    gender: string;
    rg: string;
    address: Address[];
    orders?:any[]
}


export interface Address {
    id: number;
    cep: string;
    country: string;
    state: string;
    city: string;
    district: string;
    street: string;
    number?: string;
    complement: string;
    userId: string | null;
    clientId: string;
}