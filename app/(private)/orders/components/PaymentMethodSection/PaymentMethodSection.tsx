// app/orders/components/PaymentMethodSection/PaymentMethodSection.tsx
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';

export type PaymentMethod = 'Pix' | 'Credito' | 'Debito' | 'Dinheiro';

interface PaymentMethodSectionProps {
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (value: PaymentMethod) => void;
  loading?: boolean;
}

const paymentMethods = [
  { label: 'Dinheiro', value: 'Dinheiro' },
  { label: 'Pix', value: 'Pix' },
  { label: 'Cartão de Crédito', value: 'Credito' },
  { label: 'Cartão de Débito', value: 'Debito' }
];

export default function PaymentMethodSection({ 
  paymentMethod, 
  onPaymentMethodChange, 
  loading = false 
}: PaymentMethodSectionProps) {
  return (
    <Card className="mb-3" title="Forma de Pagamento">
      <div className="grid">
        <div className="col-12">
          <label htmlFor="paymentMethod" className="block text-sm font-medium mb-2">
            Selecione a forma de pagamento
          </label>
          <Dropdown
            id="paymentMethod"
            value={paymentMethod}
            onChange={(e) => onPaymentMethodChange(e.value)}
            options={paymentMethods}
            optionLabel="label"
            placeholder="Selecione..."
            disabled={loading}
            className="w-full"
          />
        </div>
      </div>
    </Card>
  );
}