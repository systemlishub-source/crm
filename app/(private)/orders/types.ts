
export interface Address {
    id: number;
    cep: string;
    country: string;
    state: string;
    city: string;
    district: string;
    street: string;
    complement: string;
    userId: string | null;
    clientId: string;
}

export interface Product {
    id: number;
    code: string;
    name: string;
    model: string;
    saleValue: number;
    quantity: number;
    image?: string;
    size: string;
    color: string;
    material: string;
    sizeNumber: number
}

export interface OrderItem {
    productId: number;
    quantity: number;
    price: number;
    product?: {
        id: number;
        code: string;
        name: string;
        model: string;
        saleValue: number;
        quantity: number;
        image?: string;
    };
}

export interface Order {
    id: number;
    clientId: string;
    userId: string;
    purchaseDate: string;
    notes?: string;
    client: {
        id: string;
        name: string;
        email: string;
    };
    user: {
        id: string;
        name: string;
        email: string;
    };
    orderItems: Array<{
        id: number;
        quantity: number;
        price: number;
        product: {
            id: number;
            code: string;
            name: string;
            status: number;
        };
    }>;
    total: number;
}

export interface OrderFormData {
    clientId: string;
    userId: string;
    notes: string;
    orderItems: Array<{
        productId: number;
        quantity: number;
    }>;
}