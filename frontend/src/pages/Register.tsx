import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ReturnIcon } from '../icons/Return';
import { client } from '../supabase/client'; // Adjust the import path as necessary
import { AuthApiError } from '@supabase/supabase-js';

interface ValidationErrors {
    email?: string;
    name?: string;
    address?: string;
    phone?: string;
    password?: string;
}

export default function Register() {

    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');

    // --- Estados para validación y feedback ---
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');

    // --- Funciones de validación ---
    const validateEmail = (email: string): string | undefined => {
        if (!email) return 'El correo electrónico es requerido';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return 'Formato de correo electrónico inválido';
        if (email.length > 254) return 'El correo electrónico es demasiado largo';
        return undefined;
    };

    const validateName = (name: string): string | undefined => {
        if (!name) return 'El nombre de la empresa es requerido';
        if (name.length < 2) return 'El nombre debe tener al menos 2 caracteres';
        if (name.length > 100) return 'El nombre es demasiado largo';
        return undefined;
    };

    const validateAddress = (address: string): string | undefined => {
        if (!address) return 'La dirección es requerida';
        if (address.length < 5) return 'La dirección debe tener al menos 5 caracteres';
        if (address.length > 200) return 'La dirección es demasiado larga';
        return undefined;
    };

    const validatePhone = (phone: string): string | undefined => {
        if (!phone) return 'El teléfono es requerido';
        const phoneRegex = /^[\d\s\-\(\)\+]+$/;
        if (!phoneRegex.test(phone)) return 'Formato de teléfono inválido';
        if (phone.replace(/\D/g, '').length < 7) return 'El teléfono debe tener al menos 7 dígitos';
        if (phone.replace(/\D/g, '').length > 15) return 'El teléfono es demasiado largo';
        return undefined;
    };

    const validatePassword = (password: string): string | undefined => {
        if (!password) return 'La contraseña es requerida';
        if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
        if (password.length > 128) return 'La contraseña es demasiado larga';
        if (!/(?=.*[a-z])/.test(password)) return 'La contraseña debe contener al menos una letra minúscula';
        if (!/(?=.*[A-Z])/.test(password)) return 'La contraseña debe contener al menos una letra mayúscula';
        if (!/(?=.*\d)/.test(password)) return 'La contraseña debe contener al menos un número';
        return undefined;
    };

    // --- Validación en tiempo real ---
    const handleFieldChange = (field: keyof ValidationErrors, value: string) => {
        let error: string | undefined;

        switch (field) {
            case 'email':
                setEmail(value);
                error = validateEmail(value);
                break;
            case 'name':
                setName(value);
                error = validateName(value);
                break;
            case 'address':
                setAddress(value);
                error = validateAddress(value);
                break;
            case 'phone':
                setPhone(value);
                error = validatePhone(value);
                break;
            case 'password':
                setPassword(value);
                error = validatePassword(value);
                break;
        }

        setErrors(prev => ({
            ...prev,
            [field]: error
        }));
    };

    // --- Validación completa del formulario ---
    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {
            email: validateEmail(email),
            name: validateName(name),
            address: validateAddress(address),
            phone: validatePhone(phone),
            password: validatePassword(password)
        };

        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error !== undefined);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            setPopupMessage('Por favor, corrige los errores en el formulario.');
            setShowPopup(true);
            return;
        }

        setIsSubmitting(true);
        setShowPopup(false);
        setPopupMessage('');

        try {
            console.log(email,password)
            const { error:ErrorRegister } = await client.auth.signUp({
                email,
                password
            });
            if (ErrorRegister) {
                throw ErrorRegister;
            }
            
            console.log(email,address,name,phone)
            //guardamos los datos de la empresa 
            const { data, error:errorCompany} = await client
            .from('empresas')
            .insert(
                {email: email,
                nombrecomercial: name,
                direccion: address,
                telefono: phone}
            )
            .select()

            console.log(data)

            if(errorCompany) {  
                throw errorCompany;
            }
              

            setPopupMessage('Usuario registrado correctamente. Revisa tu correo electrónico para confirmar tu cuenta.');
            setShowPopup(true);

            // Redirigir al dashboard después de 2 segundos
            setTimeout(() => {
                navigate('/app');
            }, 2000);

        } catch (error: unknown) {
            console.error(error)
            let errorMessage = 'Error al registrar el usuario. Inténtalo de nuevo.';

            if (error instanceof AuthApiError) {
                switch (error.message) {
                    case 'User already registered':
                        errorMessage = 'Este correo electrónico ya está registrado.';
                        break;
                    case 'Password should be at least 6 characters':
                        errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
                        break;
                    case 'Invalid email':
                        errorMessage = 'El formato del correo electrónico es inválido.';
                        break;
                    case 'Email not confirmed':
                        errorMessage = 'Por favor, confirma tu correo electrónico antes de continuar.';
                        break;
                    case 'Invalid login credentials':
                        errorMessage = 'Credenciales de inicio de sesión inválidas.';
                        break;
                    default:
                        if (error.message.includes('network')) {
                            errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
                        } else if (error.message.includes('rate limit')) {
                            errorMessage = 'Demasiados intentos. Inténtalo de nuevo en unos minutos.';
                        } else {
                            errorMessage = `Error: ${error.message}`;
                        }
                }
            }

            setPopupMessage(errorMessage);
            setShowPopup(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getFieldClassName = (fieldName: keyof ValidationErrors) => {
        const baseClasses = "rounded-lg px-3 py-2 w-full border focus:outline-none focus:ring-2 focus:border-transparent placeholder:text-gray-500 text-[0.85rem] lg:text-[0.9rem] transition-all duration-200";
        
        if (errors[fieldName]) {
            return `${baseClasses} border-red-500 focus:ring-red-500 bg-red-50`;
        }
        
        return `${baseClasses} border-gray-300 focus:ring-[#0A2463]`;
    };

    return (
      <div className="h-screen w-full bg-cover bg-center bg-no-repeat overflow-hidden" style={{backgroundImage: "url('/images/EquipoTrabajo02.webp')"}}>
        {/* Container principal con mejor posicionamiento para desktop */}
        <div className="flex flex-col items-center justify-center h-screen w-full lg:w-1/2 lg:ml-0 lg:mr-auto bg-[#fffaff] lg:bg-white/95 lg:backdrop-blur-sm lg:shadow-2xl overflow-y-auto">
            <div className="absolute top-3 left-3 z-10">
                <Link to="/" className="text-[1rem] font-normal text-[#3e92ee] hover:text-[#2a7bd3] transition-colors">
                    <ReturnIcon className="w-7 h-7 lg:w-8 lg:h-8" />
                </Link>
            </div>
            
            {/* Contenido del formulario */}
            <div className="w-full max-w-xs px-4 py-6 lg:py-4">
                <h2 className="text-[1.8rem] lg:text-[2.2rem] font-bold text-[#0A2463] mb-6 lg:mb-4 text-center">Registrarse</h2>
                
                <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
                  <div className="flex flex-col gap-3 w-full">
                    <div className="flex flex-col w-full">
                        <label className="text-[0.9rem] lg:text-[1rem] font-medium text-[#0A2463] mb-1">Correo de la Empresa:</label>
                        <input 
                            type="email" 
                            placeholder="Correo electrónico / Usuario" 
                            required 
                            value={email}
                            onChange={(e) => handleFieldChange('email', e.target.value)}
                            className={getFieldClassName('email')}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {errors.email}
                            </p>
                        )}
                    </div>
                    
                    <div className="flex flex-col w-full">
                        <label className="text-[0.9rem] lg:text-[1rem] font-medium text-[#0A2463] mb-1">Nombre de la Empresa:</label>
                        <input 
                            type="text" 
                            placeholder="Nombre" 
                            required 
                            value={name}
                            onChange={(e) => handleFieldChange('name', e.target.value)}
                            className={getFieldClassName('name')}
                        />
                        {errors.name && (
                            <p className="text-red-500 text-xs mt-1 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {errors.name}
                            </p>
                        )}
                    </div>
                    
                    <div className="flex flex-col w-full">
                        <label className="text-[0.9rem] lg:text-[1rem] font-medium text-[#0A2463] mb-1">Dirección:</label>
                        <input 
                            type="text" 
                            placeholder="Dirección de la empresa" 
                            required 
                            value={address}
                            onChange={(e) => handleFieldChange('address', e.target.value)}
                            className={getFieldClassName('address')}
                        />
                        {errors.address && (
                            <p className="text-red-500 text-xs mt-1 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {errors.address}
                            </p>
                        )}
                    </div>
                    
                    <div className="flex flex-col w-full">
                        <label className="text-[0.9rem] lg:text-[1rem] font-medium text-[#0A2463] mb-1">Teléfono:</label>
                        <input 
                            type="tel" 
                            placeholder="xxx-xxxxxxx" 
                            required 
                            value={phone}
                            onChange={(e) => handleFieldChange('phone', e.target.value)}
                            className={getFieldClassName('phone')}
                        />
                        {errors.phone && (
                            <p className="text-red-500 text-xs mt-1 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {errors.phone}
                            </p>
                        )}
                    </div>
                    
                    <div className="flex flex-col w-full">
                        <label className="text-[0.9rem] lg:text-[1rem] font-medium text-[#0A2463] mb-1">Contraseña:</label>
                        <input 
                            type="password" 
                            placeholder="Contraseña" 
                            required 
                            value={password}
                            onChange={(e) => handleFieldChange('password', e.target.value)}
                            className={getFieldClassName('password')}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {errors.password}
                            </p>
                        )}
                    </div>
                    
                    <div className="flex flex-col w-full mt-1">
                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className={`rounded-xl text-[#fffaff] py-2.5 px-4 border-none cursor-pointer w-full text-[0.9rem] lg:text-[1rem] font-semibold transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl ${
                            isSubmitting 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-[#D8315B] hover:bg-[#b81e48]'
                        }`}
                      >
                        {isSubmitting ? 'Registrando...' : 'Registrarse'}
                      </button>
                    </div>
                  </div>
                </form>
                
                <p className="mt-4 text-center text-[0.8rem] lg:text-[0.9rem] text-[#0A2463] font-medium">
                  ¿Ya tienes una cuenta? <Link to="/Login" className="text-[#D8315B] hover:text-[#b81e48] hover:underline font-semibold transition-colors">Login</Link>
                </p>
            </div>
        </div>

        {/* Modal mejorado con backdrop blur */}
        {showPopup && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 transform transition-all duration-300 scale-100 animate-in fade-in-0 zoom-in-95">
                    <div className="p-5 text-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 ${
                            popupMessage.includes('correctamente') ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                            {popupMessage.includes('correctamente') ? (
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </div>
                        
                        <h3 className="text-lg font-bold text-[#0A2463] mb-2">
                            {popupMessage.includes('correctamente') ? '¡Éxito!' : 'Error'}
                        </h3>
                        
                        <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                            {popupMessage}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-2 justify-center">
                            <button
                                onClick={() => setShowPopup(false)}
                                className="bg-[#D8315B] text-white py-2 px-5 rounded-xl hover:bg-[#b81e48] transition-all duration-200 font-semibold text-[0.85rem] transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                            >
                                Cerrar
                            </button>
                            
                            {popupMessage.includes('ya está registrado') && (
                                <Link
                                    to="/Login"
                                    onClick={() => setShowPopup(false)}
                                    className="bg-[#3e92ee] text-white py-2 px-5 rounded-xl hover:bg-[#2a7bd3] transition-all duration-200 font-semibold text-[0.85rem] transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                                >
                                    Ir a Iniciar Sesión
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    );
  } 