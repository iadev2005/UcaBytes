import { Link, useNavigate } from 'react-router-dom';
import { ReturnIcon } from '../icons/Return';
import { client } from '../supabase/client'; 
import { useState } from 'react';

export default function Login() {
    const navigate = useNavigate()

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      // Aquí iría la lógica real de autenticación
      try{
        
        const { data, error } = await client.auth.signInWithPassword({
          email,
          password
        });
        console.log(data)
  
        //si existe el error nos vamos a catch
        if (error) {
            throw error;
        }

        //en caso de que no haya error, redirigimos al usuario a la página de inicio
        navigate('/app');
      }catch (error) {
        console.error('Error during login:', error);
        // Aquí podrías manejar el error, mostrar un mensaje al usuario, etc.
      }

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
            <Link to="/Login-register" className="text-[var(--color-primary-600)] hover:text-[#2b7de0] transition-colors">
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
                  E-mail/usuario:
                </label>
                <input 
                  type="text" 
                  placeholder="Ingresa tu correo o usuario" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2463] focus:border-transparent placeholder-gray-400 text-sm sm:text-base"
                />
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
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2463] focus:border-transparent placeholder-gray-400 text-sm sm:text-base"
                />
              </div>
              
              {/* Login button */}
              <div className="flex justify-center">
                <button 
                  type="submit" 
                  className="w-48 md:w-56 lg:w-64 bg-[#D8315B] text-white py-2 md:py-3 lg:py-3 rounded-xl text-base md:text-lg lg:text-xl font-medium hover:bg-[#b81e48] transition-all duration-500 cursor-pointer shadow-lg hover:shadow-2xl transform hover:scale-110 hover:-translate-y-1 active:scale-95"
                >
                  Iniciar Sesión
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
      </div>
    );
} 