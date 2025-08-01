import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Modal from '../components/Modal';
import { useCompany } from '../context/CompanyContext';
import { copyToClipboard, showCopyNotification } from '../lib/utils';
import { 
  updateCompany, 
  uploadAvatar, 
  getBankDataByCompany, 
  getMobilePaymentDataByCompany, 
  upsertBankData, 
  upsertMobilePaymentData,
  getBanks 
} from '../supabase/data';

export default function Perfil() {
    const { companyData, updateCompanyData, isEditing, setIsEditing } = useCompany();
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [loading, setLoading] = useState(false);
    const [popup, setPopup] = useState<{ open: boolean; message: string; success: boolean }>({ open: false, message: '', success: false });
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form data state
    const [formData, setFormData] = useState({
        description: '',
        paymentMethods: {
            creditCard: true,
            bankTransfer: true,
            mobilePayment: true,
            paypal: true,
            cash: false
        },
        bankInfo: {
            bankCode: '',
            bankName: '',
            accountNumber: '',
            accountHolder: '',
            accountType: 'Cuenta Corriente Empresarial'
        },
        mobilePaymentInfo: {
            phoneNumber: '',
            rif: '',
            bankCode: '',
            bankName: ''
        },
        contactInfo: {
            paypalEmail: '',
            businessPhone: ''
        }
    });

    // Cargar datos de la empresa y métodos de pago
    useEffect(() => {
        const loadData = async () => {
            if (!companyData?.id) return;
            
            setLoading(true);
            try {
                // Cargar descripción desde companyData
                setFormData(prev => ({
                    ...prev,
                    description: companyData.descripcion || '',
                    contactInfo: {
                        ...prev.contactInfo,
                        businessPhone: companyData.telefono || ''
                    }
                }));

                // Cargar datos bancarios
                const bankResult = await getBankDataByCompany(companyData.id);
                if (bankResult.success && bankResult.data && bankResult.data.length > 0) {
                    const bankData = bankResult.data[0];
                    setFormData(prev => ({
                        ...prev,
                        bankInfo: {
                            bankCode: bankData.codigobanco,
                            bankName: (bankData.bancos as any)?.nombre || '',
                            accountNumber: bankData.nro_cuenta,
                            accountHolder: companyData.razonsocial || '',
                            accountType: 'Cuenta Corriente Empresarial'
                        }
                    }));
                }

                // Cargar datos de pago móvil
                const mobileResult = await getMobilePaymentDataByCompany(companyData.id);
                if (mobileResult.success && mobileResult.data && mobileResult.data.length > 0) {
                    const mobileData = mobileResult.data[0];
                    setFormData(prev => ({
                        ...prev,
                        mobilePaymentInfo: {
                            phoneNumber: mobileData.telefono,
                            rif: mobileData.cedula_rif,
                            bankCode: mobileData.codigobanco,
                            bankName: (mobileData.bancos as any)?.nombre || ''
                        }
                    }));
                }

            } catch (error) {
                console.error('Error cargando datos:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [companyData]);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !companyData) return;

        setUploadingAvatar(true);
        try {
            const result = await uploadAvatar(file, companyData.id);
            if ((result as any).success && (result as any).url) {
                // Actualizar el avatar en la base de datos
                const updateResult = await updateCompany(companyData.id, {
                    rif: companyData.rif || '',
                    razonsocial: companyData.razonsocial || '',
                    descripcion: companyData.descripcion || '',
                    direccion: companyData.direccion || '',
                    telefono: companyData.telefono || '',
                    fecha_fundacion: companyData.fecha_fundacion || '',
                    avatar: (result as any).url
                });
                if (updateResult.success) {
                    updateCompanyData({ avatar: (result as any).url });
                    setPopup({ open: true, message: 'Avatar actualizado con éxito!', success: true });
                } else {
                    setPopup({ open: true, message: updateResult.message, success: false });
                }
            } else {
                setPopup({ open: true, message: (result as any).message || 'Error al subir el avatar', success: false });
            }
        } catch (error) {
            console.error('Error uploading avatar:', error);
            setPopup({ open: true, message: 'Error al subir el avatar', success: false });
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleEditClick = () => {
        setIsEditing(!isEditing);
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNestedInputChange = (parent: string, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...(prev[parent as keyof typeof prev] as any),
                [field]: value
            }
        }));
    };

    const handlePaymentMethodChange = (method: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            paymentMethods: {
                ...prev.paymentMethods,
                [method]: checked
            }
        }));
    };

    const handlePaymentMethodClick = (method: string) => {
        // Solo mostrar modal si el método está habilitado
        if (formData.paymentMethods[method as keyof typeof formData.paymentMethods]) {
            setSelectedPaymentMethod(method);
        }
    };

    const handleCloseModal = () => {
        setSelectedPaymentMethod(null);
    };

    const handleSave = async () => {
        if (!companyData?.id) return;
        
        setLoading(true);
        try {
            // Actualizar descripción en la empresa
            const updateResult = await updateCompany(companyData.id, {
                rif: companyData.rif || '',
                razonsocial: companyData.razonsocial || '',
                descripcion: formData.description,
                direccion: companyData.direccion || '',
                telefono: formData.contactInfo.businessPhone,
                fecha_fundacion: companyData.fecha_fundacion || ''
            });

            if (updateResult.success) {
                updateCompanyData({
                    descripcion: formData.description,
                    telefono: formData.contactInfo.businessPhone
                });

                // Guardar datos bancarios si están habilitados
                if (formData.paymentMethods.bankTransfer && formData.bankInfo.bankCode) {
                    await upsertBankData({
                        id_empresa: companyData.id,
                        codigobanco: formData.bankInfo.bankCode,
                        nro_cuenta: formData.bankInfo.accountNumber,
                        rif_cedula: companyData.rif
                    });
                }

                // Guardar datos de pago móvil si están habilitados
                if (formData.paymentMethods.mobilePayment && formData.mobilePaymentInfo.bankCode) {
                    await upsertMobilePaymentData({
                        id_empresa: companyData.id,
                        codigobanco: formData.mobilePaymentInfo.bankCode,
                        cedula_rif: formData.mobilePaymentInfo.rif,
                        telefono: formData.mobilePaymentInfo.phoneNumber
                    });
                }

                setPopup({ open: true, message: 'Datos guardados exitosamente!', success: true });
                setIsEditing(false);
            } else {
                setPopup({ open: true, message: updateResult.message, success: false });
            }
        } catch (error) {
            console.error('Error guardando datos:', error);
            setPopup({ open: true, message: 'Error al guardar los datos', success: false });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        // Reset form data to original values
        setIsEditing(false);
    };

    const getPaymentMethodData = (method: string) => {
        switch (method) {
            case 'mobilePayment':
                return {
                    title: 'Datos para Pago Móvil',
                    icon: '',
                    color: 'purple',
                    data: [
                        { label: 'Teléfono', value: formData.mobilePaymentInfo.phoneNumber, copy: true },
                        { label: 'RIF', value: formData.mobilePaymentInfo.rif, copy: true },
                        { label: 'Banco', value: formData.mobilePaymentInfo.bankName, copy: true }
                    ]
                };
            case 'bankTransfer':
                return {
                    title: 'Datos para Transferencias Bancarias',
                    icon: '',
                    color: 'green',
                    data: [
                        { label: 'Banco', value: formData.bankInfo.bankName, copy: false },
                        { label: 'Titular', value: formData.bankInfo.accountHolder, copy: false },
                        { label: 'Cuenta', value: `****${formData.bankInfo.accountNumber.slice(-4)}`, copy: false },
                        { label: 'Tipo', value: formData.bankInfo.accountType, copy: false }
                    ]
                };
            case 'paypal':
                return {
                    title: 'Datos para PayPal',
                    icon: '',
                    color: 'orange',
                    data: [
                        { label: 'Email', value: formData.contactInfo.paypalEmail, copy: true }
                    ]
                };
            case 'creditCard':
                return {
                    title: 'Información de Tarjetas',
                    icon: '',
                    color: 'blue',
                    data: [
                        { label: 'Estado', value: 'Aceptamos tarjetas de crédito y débito', copy: false },
                        { label: 'Procesadores', value: 'Visa, Mastercard, American Express', copy: false },
                        { label: 'Seguridad', value: 'Transacciones seguras con encriptación SSL', copy: false }
                    ]
                };
            case 'cash':
                return {
                    title: 'Pago en Efectivo',
                    icon: '',
                    color: 'yellow',
                    data: [
                        { label: 'Estado', value: 'No disponible actualmente', copy: false },
                        { label: 'Información', value: 'Este método de pago está deshabilitado', copy: false }
                    ]
                };
            default:
                return null;
        }
    };

    const paymentMethodData = selectedPaymentMethod ? getPaymentMethodData(selectedPaymentMethod) : null;

    // Cerrar popup automáticamente después de 2.5s
    useEffect(() => {
        if (popup.open) {
            const timer = setTimeout(() => setPopup({ ...popup, open: false }), 2500);
            return () => clearTimeout(timer);
        }
    }, [popup]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Cargando datos del perfil...</div>;
    }

    if (!companyData) {
        return <div className="min-h-screen flex items-center justify-center">No se encontraron datos de la empresa.</div>;
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 w-full overflow-y-auto"
        >
            {popup.open && (
                <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg text-white ${popup.success ? 'bg-green-600' : 'bg-red-600'}`}>
                    {popup.message}
                </div>
            )}
            {/* Header with Profile Info */}
            <motion.div 
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-white shadow-sm border-b border-gray-100"
            >
                <div className="container mx-auto px-6 py-8">
                    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 max-w-7xl mx-auto">
                        {/* Profile Picture Section */}
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="relative flex-shrink-0"
                        >
                            <motion.div 
                                whileHover={{ scale: 1.05 }}
                                className={`w-32 h-32 lg:w-40 lg:h-40 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                                    companyData.avatar 
                                        ? 'bg-cover bg-center' 
                                        : 'bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-600)]'
                                }`}
                                style={companyData.avatar ? { backgroundImage: `url(${companyData.avatar})` } : {}}
                            >
                            </motion.div>
                            
                            {/* Edit Icon */}
                            {isEditing && (
                                <div 
                                    className="absolute -bottom-2 -right-2 w-10 h-10 bg-[var(--color-secondary-500)] rounded-full flex items-center justify-center cursor-pointer hover:bg-[var(--color-secondary-600)] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </div>
                            )}
                            
                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </motion.div>
                        
                        {/* Company Info */}
                        <motion.div 
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="flex-1 text-center lg:text-left min-w-0"
                        >
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 leading-tight">
                                        {companyData.nombrecomercial}
                                    </h1>
                                    <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed font-medium">
                                        {companyData.razonsocial}
                                    </p>
                                </div>
                                
                                <div className="flex items-center justify-center lg:justify-start gap-2 text-sm text-gray-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>Miembro desde Enero 2024</span>
                                </div>
                            </div>
                            
                            <div className="mt-8">
                                <button 
                                    onClick={handleEditClick}
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--color-secondary-400)] text-white rounded-full font-medium hover:bg-[var(--color-secondary-500)] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-base"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Editar Información
                                </button>
                            </div>
                            

                        </motion.div>
                        
                        {/* Profile Stats Section - Only visible on desktop and when not editing */}
                        <div className={`hidden lg:flex flex-col justify-center flex-1 py-5 max-w-[350px] transition-all duration-300 ${isEditing ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100 shadow-sm h-fit">
                                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    Estadísticas del perfil
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-blue-200">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-gray-700">Métodos de pago</span>
                                        </div>
                                        <span className="text-sm font-bold text-blue-600">
                                            {Object.values(formData.paymentMethods).filter(Boolean).length}/5
                                        </span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-200">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-gray-700">Última actualización</span>
                                        </div>
                                        <span className="text-xs font-semibold text-gray-800">Hoy</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Main Content */}
            <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="container mx-auto px-6 py-8 pb-25"
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {/* About Us Card */}
                    <motion.div 
                        whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-80"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">
                                Sobre nosotros
                            </h2>
                        </div>
                        
                        <div className="rounded-xl p-6 h-48">
                            {isEditing ? (
                                <textarea 
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none h-full break-words"
                                    placeholder="Cuéntanos sobre tu empresa, su misión, visión y valores..."
                                    style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                                />
                            ) : (
                                <div className="h-full overflow-y-auto">
                                    <p className="text-gray-700 leading-relaxed text-lg break-words">
                                        {formData.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Payment Methods Card */}
                    <motion.div 
                        whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-80"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">
                                Métodos de pago
                            </h2>
                        </div>
                        
                        <div className="rounded-xl p-6 ">
                            {isEditing ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="relative">
                                            <input 
                                                type="checkbox" 
                                                id="credit-card" 
                                                checked={formData.paymentMethods.creditCard}
                                                onChange={(e) => handlePaymentMethodChange('creditCard', e.target.checked)}
                                                className="sr-only" 
                                            />
                                            <label 
                                                htmlFor="credit-card" 
                                                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                                                    formData.paymentMethods.creditCard 
                                                        ? 'border-[var(--color-secondary-500)] bg-[var(--color-secondary-50)] shadow-sm' 
                                                        : 'border-gray-200 bg-white hover:border-[var(--color-secondary-300)]'
                                                }`}
                                            >
                                                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                                                    formData.paymentMethods.creditCard 
                                                        ? 'border-[var(--color-secondary-500)] bg-[var(--color-secondary-500)]' 
                                                        : 'border-gray-300 bg-white'
                                                }`}>
                                                    {formData.paymentMethods.creditCard && (
                                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <span className="font-medium text-gray-800">Tarjeta</span>
                                            </label>
                                        </div>
                                        
                                        <div className="relative">
                                            <input 
                                                type="checkbox" 
                                                id="bank-transfer" 
                                                checked={formData.paymentMethods.bankTransfer}
                                                onChange={(e) => handlePaymentMethodChange('bankTransfer', e.target.checked)}
                                                className="sr-only" 
                                            />
                                            <label 
                                                htmlFor="bank-transfer" 
                                                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                                                    formData.paymentMethods.bankTransfer 
                                                        ? 'border-[var(--color-secondary-500)] bg-[var(--color-secondary-50)] shadow-sm' 
                                                        : 'border-gray-200 bg-white hover:border-[var(--color-secondary-300)]'
                                                }`}
                                            >
                                                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                                                    formData.paymentMethods.bankTransfer 
                                                        ? 'border-[var(--color-secondary-500)] bg-[var(--color-secondary-500)]' 
                                                        : 'border-gray-300 bg-white'
                                                }`}>
                                                    {formData.paymentMethods.bankTransfer && (
                                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <span className="font-medium text-gray-800">Transferencia</span>
                                            </label>
                                        </div>
                                        
                                        <div className="relative">
                                            <input 
                                                type="checkbox" 
                                                id="mobile-payment" 
                                                checked={formData.paymentMethods.mobilePayment}
                                                onChange={(e) => handlePaymentMethodChange('mobilePayment', e.target.checked)}
                                                className="sr-only" 
                                            />
                                            <label 
                                                htmlFor="mobile-payment" 
                                                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                                                    formData.paymentMethods.mobilePayment 
                                                        ? 'border-[var(--color-secondary-500)] bg-[var(--color-secondary-50)] shadow-sm' 
                                                        : 'border-gray-200 bg-white hover:border-[var(--color-secondary-300)]'
                                                }`}
                                            >
                                                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                                                    formData.paymentMethods.mobilePayment 
                                                        ? 'border-[var(--color-secondary-500)] bg-[var(--color-secondary-500)]' 
                                                        : 'border-gray-300 bg-white'
                                                }`}>
                                                    {formData.paymentMethods.mobilePayment && (
                                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <span className="font-medium text-gray-800">Pago móvil</span>
                                            </label>
                                        </div>
                                        
                                        <div className="relative">
                                            <input 
                                                type="checkbox" 
                                                id="paypal" 
                                                checked={formData.paymentMethods.paypal}
                                                onChange={(e) => handlePaymentMethodChange('paypal', e.target.checked)}
                                                className="sr-only" 
                                            />
                                            <label 
                                                htmlFor="paypal" 
                                                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                                                    formData.paymentMethods.paypal 
                                                        ? 'border-[var(--color-secondary-500)] bg-[var(--color-secondary-50)] shadow-sm' 
                                                        : 'border-gray-200 bg-white hover:border-[var(--color-secondary-300)]'
                                                }`}
                                            >
                                                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                                                    formData.paymentMethods.paypal 
                                                        ? 'border-[var(--color-secondary-500)] bg-[var(--color-secondary-500)]' 
                                                        : 'border-gray-300 bg-white'
                                                }`}>
                                                    {formData.paymentMethods.paypal && (
                                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <span className="font-medium text-gray-800">PayPal</span>
                                            </label>
                                        </div>
                                        
                                        <div className="relative">
                                            <input 
                                                type="checkbox" 
                                                id="cash" 
                                                checked={formData.paymentMethods.cash}
                                                onChange={(e) => handlePaymentMethodChange('cash', e.target.checked)}
                                                className="sr-only" 
                                            />
                                            <label 
                                                htmlFor="cash" 
                                                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                                                    formData.paymentMethods.cash 
                                                        ? 'border-[var(--color-secondary-500)] bg-[var(--color-secondary-50)] shadow-sm' 
                                                        : 'border-gray-200 bg-white hover:border-[var(--color-secondary-300)]'
                                                }`}
                                            >
                                                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                                                    formData.paymentMethods.cash 
                                                        ? 'border-[var(--color-secondary-500)] bg-[var(--color-secondary-500)]' 
                                                        : 'border-gray-300 bg-white'
                                                }`}>
                                                    {formData.paymentMethods.cash && (
                                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <span className="font-medium text-gray-800">Efectivo</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-gray-600 mb-4">Haz clic en cualquier método de pago para ver los datos correspondientes:</p>
                                    <div className="flex flex-wrap gap-3">
                                        {formData.paymentMethods.creditCard && (
                                            <span 
                                                onClick={() => handlePaymentMethodClick('creditCard')}
                                                className="px-4 py-2 bg-[var(--color-secondary-300)] text-[var(--color-secondary-700)] rounded-full text-sm font-medium cursor-pointer hover:bg-[var(--color-secondary-400)] hover:text-[var(--color-secondary-100)] transition-colors"
                                            >Tarjeta</span>
                                        )}
                                        {formData.paymentMethods.bankTransfer && (
                                            <span 
                                                onClick={() => handlePaymentMethodClick('bankTransfer')}
                                                className="px-4 py-2 bg-[var(--color-secondary-300)] text-[var(--color-secondary-700)] rounded-full text-sm font-medium cursor-pointer hover:bg-[var(--color-secondary-400)] hover:text-[var(--color-secondary-100)] transition-colors"
                                            >Transferencia</span>
                                        )}
                                        {formData.paymentMethods.mobilePayment && (
                                            <span 
                                                onClick={() => handlePaymentMethodClick('mobilePayment')}
                                                className="px-4 py-2 bg-[var(--color-secondary-300)] text-[var(--color-secondary-700)] rounded-full text-sm font-medium cursor-pointer hover:bg-[var(--color-secondary-400)] hover:text-[var(--color-secondary-100)] transition-colors"
                                            >Pago móvil</span>
                                        )}
                                        {formData.paymentMethods.paypal && (
                                            <span 
                                                onClick={() => handlePaymentMethodClick('paypal')}
                                                className="px-4 py-2 bg-[var(--color-secondary-300)] text-[var(--color-secondary-700)] rounded-full text-sm font-medium cursor-pointer hover:bg-[var(--color-secondary-400)] hover:text-[var(--color-secondary-100)] transition-colors"
                                            >PayPal</span>
                                        )}
                                        {formData.paymentMethods.cash && (
                                            <span 
                                                onClick={() => handlePaymentMethodClick('cash')}
                                                className="px-4 py-2 bg-[var(--color-secondary-300)] text-[var(--color-secondary-700)] rounded-full text-sm font-medium cursor-pointer hover:bg-[var(--color-secondary-400)] hover:text-[var(--color-secondary-100)] transition-colors"
                                            >Efectivo</span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Payment Data Fields Section - Only visible when editing */}
                {isEditing && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="mt-8 max-w-6xl mx-auto"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Bank Transfer Data Fields */}
                            {formData.paymentMethods.bankTransfer && (
                                <motion.div 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: 0.1 }}
                                    whileHover={{ y: -3 }}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                                >
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        Datos para Transferencias Bancarias
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Banco</label>
                                            <input
                                                type="text"
                                                value={formData.bankInfo.bankName}
                                                onChange={(e) => handleNestedInputChange('bankInfo', 'bankName', e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Titular de la cuenta</label>
                                            <input
                                                type="text"
                                                value={formData.bankInfo.accountHolder}
                                                onChange={(e) => handleNestedInputChange('bankInfo', 'accountHolder', e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Número de cuenta</label>
                                            <input
                                                type="text"
                                                value={formData.bankInfo.accountNumber}
                                                onChange={(e) => handleNestedInputChange('bankInfo', 'accountNumber', e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de cuenta</label>
                                            <input
                                                type="text"
                                                value={formData.bankInfo.accountType}
                                                onChange={(e) => handleNestedInputChange('bankInfo', 'accountType', e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Mobile Payment Data Fields */}
                            {formData.paymentMethods.mobilePayment && (
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: 0.2 }}
                                    whileHover={{ y: -3, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                                >
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        Datos para Pago Móvil
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Número de teléfono</label>
                                            <input
                                                type="text"
                                                value={formData.mobilePaymentInfo.phoneNumber}
                                                onChange={(e) => handleNestedInputChange('mobilePaymentInfo', 'phoneNumber', e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">RIF</label>
                                            <input
                                                type="text"
                                                value={formData.mobilePaymentInfo.rif}
                                                onChange={(e) => handleNestedInputChange('mobilePaymentInfo', 'rif', e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Banco</label>
                                            <input
                                                type="text"
                                                value={formData.mobilePaymentInfo.bankName}
                                                onChange={(e) => handleNestedInputChange('mobilePaymentInfo', 'bankName', e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* PayPal Data Fields */}
                            {formData.paymentMethods.paypal && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.3 }}
                                    whileHover={{ y: -3, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                                >
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        Datos para PayPal
                                    </h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email de PayPal</label>
                                        <input
                                            type="email"
                                            value={formData.contactInfo.paypalEmail}
                                            onChange={(e) => handleNestedInputChange('contactInfo', 'paypalEmail', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {/* Contact Info Fields */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.4 }}
                                whileHover={{ y: -3, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                            >
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    Información de Contacto
                                </h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono de la empresa</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={formData.contactInfo.businessPhone}
                                            onChange={(e) => handleNestedInputChange('contactInfo', 'businessPhone', e.target.value)}
                                            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}

                {/* Save/Cancel buttons when editing */}
                {isEditing && (
                    <div className="flex gap-4  mt-5 justify-center mb-15">
                        <button 
                            onClick={handleSave}
                            className="inline-flex items-center gap-2 px-8 py-3 bg-[var(--color-secondary-400)] text-white rounded-full font-medium hover:bg-[var(--color-secondary-500)] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            Guardar Cambios
                        </button>
                        <button 
                            onClick={handleCancel}
                            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border border-[var(--color-secondary-400)]"
                        >
                            Cancelar
                        </button>
                    </div>
                )}
            </motion.div>

            {/* Modal for payment method details */}
            <Modal
                open={!!selectedPaymentMethod}
                onClose={handleCloseModal}
                title={paymentMethodData?.title}
                size="lg"
            >
                {paymentMethodData && (
                    <div className="space-y-3 max-w-4xl mx-auto">
                        
                        <div className="space-y-2">
                            {paymentMethodData?.data.map((item, index) => (
                                <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 rounded-lg gap-2">
                                    <span className="text-sm font-medium text-gray-600 min-w-[80px] flex-shrink-0">{item.label}:</span>
                                    <div className="flex items-center gap-3 flex-1 justify-end min-w-0">
                                        <span className="font-mono text-sm font-medium text-gray-800 break-words overflow-hidden" title={item.value as string}>
                                            {item.value}
                                        </span>
                                        {item.copy && (
                                            <button
                                                onClick={async () => {
                                                    const success = await copyToClipboard(item.value as string);
                                                    showCopyNotification(success, `¡${item.label} copiado!`);
                                                }}
                                                className="text-xs text-[var(--color-secondary-500)] hover:text-[var(--color-secondary-600)] underline hover:bg-[var(--color-secondary-50)] px-2 py-1 rounded transition-colors whitespace-nowrap flex-shrink-0"
                                            >
                                                Copiar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {paymentMethodData?.color === 'green' && (
                            <button
                                onClick={async () => {
                                    const bankData = `Banco: ${formData.bankInfo.bankName}\nTitular: ${formData.bankInfo.accountHolder}\nCuenta: ${formData.bankInfo.accountNumber}\nTipo: ${formData.bankInfo.accountType}`;
                                    const success = await copyToClipboard(bankData);
                                    showCopyNotification(success, '¡Datos bancarios copiados!');
                                }}
                                className="w-full mt-4 px-6 py-3 bg-[var(--color-secondary-500)] text-white rounded-lg hover:bg-[var(--color-secondary-600)] transition-colors text-base font-medium"
                            >
                                Copiar datos bancarios completos
                            </button>
                        )}
                        
                        {paymentMethodData?.color === 'purple' && (
                            <button
                                onClick={async () => {
                                    const mobileData = `Teléfono: ${formData.mobilePaymentInfo.phoneNumber}\nRIF: ${formData.mobilePaymentInfo.rif}\nBanco: ${formData.mobilePaymentInfo.bankName}`;
                                    const success = await copyToClipboard(mobileData);
                                    showCopyNotification(success, '¡Datos de pago móvil copiados!');
                                }}
                                className="w-full mt-4 px-6 py-3 bg-[var(--color-secondary-500)] text-white rounded-lg hover:bg-[var(--color-secondary-600)] transition-colors text-base font-medium"
                            >
                                Copiar datos de pago móvil completos
                            </button>
                        )}
                    </div>
                )}
            </Modal>
        </motion.div>
    );
} 