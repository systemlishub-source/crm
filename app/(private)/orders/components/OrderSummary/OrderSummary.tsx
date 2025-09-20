// app/orders/components/OrderSummary/OrderSummary.tsx
'use client';
import { Button } from "primereact/button";

interface OrderSummaryProps {
    onCreateOrder: () => void;
    isValid: boolean;
    loading?: boolean;
}

export default function OrderSummary({
    onCreateOrder,
    isValid,
    loading = false
}: OrderSummaryProps) {
    return (
        <div className="text-right">
            <Button
                label="Registrar Venda"
                icon="pi pi-check"
                onClick={onCreateOrder}
                disabled={!isValid || loading}
                loading={loading}
            />
        </div>
    );
}