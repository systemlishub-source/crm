/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import React, { useEffect, useRef, useState } from 'react';
import ProductDialog from './components/productDialog';
import { saveProduct, saveProductWithVariations } from './services/saveProduct';
import ProductsTable from './components/ProductsTable';
import { updateProduct } from './services/updateProduct';
import { deleteProduct } from './services/deleteProduct';
import EntryDialog from './components/EntryDialog';
import { updateQuantity } from './services/updateQuantity';

export interface Product {
    id: number;
    type: string;
    name: string;
    model: string;
    description: string;
    image: string;
    size: string;
    sizeNumber: number;
    color: string;
    material: string;
    purchaseValue: number;
    saleValue: number;
    margin: number;
    quantity: number;
    supplier: string;
    code: string
    createdAt: string;
    updatedAt: string;
    variations?: ProductVariation[];
}

export interface ProductVariation {
  id?: string;
  color: string;
  size: string;
  sizeNumber: number;
  quantity: number;
  sku?: string;
}


const ManageProductPage = () => {
    let emptyProduct: Product = {
        id: 0,
        name: '',
        type: '',
        image: '',
        description: '',
        size: '',
        sizeNumber: 0,
        color: '',
        model: '',
        material: '',
        purchaseValue: 0,
        saleValue: 0,
        margin: 0,
        quantity: 0,
        supplier: '',
        code: '',
        createdAt: '',
        updatedAt: ''
    };


    const [products, setProducts] = useState<Product[]>([]);
    const [productDialog, setProductDialog] = useState(false);
    const [editProductDialog, setEditProductDialog] = useState(false);
    const [deleteProductDialog, setDeleteProductDialog] = useState(false);
    const [entryDialog, setEntryDialog] = useState(false);
    const [product, setProduct] = useState<Product>(emptyProduct);
    const [submitted, setSubmitted] = useState(false);
    const [quantityToAdd, setQuantityToAdd] = useState<number>(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const toast = useRef<Toast>(null);

    const fetchProducts = async () => {
        const response = await fetch('/api/products');
        if (response.status === 401) {
        // Token expirado - redireciona para login
        window.location.href = '/login';
        throw new Error('Não autorizado - redirecionando para login');
        }
        const data = await response.json();

        console.log(data)
        setProducts(data);
        return data;

    }

    useEffect(() => {
        fetchProducts();
    }, []);

    
    const openNew = () => {
        setProduct(emptyProduct);
        setSubmitted(false);
        setProductDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setEditProductDialog(false);
        setProductDialog(false);
        setEntryDialog(false);
        setSelectedFile(null);
    };

    const hideDeleteProductDialog = () => {
        setDeleteProductDialog(false);
    };

    const editProduct = (product: Product) => {
        setProduct({ ...product });
        setEditProductDialog(true);
    };
    
    const entryProduct = (product: Product) => {
        setProduct({ ...product });
        setQuantityToAdd(0);
        setEntryDialog(true);
    };

    const confirmDeleteProduct = (product: Product) => {
        setProduct(product);
        setDeleteProductDialog(true);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Adicionar Novo Produto" icon="pi pi-plus" severity="success" className=" mr-2" onClick={openNew} />
                </div>
            </React.Fragment>
        );
    };

    const productDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Salvar" icon="pi pi-check" text onClick={()=> {
                if (product.variations && product.variations.length > 0) {
      // Se tem variações, usa a função nova
      saveProductWithVariations(
        product,
        selectedFile,
        setSubmitted,
        fetchProducts,
        hideDialog,
        toast
      );
    } else {
      // Se não tem variações, usa a função original (para compatibilidade)
      saveProduct(
        product,
        selectedFile,
        setSubmitted,
        fetchProducts,
        hideDialog,
        toast
      );
    }
            }} />
        </>
    );
    const editProductDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Salvar" icon="pi pi-check" text onClick={()=> updateProduct(product, selectedFile, setSubmitted, fetchProducts, hideDialog, toast)} />
        </>
    );
    const deleteProductDialogFooter = (
        <>
            <Button label="Não" icon="pi pi-times" text onClick={hideDeleteProductDialog} />
            <Button label="Sim" icon="pi pi-check" text onClick={() => deleteProduct(product.id, fetchProducts, hideDeleteProductDialog, toast)} />
        </>
    );
    const EntryDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Salvar" icon="pi pi-check" text onClick={()=> updateQuantity(product, setSubmitted, fetchProducts, hideDialog, toast, quantityToAdd)} />
        </>
    );

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card ">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} ></Toolbar>

                    <ProductsTable
                        products={products}
                        editProduct={editProduct}
                        entryProduct={entryProduct}
                        confirmDeleteProduct={confirmDeleteProduct}
                    />

                    <ProductDialog
                        productDialog={productDialog}
                        product={product}
                        submitted={submitted}
                        setProduct={setProduct}
                        hideDialog={hideDialog}
                        productDialogFooter={productDialogFooter}
                        setSelectedFile={setSelectedFile}
                    />

                    <ProductDialog
                        productDialog={editProductDialog}
                        product={product}
                        submitted={submitted}
                        setProduct={setProduct}
                        hideDialog={hideDialog}
                        productDialogFooter={editProductDialogFooter}
                        setSelectedFile={setSelectedFile}
                        isEditMode={true}
                    />

                    <Dialog visible={deleteProductDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteProductDialogFooter} onHide={hideDeleteProductDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {product && (
                                <span>
                                    Tem certeza que deseja Deletar <b>{product.name}</b>?
                                    Esta ação é <b className='text-red-500'>IRREVERSÍVEL!</b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <EntryDialog
                        entryDialog={entryDialog}
                        product={product}
                        submitted={submitted}
                        setProduct={setProduct}
                        entryDialogFooter={EntryDialogFooter}
                        hideDialog={hideDialog}
                        quantityToAdd={quantityToAdd} 
                        setQuantityToAdd={setQuantityToAdd} 
                    />
                </div>
            </div>
        </div>
    );
};

export default ManageProductPage;