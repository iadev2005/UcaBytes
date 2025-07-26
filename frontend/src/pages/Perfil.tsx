import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../components/Modal';
import { useCompany } from '../context/CompanyContext';

export default function Perfil() {
    const { companyData, updateCompanyData, isEditing, setIsEditing } = useCompany();
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form data state
    const [formData, setFormData] = useState({
        companyName: companyData.name,
        companyType: companyData.type,
        description: companyData.description,
        paymentMethods: {
            creditCard: true,
            bankTransfer: true,
            mobilePayment: true,
            paypal: true,
            cash: false
        },
        bankInfo: {
            bankName: 'Banco Azteca',
            accountNumber: '1234567890',
            accountHolder: 'Nombre Empresa S.A. de C.V.',
            accountType: 'Cuenta Corriente Empresarial'
        },
        mobilePaymentInfo: {
            phoneNumber: '55-1234-5678',
            rif: 'J-12345678-9',
            bankName: 'Banco de Venezuela'
        },
        contactInfo: {
            paypalEmail: 'pagos@nombreempresa.com',
            businessPhone: '55-9876-5432'
        }
    });

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                updateCompanyData({ profileImage: e.target?.result as string });
            };
            reader.readAsDataURL(file);
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

    const handleSave = () => {
        // Actualizar el contexto con los nuevos datos
        updateCompanyData({
            name: formData.companyName,
            type: formData.companyType,
            description: formData.description
        });
        console.log('Datos guardados:', formData);
        setIsEditing(false);
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

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 w-full overflow-y-auto"
        >
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
                                    companyData.profileImage 
                                        ? 'bg-cover bg-center' 
                                        : 'bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-600)]'
                                }`}
                                style={companyData.profileImage ? { backgroundImage: `url(${companyData.profileImage})` } : { backgroundImage: `url('${companyData.avatar}')` }}
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
                            {isEditing ? (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-600 text-center lg:text-left">
                                            Nombre de la empresa
                                        </label>
                                    <input
                                        type="text"
                                        value={formData.companyName}
                                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                                            className="w-full text-2xl lg:text-3xl font-bold text-gray-800 bg-transparent border-b-2 border-blue-300 focus:outline-none focus:border-blue-500 text-center lg:text-left px-2 py-1"
                                            placeholder="Ingresa el nombre de tu empresa"
                                    />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-600 text-center lg:text-left">
                                            Tipo de empresa
                                        </label>
                                    <input
                                        type="text"
                                        value={formData.companyType}
                                        onChange={(e) => handleInputChange('companyType', e.target.value)}
                                            className="w-full text-lg lg:text-xl text-gray-600 bg-transparent border-b-2 border-blue-300 focus:outline-none focus:border-blue-500 text-center lg:text-left px-2 py-1"
                                            placeholder="Ej: Empresa de Tecnología, Restaurante, etc."
                                    />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col justify-center h-full min-h-[200px] lg:min-h-[240px]">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 leading-tight">
                                        {formData.companyName}
                                    </h1>
                                            <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed font-medium">
                                        {formData.companyType}
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
                                            Editar Perfil
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            {isEditing && (
                                <div className="mt-6 space-y-4">
                                    <p className="text-sm text-gray-500">
                                Miembro desde Enero 2024
                            </p>
                            
                            {/* Edit Button */}
                            <button 
                                onClick={handleEditClick}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-secondary-400)] text-white rounded-full font-medium hover:bg-[var(--color-secondary-500)] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Cancelar
                                    </button>
                                </div>
                            )}
                        </motion.div>
                        
                        {/* Profile Stats Section - Only visible on desktop and when not editing */}
                        <div className={`hidden lg:flex flex-col justify-center flex-1 max-w-[350px] transition-all duration-300 ${isEditing ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100 shadow-sm h-fit">
                                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    Estadísticas del perfil
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-blue-200">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 bg-blue-100 rounded-md flex items-center justify-center">
                                                <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                </svg>
                                            </div>
                                            <span className="text-xs font-medium text-gray-700">Métodos de pago</span>
                                        </div>
                                        <span className="text-sm font-bold text-blue-600">
                                            {Object.values(formData.paymentMethods).filter(Boolean).length}/5
                                        </span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-green-200">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 bg-green-100 rounded-md flex items-center justify-center">
                                                <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <span className="text-xs font-medium text-gray-700">Perfil completo</span>
                                        </div>
                                        <span className="text-sm font-bold text-green-600">85%</span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-200">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 bg-gray-100 rounded-md flex items-center justify-center">
                                                <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <span className="text-xs font-medium text-gray-700">Última actualización</span>
                                        </div>
                                        <span className="text-xs font-semibold text-gray-800">Hoy</span>
                                    </div>
                                </div>
                                
                                <div className="mt-3 pt-2 border-t border-blue-200">
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>Estado del perfil</span>
                                        <span className="font-medium text-blue-600">Activo</span>
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
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-96"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">
                                Sobre nosotros
                            </h2>
                        </div>
                        
                        <div className="rounded-xl p-6 h-64">
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
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-96"
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
                                                        ? 'border-blue-500 bg-blue-50 shadow-sm' 
                                                        : 'border-gray-200 bg-white hover:border-blue-300'
                                                }`}
                                            >
                                                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                                                    formData.paymentMethods.creditCard 
                                                        ? 'border-blue-500 bg-blue-500' 
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
                                                        ? 'border-green-500 bg-green-50 shadow-sm' 
                                                        : 'border-gray-200 bg-white hover:border-green-300'
                                                }`}
                                            >
                                                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                                                    formData.paymentMethods.bankTransfer 
                                                        ? 'border-green-500 bg-green-500' 
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
                                                        ? 'border-purple-500 bg-purple-50 shadow-sm' 
                                                        : 'border-gray-200 bg-white hover:border-purple-300'
                                                }`}
                                            >
                                                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                                                    formData.paymentMethods.mobilePayment 
                                                        ? 'border-purple-500 bg-purple-500' 
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
                                                        ? 'border-orange-500 bg-orange-50 shadow-sm' 
                                                        : 'border-gray-200 bg-white hover:border-orange-300'
                                                }`}
                                            >
                                                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                                                    formData.paymentMethods.paypal 
                                                        ? 'border-orange-500 bg-orange-500' 
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
                                                        ? 'border-yellow-500 bg-yellow-50 shadow-sm' 
                                                        : 'border-gray-200 bg-white hover:border-yellow-300'
                                                }`}
                                            >
                                                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                                                    formData.paymentMethods.cash 
                                                        ? 'border-yellow-500 bg-yellow-500' 
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
                                                className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium cursor-pointer hover:bg-blue-200 transition-colors"
                                            >Tarjeta</span>
                                        )}
                                        {formData.paymentMethods.bankTransfer && (
                                            <span 
                                                onClick={() => handlePaymentMethodClick('bankTransfer')}
                                                className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium cursor-pointer hover:bg-green-200 transition-colors"
                                            >Transferencia</span>
                                        )}
                                        {formData.paymentMethods.mobilePayment && (
                                            <span 
                                                onClick={() => handlePaymentMethodClick('mobilePayment')}
                                                className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium cursor-pointer hover:bg-purple-200 transition-colors"
                                            >Pago móvil</span>
                                        )}
                                        {formData.paymentMethods.paypal && (
                                            <span 
                                                onClick={() => handlePaymentMethodClick('paypal')}
                                                className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium cursor-pointer hover:bg-orange-200 transition-colors"
                                            >PayPal</span>
                                        )}
                                        {formData.paymentMethods.cash && (
                                            <span 
                                                onClick={() => handlePaymentMethodClick('cash')}
                                                className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium cursor-pointer hover:bg-yellow-200 transition-colors"
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
                                    <input
                                        type="text"
                                        value={formData.contactInfo.businessPhone}
                                        onChange={(e) => handleNestedInputChange('contactInfo', 'businessPhone', e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                                    />
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
            >
                {paymentMethodData && (
                    <div className="space-y-4">
                        
                        <div className="space-y-3">
                            {paymentMethodData?.data.map((item, index) => (
                                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">{item.label}:</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-medium text-gray-800">{item.value}</span>
                                        {item.copy && (
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(item.value as string);
                                                }}
                                                className="text-xs text-blue-600 hover:text-blue-800 underline"
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
                                onClick={() => {
                                    const bankData = `Banco: ${formData.bankInfo.bankName}\nTitular: ${formData.bankInfo.accountHolder}\nCuenta: ${formData.bankInfo.accountNumber}\nTipo: ${formData.bankInfo.accountType}`;
                                    navigator.clipboard.writeText(bankData);
                                }}
                                className="w-full mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                                Copiar datos completos
                            </button>
                        )}
                        
                        {paymentMethodData?.color === 'purple' && (
                            <button
                                onClick={() => {
                                    const mobileData = `Teléfono: ${formData.mobilePaymentInfo.phoneNumber}\nRIF: ${formData.mobilePaymentInfo.rif}\nBanco: ${formData.mobilePaymentInfo.bankName}`;
                                    navigator.clipboard.writeText(mobileData);
                                }}
                                className="w-full mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                            >
                                Copiar datos completos
                            </button>
                        )}
                    </div>
                )}
            </Modal>
        </motion.div>
    );
} 