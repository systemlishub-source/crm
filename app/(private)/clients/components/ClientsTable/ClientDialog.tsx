'use client';
import { Dialog } from "primereact/dialog";
import { Client } from "../../types";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputMask } from "primereact/inputmask";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { classNames } from "primereact/utils";
import { Divider } from "primereact/divider";
import { useState } from "react";

interface ClientDialogProps {
    open: boolean;
    onClose: () => void;
    client: Client;
    setClient: (client: Client) => void;
    submitted: boolean;
    handleClient: any;
    typeEdit?: boolean;
}

export const ClientDialog = ({ open, onClose, client, setClient, submitted, handleClient, typeEdit }: ClientDialogProps) => {
    const [activeTab, setActiveTab] = useState<'personal' | 'address'>('personal');

    const genderOptions = [
        { label: 'Masculino', value: 'Masculino' },
        { label: 'Feminino', value: 'Feminino' },
        { label: 'Outro', value: 'Outro' },
    ];

    const fetchAddressByCEP = async (cep: string) => {

        try {
            // Remove caracteres não numéricos
            const cleanCEP = cep.replace(/\D/g, '');

            if (cleanCEP.length !== 8) return; // CEP incompleto

            const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
            const data = await response.json();

            if (!data.erro) {
                // Atualiza os campos de endereço
                setClient({
                    ...client,
                    address: [
                        {
                            ...client.address[0],
                            cep: data.cep || '',
                            street: data.logradouro || '',
                            district: data.bairro || '',
                            city: data.localidade || '',
                            state: data.uf || '',
                            country: 'Brasil', // Define como Brasil por padrão
                            complement: data.complemento || ''
                        }
                    ]
                });
            } else {
                console.log('CEP não encontrado');
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
        }
    }

    const onInputChange = (
        e: any,
        name: string
    ) => {
        const val = (e.target && e.target.value) || e.value || '';
        setClient({ ...client, [name]: val });
    };

    const onAddressChange = (
        e: any,
        field: string
    ) => {
        const val = (e.target && e.target.value) || e.value || '';
        const updatedAddress = [...client.address];
        updatedAddress[0] = { ...updatedAddress[0], [field]: val };
        setClient({ ...client, address: updatedAddress });
    };

    const onDateChange = (e: any, field: string) => {
        const value = e.value;
        setClient({ ...client, [field]: value });
    };

    const onDropdownChange = (e: any, field: string) => {
        const value = e.value;
        setClient({ ...client, [field]: value });
    };

    const clientDialogfooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={onClose} />
            <Button label="Salvar" icon="pi pi-check" text onClick={() => handleClient(client)} />
        </>
    );

    const formatDateForInput = (dateString: string) => {
        if (!dateString) return null;
        return new Date(dateString);
    };

    return (
        <Dialog 
            visible={open} 
            style={{ width: '700px', maxWidth: '90vw' }} 
            header={typeEdit ? "Editar Cliente" : "Novo Cliente"} 
            modal 
            className="p-fluid" 
            footer={clientDialogfooter} 
            onHide={onClose}
        >
            {/* Abas de Navegação */}
            <div className="flex mb-4">
                <Button 
                    label="Dados Pessoais" 
                    className={`p-button-text ${activeTab === 'personal' ? 'p-button-primary' : 'p-button-secondary'}`}
                    onClick={() => setActiveTab('personal')}
                />
                <Button 
                    label="Endereço" 
                    className={`p-button-text ${activeTab === 'address' ? 'p-button-primary' : 'p-button-secondary'}`}
                    onClick={() => setActiveTab('address')}
                />
            </div>

            {/* Dados Pessoais */}
            {activeTab === 'personal' && (
                <div className="grid formgrid">
                    <div className="field col-12 md:col-6">
                        <label htmlFor="name">Nome <span className="text-red-500">*</span></label>
                        <InputText
                            id="name"
                            value={client.name}
                            onChange={(e) => onInputChange(e, 'name')}
                            required
                            autoFocus
                            className={classNames({ 'p-invalid': submitted && !client.name })}
                        />
                        {submitted && !client.name && <small className="p-invalid">O nome é obrigatório</small>}
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="email">Email <span className="text-red-500">*</span></label>
                        <InputText
                            id="email"
                            value={client.email}
                            onChange={(e) => onInputChange(e, 'email')}
                            required
                            className={classNames({ 'p-invalid': submitted && !client.email })}
                        />
                        {submitted && !client.email && <small className="p-invalid">O email é obrigatório</small>}
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="cpf">CPF <span className="text-red-500"></span></label>
                        <InputMask
                            id="cpf"
                            mask="999.999.999-99"
                            value={client.cpf}
                            onChange={(e) => onInputChange(e, 'cpf')}
                            required
                            className={classNames({ 'p-invalid': submitted && !client.cpf })}
                        />
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="rg">RG</label>
                        <InputText
                            id="rg"
                            value={client.rg}
                            onChange={(e) => onInputChange(e, 'rg')}
                        />
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="phoneNumber">Telefone <span className="text-red-500">*</span></label>
                        <InputMask
                            id="phoneNumber"
                            mask="(99) 99999-9999"
                            value={client.phoneNumber}
                            onChange={(e) => onInputChange(e, 'phoneNumber')}
                            required
                            className={classNames({ 'p-invalid': submitted && !client.phoneNumber })}
                        />
                        {submitted && !client.phoneNumber && <small className="p-invalid">O telefone é obrigatório</small>}
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="birthDate">Data de Nascimento <span className="text-red-500">*</span></label>
                        <Calendar
                            id="birthDate"
                            value={formatDateForInput(client.birthDate)}
                            onChange={(e) => onDateChange(e, 'birthDate')}
                            dateFormat="dd/mm/yy"
                            showIcon
                            required
                            className={classNames({ 'p-invalid': submitted && !client.birthDate })}
                        />
                        {submitted && !client.birthDate && <small className="p-invalid">A data de nascimento é obrigatória</small>}
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="gender">Gênero</label>
                        <Dropdown
                            id="gender"
                            value={client.gender}
                            options={genderOptions}
                            onChange={(e) => onDropdownChange(e, 'gender')}
                            placeholder="Selecione o gênero"
                        />
                    </div>
                </div>
            )}

            {/* Endereço */}
            {activeTab === 'address' && (
                <div className="grid formgrid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="cep">CEP <span className="text-red-500">*</span></label>
                        <InputMask
                            id="cep"
                            mask="99999-999"
                            value={client.address[0]?.cep || ''}
                            onChange={(e: any) => {
                            onAddressChange(e, 'cep')
                            if (e.target.value.replace(/\D/g, '').length === 8) {
                                fetchAddressByCEP(e.target.value);
                            }
                        }}
                            required
                            className={classNames({ 'p-invalid': submitted && !client.address[0]?.cep })}
                        />
                        {submitted && !client.address[0]?.cep && <small className="p-invalid">O CEP é obrigatório</small>}
                    </div>

                    <div className="field col-12 md:col-8">
                        <label htmlFor="street">Rua <span className="text-red-500">*</span></label>
                        <InputText
                            id="street"
                            value={client.address[0]?.street || ''}
                            onChange={(e) => onAddressChange(e, 'street')}
                            required
                            className={classNames({ 'p-invalid': submitted && !client.address[0]?.street })}
                        />
                        {submitted && !client.address[0]?.street && <small className="p-invalid">A rua é obrigatória</small>}
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="number">Número</label>
                        <InputText
                            id="number"
                            value={client.address[0]?.number || ''}
                            onChange={(e) => onAddressChange(e, 'number')}
                        />
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="complement">Complemento</label>
                        <InputText
                            id="complement"
                            value={client.address[0]?.complement || ''}
                            onChange={(e) => onAddressChange(e, 'complement')}
                        />
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="district">Bairro <span className="text-red-500">*</span></label>
                        <InputText
                            id="district"
                            value={client.address[0]?.district || ''}
                            onChange={(e) => onAddressChange(e, 'district')}
                            required
                            className={classNames({ 'p-invalid': submitted && !client.address[0]?.district })}
                        />
                        {submitted && !client.address[0]?.district && <small className="p-invalid">O bairro é obrigatório</small>}
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="city">Cidade <span className="text-red-500">*</span></label>
                        <InputText
                            id="city"
                            value={client.address[0]?.city || ''}
                            onChange={(e) => onAddressChange(e, 'city')}
                            required
                            className={classNames({ 'p-invalid': submitted && !client.address[0]?.city })}
                        />
                        {submitted && !client.address[0]?.city && <small className="p-invalid">A cidade é obrigatória</small>}
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="state">Estado <span className="text-red-500">*</span></label>
                        <InputText
                            id="state"
                            value={client.address[0]?.state || ''}
                            onChange={(e) => onAddressChange(e, 'state')}
                            required
                            maxLength={2}
                            className={classNames({ 'p-invalid': submitted && !client.address[0]?.state })}
                        />
                        {submitted && !client.address[0]?.state && <small className="p-invalid">O estado é obrigatório</small>}
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="country">País <span className="text-red-500">*</span></label>
                        <InputText
                            id="country"
                            value={client.address[0]?.country || ''}
                            onChange={(e) => onAddressChange(e, 'country')}
                            required
                            className={classNames({ 'p-invalid': submitted && !client.address[0]?.country })}
                        />
                        {submitted && !client.address[0]?.country && <small className="p-invalid">O país é obrigatório</small>}
                    </div>
                </div>
            )}

        </Dialog>
    );
};