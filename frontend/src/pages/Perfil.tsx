import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function Perfil() {
    const [isEditing, setIsEditing] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfileImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEditClick = () => {
        setIsEditing(!isEditing);
    };

    return (
        <div className="min-h-screen h-screen w-full bg-gradient-to-br from-[var(--color-primary-50)] to-[var(--color-primary-100)]">
            {/* Main Content */}
            <main className="container mx-auto px-6 py-8">
                {/* Profile Header Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            {/* Profile Picture/Logo */}
                            <div className="relative">
                                <div 
                                    className={`w-32 h-32 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                                        profileImage 
                                            ? 'bg-cover bg-center' 
                                            : 'bg-gradient-to-br from-[var(--color-primary-200)] to-[var(--color-primary-300)]'
                                    }`}
                                    style={profileImage ? { backgroundImage: `url(${profileImage})` } : {}}
                                >
                                    {!profileImage && (
                                        <span className="text-4xl text-white font-bold">P</span>
                                    )}
                                </div>
                                
                                {/* Pencil icon for editing */}
                                {isEditing && (
                                    <div 
                                        className="absolute -bottom-2 -right-2 w-8 h-8 bg-[var(--color-secondary-400)] rounded-full flex items-center justify-center cursor-pointer hover:bg-[var(--color-secondary-500)] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            
                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                            
                            {/* Company Info */}
                            <div>
                                <h1 className="text-3xl font-bold text-[var(--color-primary-700)] mb-2">
                                    PymeUp
                                </h1>
                                <p className="text-lg text-[var(--color-primary-600)] mb-1">
                                    Empresa de Tecnología
                                </p>
                                <p className="text-sm text-gray-500">
                                    Miembro desde Enero 2024
                                </p>
                            </div>
                        </div>
                        
                        {/* Edit Button */}
                        <button 
                            onClick={handleEditClick}
                            className="px-6 py-3 bg-[var(--color-secondary-400)] text-white rounded-xl font-medium hover:bg-[var(--color-secondary-500)] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            {isEditing ? 'Cancelar' : 'Editar Perfil'}
                        </button>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Company Description Section */}
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-[var(--color-primary-100)] rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-[var(--color-primary-600)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-[var(--color-primary-700)]">
                                Descripción de empresa
                            </h2>
                        </div>
                        
                        <div className="bg-gray-50 rounded-xl p-6">
                            {isEditing ? (
                                <textarea 
                                    className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] focus:border-transparent resize-none"
                                    rows={6}
                                    placeholder="Cuéntanos sobre tu empresa, su misión, visión y valores..."
                                />
                            ) : (
                                <p className="text-gray-700 leading-relaxed">
                                    PymeUp es una plataforma innovadora que transforma la forma en que las pequeñas y medianas empresas 
                                    gestionan sus operaciones. Nuestra misión es democratizar el acceso a herramientas empresariales 
                                    avanzadas, permitiendo que cualquier empresa pueda crecer y competir en el mercado digital actual.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Payment Info Section */}
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-[var(--color-secondary-100)] rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-[var(--color-secondary-600)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-[var(--color-primary-700)]">
                                Info de pago
                            </h2>
                        </div>
                        
                        <div className="bg-gray-50 rounded-xl p-6">
                            {isEditing ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Métodos de pago que acepta</label>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <input type="checkbox" id="credit-card" className="w-4 h-4 text-[var(--color-primary-600)] rounded focus:ring-[var(--color-primary-400)]" />
                                                <label htmlFor="credit-card" className="text-sm text-gray-700">Tarjeta de crédito/débito</label>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <input type="checkbox" id="bank-transfer" className="w-4 h-4 text-[var(--color-primary-600)] rounded focus:ring-[var(--color-primary-400)]" />
                                                <label htmlFor="bank-transfer" className="text-sm text-gray-700">Transferencia bancaria</label>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <input type="checkbox" id="mobile-payment" className="w-4 h-4 text-[var(--color-primary-600)] rounded focus:ring-[var(--color-primary-400)]" />
                                                <label htmlFor="mobile-payment" className="text-sm text-gray-700">Pago móvil</label>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <input type="checkbox" id="paypal" className="w-4 h-4 text-[var(--color-primary-600)] rounded focus:ring-[var(--color-primary-400)]" />
                                                <label htmlFor="paypal" className="text-sm text-gray-700">PayPal</label>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <input type="checkbox" id="cash" className="w-4 h-4 text-[var(--color-primary-600)] rounded focus:ring-[var(--color-primary-400)]" />
                                                <label htmlFor="cash" className="text-sm text-gray-700">Efectivo</label>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Información bancaria</label>
                                        <div className="space-y-3">
                                            <input 
                                                type="text" 
                                                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] focus:border-transparent"
                                                placeholder="Nombre del banco"
                                            />
                                            <input 
                                                type="text" 
                                                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] focus:border-transparent"
                                                placeholder="Número de cuenta"
                                            />
                                            <input 
                                                type="text" 
                                                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] focus:border-transparent"
                                                placeholder="CLABE (18 dígitos)"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Información de contacto para pagos</label>
                                        <div className="space-y-3">
                                            <input 
                                                type="tel" 
                                                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] focus:border-transparent"
                                                placeholder="Teléfono para pagos móviles"
                                            />
                                            <input 
                                                type="email" 
                                                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] focus:border-transparent"
                                                placeholder="Email para PayPal"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Plan actual</label>
                                        <input 
                                            type="text" 
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] focus:border-transparent"
                                            placeholder="Plan Premium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de renovación</label>
                                        <input 
                                            type="date" 
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-3 bg-white rounded-lg">
                                        <span className="text-gray-600 block mb-2">Métodos de pago aceptados:</span>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Tarjeta</span>
                                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Transferencia</span>
                                            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">Pago móvil</span>
                                            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">PayPal</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                                        <span className="text-gray-600">Banco</span>
                                        <span className="font-medium">Banco Azteca</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                                        <span className="text-gray-600">Cuenta</span>
                                        <span className="font-medium">****1234</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Save/Cancel buttons when editing */}
                {isEditing && (
                    <div className="flex gap-4 mt-8 justify-center">
                        <button 
                            onClick={() => setIsEditing(false)}
                            className="px-8 py-3 bg-[var(--color-primary-600)] text-white rounded-xl font-medium hover:bg-[var(--color-primary-700)] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            Guardar Cambios
                        </button>
                        <button 
                            onClick={() => setIsEditing(false)}
                            className="px-8 py-3 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            Cancelar
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
} 