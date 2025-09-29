'use client';
import { Dialog } from "primereact/dialog";
import { Product, ProductVariation } from "../page";
import { InputText } from "primereact/inputtext";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { classNames } from "primereact/utils";
import { InputTextarea } from "primereact/inputtextarea";
import { FileUpload, FileUploadSelectEvent, FileUploadUploadEvent } from "primereact/fileupload";
import { Toast } from "primereact/toast";
import { useRef, useEffect, useState } from "react";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Button } from "primereact/button";
import { CLOTHING_MATERIALS, COLOR_OPTIONS, JEWELRY_MATERIALS, PRODUCT_TYPES } from "./optionsSelect";
import ProductVariations from "./ProductVariations";

interface ProductDialogProps {
  productDialog: boolean,
  product: Product,
  submitted: boolean,
  setProduct: React.Dispatch<React.SetStateAction<Product>>,
  hideDialog: () => void,
  productDialogFooter: React.ReactNode
  isEditMode?: boolean
  setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
}

const ProductDialog = ({
  productDialog,
  product,
  submitted,
  setProduct,
  hideDialog,
  productDialogFooter,
  setSelectedFile,
  isEditMode = false
}: ProductDialogProps) => {
  const toast = useRef<Toast>(null);
  const fileUploadRef = useRef<FileUpload>(null);
  const fileInputRef = useRef<Element | null>(null);

  useEffect(() => {
    if (fileUploadRef.current) {
      const fileInput = fileUploadRef.current.getElement().querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.setAttribute('capture', 'environment');
        fileInput.setAttribute('accept', 'image/*');
        fileInputRef.current = fileInput;
      }
    }
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: keyof Product) => {
    const val = e.target.value;
    setProduct(prev => ({
      ...prev,
      [name]: val
    }));
  };

  const onInputNumberChange = (e: InputNumberValueChangeEvent, name: keyof Product) => {
    const val = e.value || 0;
    setProduct(prev => ({
      ...prev,
      [name]: val
    }));

    if (name === 'purchaseValue' || name === 'saleValue') {
      const purchase = name === 'purchaseValue' ? val : product.purchaseValue;
      const sale = name === 'saleValue' ? val : product.saleValue;

      if (purchase > 0 && sale > 0) {
        const margin = ((sale - purchase) / purchase) * 100;
        setProduct(prev => ({
          ...prev,
          margin: Math.round(margin * 100) / 100
        }));
      }
    }
  };

  const getMaterialOptions = (productType: string) => {
    if (productType === 'joias') {
      return JEWELRY_MATERIALS.map(material => ({ label: material, value: material }));
    }
    return CLOTHING_MATERIALS.map(material => ({ label: material, value: material }));
  };

  const onColorChange = (e: DropdownChangeEvent) => {
    setProduct(prev => ({
      ...prev,
      color: e.value
    }));
  };

  const onMaterialChange = (e: DropdownChangeEvent) => {
    setProduct(prev => ({
      ...prev,
      material: e.value
    }));
  };

  const onSizeChange = (e: DropdownChangeEvent) => {
    setProduct(prev => ({
      ...prev,
      size: e.value
    }));
  };

  const onImageSelect = (event: FileUploadSelectEvent) => {
    const file = event.files[0];
    if (file) {
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setProduct(prev => ({
          ...prev,
          image: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
      
      toast.current?.show({
        severity: 'info',
        summary: 'Imagem selecionada',
        detail: 'Clique em salvar para fazer upload',
        life: 3000
      });

      if (fileUploadRef.current) {
        fileUploadRef.current.clear();
      }
    }
  };

  const onImageUpload = (event: import("primereact/fileupload").FileUploadHandlerEvent) => {
    const files = event.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setProduct(prev => ({
          ...prev,
          image: e.target?.result as string
        }));
        
        toast.current?.show({
          severity: 'success',
          summary: 'Imagem carregada',
          detail: 'Imagem do produto atualizada',
          life: 3000
        });
      };
      reader.readAsDataURL(file);
    }
    event.options && event.options.clear && event.options.clear();
  };

  const onTypeChange = (e: DropdownChangeEvent) => {
    setProduct(prev => ({
      ...prev,
      type: e.value,
      material: ''
    }));
  };

  // Funções para gerenciar variações (apenas no modo criação)
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

  const emptyTemplate = () => {
    return (
      <div className="flex align-items-center flex-column">
        {product.image ? (
          <>
            <img 
              src={product.image} 
              alt="Preview" 
              width="100" 
              className="shadow-2 mb-3" 
              style={{ borderRadius: '4px' }}
            />
            <span className="text-primary font-bold">Imagem carregada</span>
          </>
        ) : (
          <>
            <i className="pi pi-image mt-3 p-5" style={{ fontSize: '5em', borderRadius: '50%', backgroundColor: 'var(--surface-b)', color: 'var(--surface-d)' }}></i>
            <span className="my-5">Arraste e solte a imagem aqui</span>
          </>
        )}
      </div>
    );
  };

  const chooseOptions = {
    label: 'Selecionar',
    icon: 'pi pi-fw pi-images',
    className: 'p-button-primary'
  };

  const sizeOptions = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XGG'].map(size => ({ 
    label: size, value: size 
  }));

  // Componente para renderizar campos normais (modo edição)
  const renderNormalFields = () => (
    <>
      {/* Tamanhos */}
      <div className="formgrid grid">
        <div className="field col">
          <label htmlFor="size">Tamanho*</label>
          <Dropdown
            id="size"
            value={product.size}
            options={sizeOptions}
            onChange={onSizeChange}
            placeholder="Selecione um tamanho"
            required
            className={classNames({
              'w-auto': true,
              'p-invalid': submitted && !product.size
            })}
          />
          {submitted && !product.size && <small className="p-invalid">Tamanho é obrigatório.</small>}
        </div>
        <div className="field col">
          <label htmlFor="sizeNumber">Tamanho Numérico*</label>
          <InputNumber
            id="sizeNumber"
            value={product.sizeNumber}
            onValueChange={(e) => onInputNumberChange(e, 'sizeNumber')}
            min={0}
            required
            className={classNames({
              'p-invalid': submitted && product.sizeNumber <= 0
            })}
          />
          {submitted && !product.sizeNumber && <small className="p-invalid">Tamanho numérico é obrigatório.</small>}
        </div>
      </div>

      {/* Características Físicas */}
      <div className="formgrid grid">
        <div className="field col">
          <label htmlFor="color">Cor*</label>
          <Dropdown
            id="color"
            value={product.color}
            options={COLOR_OPTIONS}
            onChange={onColorChange}
            placeholder="Selecione uma cor"
            filter
            filterBy="label"
            required
            className={classNames({
              'p-invalid': submitted && !product.color
            })}
          />
          {submitted && !product.color && <small className="p-invalid">Cor é obrigatória.</small>}
        </div>
        <div className="field col">
          <label htmlFor="material">Material*</label>
          <Dropdown
            id="material"
            value={product.material}
            options={getMaterialOptions(product.type)}
            onChange={onMaterialChange}
            placeholder="Selecione um material"
            filter
            disabled={!product.type}
            required
            className={classNames({
              'p-invalid': submitted && !product.material
            })}
          />
          {submitted && !product.material && <small className="p-invalid">Material é obrigatório.</small>}
          {!product.type && <small className="p-invalid">Selecione o tipo de produto primeiro.</small>}
        </div>
      </div>

      {/* Quantidade */}
      <div className="field">
        <label htmlFor="quantity">Qntd. em Estoque*</label>
        <InputNumber
          id="quantity"
          value={product.quantity}
          onValueChange={(e) => onInputNumberChange(e, 'quantity')}
          min={0}
          required
          className={classNames({
            'p-invalid': submitted && product.quantity < 0
          })}
        />
        {submitted && product.quantity < 0 && (
          <small className="p-invalid">Quantidade não pode ser negativa.</small>
        )}
      </div>
    </>
  );

  // Componente para renderizar variações (modo criação)
  const renderVariations = () => (
    <ProductVariations 
      product={product}
      setProduct={setProduct}
      submitted={submitted}
    />
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={productDialog}
        style={{ width: '600px' }}
        header={isEditMode ? "Editar Produto" : "Detalhes do Produto"}
        modal
        className="p-fluid"
        footer={productDialogFooter}
        onHide={hideDialog}
      >
        {/* Nome e Tipo */}
        <div className="formgrid grid">
          <div className="field col">
            <label htmlFor="name">Nome*</label>
            <InputText
              id="name"
              value={product.name}
              onChange={(e) => onInputChange(e, 'name')}
              required
              className={classNames({
                'p-invalid': submitted && !product.name
              })}
            />
            {submitted && !product.name && <small className="p-invalid">Nome é obrigatório.</small>}
          </div>

          <div className="field col">
            <label htmlFor="type">Tipo de Produto*</label>
            <Dropdown
              id="type"
              value={product.type}
              options={PRODUCT_TYPES}
              onChange={(e) => onTypeChange(e)}
              placeholder="Selecione o tipo"
              required
              className={classNames({
                'p-invalid': submitted && !product.type
              })}
            />
            {submitted && !product.type && <small className="p-invalid">Tipo é obrigatório.</small>}
          </div>
        </div>

        {/* Modelo e Fornecedor */}
        <div className="formgrid grid">
          <div className="field col">
            <label htmlFor="model">Modelo*</label>
            <InputText
              id="model"
              value={product.model}
              onChange={(e) => onInputChange(e, 'model')}
              className={classNames({
                'p-invalid': submitted && !product.model
              })}
            />
            {submitted && !product.model && <small className="p-invalid">Modelo é obrigatório.</small>}
          </div>
          <div className="field col">
            <label htmlFor="supplier">Fornecedor*</label>
            <InputText
              id="supplier"
              value={product.supplier}
              onChange={(e) => onInputChange(e, 'supplier')}
              required
              className={classNames({
                'p-invalid': submitted && !product.supplier
              })}
            />
            {submitted && !product.supplier && <small className="p-invalid">Fornecedor é obrigatório.</small>}
          </div>
        </div>

        {/* Descrição */}
        <div className="field">
          <label htmlFor="description">Descrição</label>
          <InputTextarea
            id="description"
            value={product.description}
            onChange={(e) => onInputChange(e, 'description')}
            rows={3}
          />
        </div>

        {/* Material */}
        <div className="field">
          <label htmlFor="material">Material*</label>
          <Dropdown
            id="material"
            value={product.material}
            options={getMaterialOptions(product.type)}
            onChange={onMaterialChange}
            placeholder="Selecione um material"
            filter
            disabled={!product.type}
            required
            className={classNames({
              'p-invalid': submitted && !product.material
            })}
          />
          {submitted && !product.material && <small className="p-invalid">Material é obrigatório.</small>}
          {!product.type && <small className="p-invalid">Selecione o tipo de produto primeiro.</small>}
        </div>

        {/* Valores */}
        <div className="formgrid grid">
          <div className="field col">
            <label htmlFor="purchaseValue">Valor de Compra*</label>
            <InputNumber
              id="purchaseValue"
              value={product.purchaseValue}
              onValueChange={(e) => onInputNumberChange(e, 'purchaseValue')}
              mode="currency"
              currency="BRL"
              locale="pt-BR"
              required
              className={classNames({
                'p-invalid': submitted && product.purchaseValue <= 0
              })}
            />
            {submitted && product.purchaseValue <= 0 && (
              <small className="p-invalid">Valor de compra deve ser maior que zero.</small>
            )}
          </div>
          <div className="field col">
            <label htmlFor="saleValue">Valor de Venda*</label>
            <InputNumber
              id="saleValue"
              value={product.saleValue}
              onValueChange={(e) => onInputNumberChange(e, 'saleValue')}
              mode="currency"
              currency="BRL"
              locale="pt-BR"
              required
              className={classNames({
                'p-invalid': submitted && product.saleValue <= 0
              })}
            />
            {submitted && product.saleValue <= 0 && (
              <small className="p-invalid">Valor de venda deve ser maior que zero.</small>
            )}
          </div>
        </div>

        {/* Margem */}
        <div className="field">
          <label htmlFor="margin">Margem (%)</label>
          <InputNumber
            id="margin"
            value={product.margin}
            mode="decimal"
            suffix="%"
            min={0}
            max={10000}
            disabled
            className="bg-gray-100 cursor-not-allowed"
            inputClassName={
              product.margin > 0 
                ? 'text-green-600 text-bold' 
                : product.margin < 0 
                  ? 'text-red-600 font-bold' 
                  : 'text-gray-600 font-bold'
            }
          />
          <small>Calculada automaticamente</small>
        </div>

        {/* Campos Normais (Edição) ou Variações (Criação) */}
        {isEditMode ? renderNormalFields() : renderVariations()}

        {/* Upload de Imagem */}
        <div className="field mt-4">
          <label htmlFor="image">Imagem do Produto</label>
          <FileUpload
            ref={fileUploadRef}
            name="image"
            accept="image/*"
            maxFileSize={10000000}
            onSelect={onImageSelect}
            customUpload={true}
            uploadHandler={onImageUpload}
            chooseOptions={chooseOptions}
            cancelOptions={{ label: 'Cancelar', icon: 'pi pi-fw pi-times' }}
            mode="advanced"
            auto={true}
            emptyTemplate={emptyTemplate()}
            style={{ width: '100%' }}
            className="p-fileupload-advanced"
          />
        </div>
      </Dialog>
    </>
  );
};

export default ProductDialog;