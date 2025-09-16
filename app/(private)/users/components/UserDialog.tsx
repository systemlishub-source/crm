import { Button } from "primereact/button";
import { User } from "../page";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { classNames } from "primereact/utils";
import { InputMask } from "primereact/inputmask";
import { Dropdown } from "primereact/dropdown";
interface UserDialogProps {
    open: boolean;
    onClose: () => void;
    user: User;
    setUser: (user: User) => void;
    submitted: boolean;
    handleUser: () => void;
    typeEdit?: boolean;
}

export const UserDialog = ({ open, onClose, user, setUser, submitted, handleUser, typeEdit }: UserDialogProps) => {

    const fetchAddressByCEP = async (cep: string) => {

        try {
            // Remove caracteres não numéricos
            const cleanCEP = cep.replace(/\D/g, '');

            if (cleanCEP.length !== 8) return; // CEP incompleto

            const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
            const data = await response.json();

            if (!data.erro) {
                // Atualiza os campos de endereço
                setUser({
                    ...user,
                    address: {
                        ...user.address,
                        cep: data.cep || '',
                        street: data.logradouro || '',
                        district: data.bairro || '',
                        city: data.localidade || '',
                        state: data.uf || '',
                        country: 'Brasil', // Define como Brasil por padrão
                        complement: data.complemento || ''
                    }
                });
            } else {
                console.log('CEP não encontrado');
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
        }
    }

    const onInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        name: string
    ) => {
        const val = (e.target && e.target.value) || '';
        setUser({ ...user, [name]: val });
    };

    const onAddressChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof User['address']) => {
        const { value } = e.target;
        setUser({
            ...user,
            address: {
                ...user.address,
                [field]: value
            }
        });
    };

    // Components
    const UserDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={onClose} />
            <Button label="Salvar" icon="pi pi-check" text onClick={() =>  handleUser() } />
        </>
    );


    return (

        <Dialog visible={open} style={{ width: '700px' }} header="Novo Usuário" modal className="p-fluid" footer={UserDialogFooter} onHide={onClose}>
            <div className="grid formgrid">
                {/* Dados Pessoais */}
                <div className="field col-12 md:col-6">
                    <label htmlFor="name">Nome <span style={{ color: 'red' }}>*</span></label>
                    <InputText
                        id="name"
                        value={user.name}
                        onChange={(e) => onInputChange(e, 'name')}
                        required
                        autoFocus
                        className={classNames({ 'p-invalid': submitted && !user.name })}
                    />
                    {submitted && !user.name && <small className="p-invalid">O nome é obrigatório </small>}
                </div>

                <div className="field col-12 md:col-6">
                    <label htmlFor="email">E-mail <span style={{ color: 'red' }}>*</span></label>
                    <InputText
                        id="email"
                        value={user.email}
                        onChange={(e) => onInputChange(e, 'email')}
                        required
                        className={classNames({ 'p-invalid': submitted && !user.email })}
                    />
                    {submitted && !user.email && <small className="p-invalid">O e-mail é obrigatório</small>}
                </div>
                {!typeEdit &&
                    <div className="field col-12 md:col-6">
                        <label htmlFor="password">Senha <span style={{ color: 'red' }}>*</span></label>
                        <InputText
                            id="password"
                            value={user.password}
                            onChange={(e) => onInputChange(e, 'password')}
                            required
                            className={classNames({ 'p-invalid': submitted && !user.password })}
                        />
                        {submitted && !user.password && <small className="p-invalid">A Senha é obrigatória</small>}
                    </div>
                }

                <div className="field col-12 md:col-6">
                    <label htmlFor="cpf">CPF <span style={{ color: 'red' }}>*</span></label>
                    <InputText
                        id="cpf"
                        value={user.cpf}
                        onChange={(e) => onInputChange(e, 'cpf')}
                        placeholder="Digite somente números"
                        onBlur={(e) => {
                            const digits = e.target.value.replace(/\D/g, '');
                            let maskedValue = digits;

                            if (digits.length === 11) {
                                maskedValue = digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                            }

                            setUser({ ...user, cpf: maskedValue });
                        }}
                        className={classNames({ 'p-invalid': submitted && !user.cpf })}
                        required
                    />
                    {submitted && !user.cpf && <small className="p-invalid">CPF é obrigatório!</small>}
                    {user.cpf && ![11].includes(user.cpf.replace(/\D/g, '').length) && (
                        <small className="p-invalid">Documento inválido (CPF 11 dígitos)</small>
                    )}
                </div>

                <div className="field col-12 md:col-6">
                    <label htmlFor="phoneNumber">Telefone <span style={{ color: 'red' }}>*</span></label>
                    <InputMask
                        id="phoneNumber"
                        value={user.phoneNumber}
                        onChange={(e: any) => onInputChange(e, 'phoneNumber')}
                        mask="(99) 99999-9999"
                        placeholder="(00) 00000-0000"
                        required
                        className={classNames({ 'p-invalid': submitted && !user.phoneNumber })}
                    />
                    {submitted && !user.phoneNumber && <small className="p-invalid">O Telefone é obrigatório</small>}
                </div>

                <div className="field col-12 md:col-6">
                    <label htmlFor="role">Permissão <span style={{ color: 'red' }}>*</span></label>
                    <Dropdown
                        value={user.role}
                        onChange={(e) => setUser({ ...user, role: e.value })}
                        options={['Administrador', 'UsuarioPadrao']}
                        placeholder="Selecione"
                        className={classNames({ 'p-invalid': submitted && !user.role })}
                    />
                    {submitted && !user.role && <small className="p-invalid">A permissão é obrigatória</small>}
                </div>

                {/* Separador para Endereço */}
                <div className="col-12">
                    <div className="flex align-items-center mt-4 mb-3">
                        <div className="border-top-1 surface-border flex-grow-1"></div>
                        <span className="px-3 text-600 font-medium">Endereço</span>
                        <div className="border-top-1 surface-border flex-grow-1"></div>
                    </div>
                </div>

                {/* Campos de Endereço */}
                <div className="field col-12 md:col-4">
                    <label htmlFor="cep">CEP <span style={{ color: 'red' }}>*</span></label>
                    <InputMask
                        id="cep"
                        value={user.address.cep}
                        onChange={(e: any) => {
                            onAddressChange(e, 'cep')
                            if (e.target.value.replace(/\D/g, '').length === 8) {
                                fetchAddressByCEP(e.target.value);
                            }
                        }}
                        mask="99999-999"
                        placeholder="00000-000"
                        required
                        className={classNames({ 'p-invalid': submitted && !user.address.cep })}
                    />
                    {submitted && !user.address.cep && <small className="p-invalid">CEP é obrigatório</small>}
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="country">País <span style={{ color: 'red' }}>*</span></label>
                    <InputText
                        id="country"
                        value={user.address.country}
                        onChange={(e) => onAddressChange(e, 'country')}
                        required
                        className={classNames({ 'p-invalid': submitted && !user.address.country })}
                    />
                    {submitted && !user.address.country && <small className="p-invalid">País é obrigatório</small>}
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="state">Estado <span style={{ color: 'red' }}>*</span></label>
                    <InputText
                        id="state"
                        value={user.address.state}
                        onChange={(e) => onAddressChange(e, 'state')}
                        required
                        className={classNames({ 'p-invalid': submitted && !user.address.state })}
                    />
                    {submitted && !user.address.state && <small className="p-invalid">Estado é obrigatório</small>}
                </div>

                <div className="field col-12 md:col-6">
                    <label htmlFor="city">Cidade <span style={{ color: 'red' }}>*</span></label>
                    <InputText
                        id="city"
                        value={user.address.city}
                        onChange={(e) => onAddressChange(e, 'city')}
                        required
                        className={classNames({ 'p-invalid': submitted && !user.address.city })}
                    />
                    {submitted && !user.address.city && <small className="p-invalid">Cidade é obrigatória</small>}
                </div>

                <div className="field col-12 md:col-6">
                    <label htmlFor="district">Bairro <span style={{ color: 'red' }}>*</span></label>
                    <InputText
                        id="district"
                        value={user.address.district}
                        onChange={(e) => onAddressChange(e, 'district')}
                        required
                        className={classNames({ 'p-invalid': submitted && !user.address.district })}
                    />
                    {submitted && !user.address.district && <small className="p-invalid">Bairro é obrigatório</small>}
                </div>

                <div className="field col-12">
                    <label htmlFor="street">Rua <span style={{ color: 'red' }}>*</span></label>
                    <InputText
                        id="street"
                        value={user.address.street}
                        onChange={(e) => onAddressChange(e, 'street')}
                        required
                        className={classNames({ 'p-invalid': submitted && !user.address.street })}
                    />
                    {submitted && !user.address.street && <small className="p-invalid">Rua é obrigatória</small>}
                </div>

                <div className="field col-12">
                    <label htmlFor="complement">Complemento</label>
                    <InputText
                        id="complement"
                        value={user.address.complement}
                        onChange={(e) => onAddressChange(e, 'complement')}
                        placeholder="Opcional"
                    />
                </div>
            </div>
        </Dialog>

    )
}