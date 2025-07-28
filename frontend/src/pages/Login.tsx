import { Link, useNavigate } from 'react-router-dom';
import { ReturnIcon } from '../icons/Return';
import { client } from '../supabase/client'; 
import { useState } from 'react';
import { AuthApiError } from '@supabase/supabase-js';

interface ValidationErrors {
    email?: string;
    password?: string;
}

export default function Login() {
    const navigate = useNavigate()

    const [email, setEmail] = useState('');
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
        return undefined;
    };

    const validatePassword = (password: string): string | undefined => {
        if (!password) return 'La contraseña es requerida';
        if (password.length < 1) return 'La contraseña es requerida';
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
            const { data, error } = await client.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                throw error;
            }

            // En caso de que no haya error, redirigimos al usuario a la página de inicio
            navigate('/app');
        } catch (error: unknown) {
            let errorMessage = 'Error al iniciar sesión. Inténtalo de nuevo.';

            if (error instanceof AuthApiError) {
                switch (error.message) {
                    case 'Invalid login credentials':
                        errorMessage = 'Correo electrónico o contraseña incorrectos.';
                        break;
                    case 'Email not confirmed':
                        errorMessage = 'Por favor, confirma tu correo electrónico antes de continuar.';
                        break;
                    case 'User not found':
                        errorMessage = 'No existe una cuenta con este correo electrónico.';
                        break;
                    case 'Too many requests':
                        errorMessage = 'Demasiados intentos. Inténtalo de nuevo en unos minutos.';
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
        const baseClasses = "w-full px-4 sm:px-5 py-3 sm:py-4 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent placeholder-gray-400 text-sm sm:text-base transition-all duration-200";
        
        if (errors[fieldName]) {
            return `${baseClasses} border-red-500 focus:ring-red-500 bg-red-50`;
        }
        
        return `${baseClasses} border-gray-300 focus:ring-[#0A2463]`;
    };

    return (
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left side - Office photo */}
        <div className="w-full lg:w-3/5 h-64 lg:h-auto bg-cover bg-center" style={{backgroundImage: "url('/images/EquipoTrabajo01.jpg')"}}>
          {/* Photo takes full height and width of left side */}
        </div>
        
        {/* Right side - Login form */}
        <div className="w-full lg:w-2/5 bg-white flex flex-col justify-center px-6 sm:px-8 lg:px-10 py-8 lg:py-0 relative">
          {/* Back button */}
          <div className="absolute top-4 lg:top-6 left-4 lg:left-6">
            <Link to="/" className="text-[var(--color-primary-600)] hover:text-[#2b7de0] transition-colors">
              <ReturnIcon className="w-6 h-6 lg:w-8 lg:h-8" />
            </Link>
          </div>
          
          {/* Login form container */}
          <div className="w-full max-w-sm sm:max-w-md mx-auto">
            {/* Title */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0A2463] text-center mb-6 sm:mb-8 lg:mb-10">Iniciar Sesión</h2>
            
            {/* Form */}
            <form className="w-full space-y-6 sm:space-y-8" onSubmit={handleSubmit}>
              {/* Email/Username field */}
              <div className="space-y-2 sm:space-y-3">
                <label className="block text-sm sm:text-base font-medium text-[#0A2463]">
                  E-mail:
                </label>
                <input 
                  type="email" 
                  placeholder="Ingresa tu correo o usuario" 
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
              
              {/* Password field */}
              <div className="space-y-2 sm:space-y-3">
                <label className="block text-sm sm:text-base font-medium text-[#0A2463]">
                  Contraseña:
                </label>
                <input 
                  type="password" 
                  placeholder="Ingresa tu contraseña" 
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
              
              {/* Login button */}
              <div className="flex justify-center">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`w-48 md:w-56 lg:w-64 text-white py-2 md:py-3 lg:py-3 rounded-xl text-base md:text-lg lg:text-xl font-medium transition-all duration-500 cursor-pointer shadow-lg hover:shadow-2xl transform hover:scale-110 hover:-translate-y-1 active:scale-95 ${
                      isSubmitting 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-[#D8315B] hover:bg-[#b81e48]'
                  }`}
                >
                  {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>
              </div>
            </form>
            
            {/* Links */}
            <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4 text-center">
              <Link 
                to="/forgot-password" 
                className="block text-sm sm:text-base text-[#0A2463] hover:underline cursor-pointer"
              >
                ¿Olvido su contraseña?
              </Link>
              <p className="text-sm sm:text-base text-gray-500">
                ¿No tienes una cuenta?{' '}
                <Link 
                  to="/Register" 
                  className="text-[#D8315B] hover:underline cursor-pointer"
                >
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Modal de popup para errores */}
        {showPopup && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 transform transition-all duration-300 scale-100 animate-in fade-in-0 zoom-in-95">
                    <div className="p-5 text-center">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        
                        <h3 className="text-lg font-bold text-[#0A2463] mb-2">
                            Error de Inicio de Sesión
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
                            
                            {popupMessage.includes('No existe una cuenta') && (
                                <Link
                                    to="/Register"
                                    onClick={() => setShowPopup(false)}
                                    className="bg-[#3e92ee] text-white py-2 px-5 rounded-xl hover:bg-[#2a7bd3] transition-all duration-200 font-semibold text-[0.85rem] transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                                >
                                    Registrarse
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