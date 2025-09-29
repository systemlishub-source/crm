import React from 'react';
import { Button } from 'primereact/button';
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { classNames } from 'primereact/utils';
import { Product, ProductVariation } from '../page';
import { COLOR_OPTIONS } from './optionsSelect';

interface ProductVariationsProps {
  product: Product;
  setProduct: React.Dispatch<React.SetStateAction<Product>>;
  submitted: boolean;
}

const ProductVariations = ({ product, setProduct, submitted }: ProductVariationsProps) => {
  const addVariation = () => {
    setProduct(prev => ({
      ...prev,
      variations: [
        ...(prev.variations || []),
        {
          color: '',
          size: '',
          sizeNumber: 0,
          quantity: 0
        }
      ]
    }));
  };

  const removeVariation = (index: number) => {
    setProduct(prev => ({
      ...prev,
      variations: prev.variations?.filter((_, i) => i !== index) || []
    }));
  };

  const updateVariation = (index: number, field: keyof ProductVariation, value: any) => {
    setProduct(prev => ({
      ...prev,
      variations: prev.variations?.map((variation, i) => 
        i === index ? { ...variation, [field]: value } : variation
      ) || []
    }));
  }; 

  const sizeOptions = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XGG'].map(size => ({ 
    label: size, value: size 
  }));

  return (
    <div className="field">
      <div className="flex align-items-center justify-content-between mb-3">
        <label className="font-bold text-lg mb-0">Variações do produto</label>
        <Button 
          icon="pi pi-plus" 
          className="p-button-rounded p-button-primary p-button-sm"
          onClick={addVariation}
          tooltip="Adicionar nova variação"
          tooltipOptions={{ position: 'top' }}
        />
      </div>

      {product.variations?.map((variation, index) => (
        <div key={index} className="p-fluid border-1 surface-border p-3 mb-3 border-round surface-card">
          <div className="flex justify-content-between align-items-center mb-3">
            <span className="font-medium text-color">Variação {index + 1}</span>
            <Button 
              icon="pi pi-trash" 
              className="p-button-danger p-button-text p-button-sm"
              onClick={() => removeVariation(index)}
              tooltip="Remover variação"
              tooltipOptions={{ position: 'top' }}
            />
          </div>

          <div className="formgrid grid">
            <div className="field col-6">
              <label htmlFor={`color-${index}`} className="font-medium">Cor*</label>
              <Dropdown
                id={`color-${index}`}
                value={variation.color}
                options={COLOR_OPTIONS}
                onChange={(e: DropdownChangeEvent) => updateVariation(index, 'color', e.value)}
                placeholder="Selecione uma cor"
                filter
                required
                className={classNames('w-full', {
                  'p-invalid': submitted && !variation.color
                })}
              />
              {submitted && !variation.color && (
                <small className="p-invalid">Cor é obrigatória.</small>
              )}
            </div>

            <div className="field col-6">
              <label htmlFor={`size-${index}`} className="font-medium">Tamanho*</label>
              <Dropdown
                id={`size-${index}`}
                value={variation.size}
                options={sizeOptions}
                onChange={(e: DropdownChangeEvent) => updateVariation(index, 'size', e.value)}
                placeholder="Selecione um tamanho"
                required
                className={classNames('w-full', {
                  'p-invalid': submitted && !variation.size
                })}
              />
              {submitted && !variation.size && (
                <small className="p-invalid">Tamanho é obrigatório.</small>
              )}
            </div>
          </div>

          <div className="formgrid grid mt-2">
            <div className="field col-6">
              <label htmlFor={`sizeNumber-${index}`} className="font-medium">Tamanho Numérico*</label>
              <InputNumber
                id={`sizeNumber-${index}`}
                value={variation.sizeNumber}
                onValueChange={(e: InputNumberValueChangeEvent) => 
                  updateVariation(index, 'sizeNumber', e.value || 0)
                }
                min={0}
                placeholder="Ex: 42"
                required
                className={classNames('w-full', {
                  'p-invalid': submitted && variation.sizeNumber <= 0
                })}
              />
              {submitted && variation.sizeNumber <= 0 && (
                <small className="p-invalid">Tamanho numérico é obrigatório.</small>
              )}
            </div>

            <div className="field col-6">
              <label htmlFor={`quantity-${index}`} className="font-medium">Quantidade*</label>
              <InputNumber
                id={`quantity-${index}`}
                value={variation.quantity}
                onValueChange={(e: InputNumberValueChangeEvent) => 
                  updateVariation(index, 'quantity', e.value || 0)
                }
                min={0}
                placeholder="Ex: 10"
                required
                className={classNames('w-full', {
                  'p-invalid': submitted && variation.quantity < 0
                })}
              />
              {submitted && variation.quantity < 0 && (
                <small className="p-invalid">Quantidade é obrigatória.</small>
              )}
            </div>
          </div>
        </div>
      ))}

      {(!product.variations || product.variations.length === 0) && (
        <div className="text-center p-6 border-1 surface-border border-round surface-ground">
          <i className="pi pi-plus-circle text-4xl mb-3 text-400"></i>
          <p className="text-500 mb-4">Nenhuma variação adicionada</p>
          <Button 
            icon="pi pi-plus" 
            label="Adicionar Primeira Variação" 
            onClick={addVariation}
            className="p-button-outlined"
          />
        </div>
      )}

      {product.variations && product.variations.length > 0 && (
        <div className="flex justify-content-end mt-2">
          <Button 
            icon="pi pi-plus" 
            label="Adicionar Outra Variação" 
            onClick={addVariation}
            className="p-button-text p-button-sm"
          />
        </div>
      )}
    </div>
  );
};

export default ProductVariations;