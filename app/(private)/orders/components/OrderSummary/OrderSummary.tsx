// app/orders/components/OrderSummary/OrderSummary.tsx
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { PaymentMethod } from '../PaymentMethodSection/PaymentMethodSection';

interface OrderSummaryProps {
  onCreateOrder: () => void;
  isValid: boolean;
  loading: boolean;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
}

export default function OrderSummary({ 
  onCreateOrder, 
  isValid, 
  loading,
  subtotal,
  discount,
  total,
  paymentMethod
}: OrderSummaryProps) {
  const getPaymentMethodLabel = (method: PaymentMethod) => {
    const labels = {
      'Dinheiro': 'Dinheiro',
      'Pix': 'Pix',
      'Credito': 'Cartão de Crédito',
      'Debito': 'Cartão de Débito'
    };
    return labels[method];
  };

  return (
    <Card title="Resumo do Pedido">
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Subtotal:</span>
          <span>R$ {subtotal.toFixed(2)}</span>
        </div>
        
        {discount > 0 && (
          <div className="flex justify-between text-sm text-red-500">
            <span>Desconto:</span>
            <span>- R$ {discount.toFixed(2)}</span>
          </div>
        )}
        
        <div className="flex justify-between font-semibold text-lg border-t pt-2">
          <span>Total:</span>
          <span>R$ {total.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-sm text-gray-600 border-t pt-2">
          <span>Forma de pagamento:</span>
          <span>{getPaymentMethodLabel(paymentMethod)}</span>
        </div>
        
        <Button
          label="Finalizar Venda"
          icon="pi pi-check"
          onClick={onCreateOrder}
          disabled={!isValid || loading}
          loading={loading}
          className="w-full mt-3"
          severity="success"
        />
        
        {!isValid && (
          <small className="text-gray-500 block text-center mt-2">
            {!isValid && "Selecione um cliente e adicione produtos"}
          </small>
        )}
      </div>
    </Card>
  );
}