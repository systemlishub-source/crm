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
  const total = subtotal - discount;
  const discountPercentage = subtotal > 0 ? (discount / subtotal) * 100 : 0;

  const handleDiscountChange = (value: number | null | undefined) => {
    const newDiscount = value || 0;
    
    // Validação: desconto não pode ser maior que o subtotal
    if (newDiscount > subtotal) {
      onDiscountChange(subtotal);
    } else {
      onDiscountChange(newDiscount);
    }
  };

  return (
    <Card className="mb-3" title="Desconto">
      <div className="grid">
        <div className="col-12">
          <label htmlFor="discount" className="block text-sm font-medium mb-2">
            Desconto (R$)
          </label>
          <InputNumber
            id="discount"
            value={discount}
            onValueChange={(e) => handleDiscountChange(e.value)}
            mode="currency"
            currency="BRL"
            locale="pt-BR"
            min={0}
            max={subtotal} // Limite máximo é o subtotal
            disabled={loading || subtotal === 0}
            className="w-full"
            showButtons
            buttonLayout="horizontal"
            incrementButtonIcon="pi pi-plus"
            decrementButtonIcon="pi pi-minus"
            incrementButtonClassName="p-button-secondary"
            decrementButtonClassName="p-button-secondary"
            step={0.01}
          />
          {subtotal === 0 && (
            <small className="text-gray-500 block mt-1">
              Adicione produtos para aplicar desconto
            </small>
          )}
        </div>
        
        {discount > 0 && (
          <div className="col-12 mt-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-red-500">
                <span>Desconto {discountPercentage > 0 && `(${discountPercentage.toFixed(1)}%)`}:</span>
                <span>- R$ {discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                <span>Total com desconto:</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {discount > 0 && discount === subtotal && (
          <div className="col-12 mt-2">
            <div className="p-2 bg-blue-50 border-round text-xs text-blue-700">
              <i className="pi pi-info-circle mr-1"></i>
              Desconto máximo aplicado
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}