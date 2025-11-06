// app/orders/components/DiscountSection/DiscountSection.tsx
import { InputNumber } from 'primereact/inputnumber';
import { Card } from 'primereact/card';

interface DiscountSectionProps {
  discount: number;
  onDiscountChange: (value: number) => void;
  subtotal: number;
  loading?: boolean;
}

export default function DiscountSection({ 
  discount, 
  onDiscountChange, 
  subtotal, 
  loading = false 
}: DiscountSectionProps) {
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal - discountAmount;

  return (
    <Card className="mb-3" title="Desconto">
      <div className="grid">
        <div className="col-12">
          <label htmlFor="discount" className="block text-sm font-medium mb-2">
            Desconto (%)
          </label>
          <InputNumber
            id="discount"
            value={discount}
            onValueChange={(e) => onDiscountChange(e.value || 0)}
            mode="decimal"
            min={0}
            max={100}
            suffix="%"
            disabled={loading}
            className="w-full"
            showButtons
            buttonLayout="horizontal"
            incrementButtonIcon="pi pi-plus"
            decrementButtonIcon="pi pi-minus"
            incrementButtonClassName="p-button-secondary"
            decrementButtonClassName="p-button-secondary"
          />
        </div>
        
        {discount > 0 && (
          <>
            <div className="col-12 mt-3">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-red-500">
                <span>Desconto ({discount}%):</span>
                <span>- R$ {discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                <span>Total com desconto:</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}