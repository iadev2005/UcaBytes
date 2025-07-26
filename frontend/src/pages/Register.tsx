import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ReturnIcon } from '../icons/Return';
import { client } from '../supabase/client'; // Adjust the import path as necessary
import { AuthApiError } from '@supabase/supabase-js';

export default function Register() {

    const [email,setEmail] = useState('');
    const [name,setName] = useState('');
    const [addres,setAddres] = useState('');
    const [phone,setPhone] = useState('');
    const [password,setPassword] = useState('');

    // --- Nuevos estados para el pop-up ---
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setShowPopup(false);   // Asegurar que el pop-up esté oculto al inicio
        setPopupMessage('');   // Limpiar mensaje del pop-up


        //visualizamos los datos antes 
       console.log({ email, name, addres, phone, password });

       //creamos el nuevo usuario en supabse 
       try{
            const { data, error } = await client.auth.signUp({
                email,
                password
            });
            console.log(data)

            //si existe el error nos vamos a catch
            if (error) {
                throw error;
            }


            //si no hay error, creamos el perfil de la empresa
            setPopupMessage('Usuario registrado correctamente.');
            setShowPopup(true)

       }catch (error: unknown) {
            //verificamos si el error es de tipo AuthApiError
            if (error instanceof AuthApiError) {
                // Manejo de errores específicos de autenticación
                if(error.message.includes('User already registered')){
                    setPopupMessage('Este usuario ya se encuentra registrado');
                    setShowPopup(true)
                    return 
                }
                
                return;
            }

            console.log('Error creating user:', error);
            return;
        }
        
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
                        <input type="email" 
                        placeholder="Correo electrónico / Usuario" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="rounded-lg px-3 py-2 w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A2463] focus:border-transparent placeholder:text-gray-500 text-[0.85rem] lg:text-[0.9rem] transition-all duration-200"/>
                    </div>
                    
                    <div className="flex flex-col w-full">
                        <label className="text-[0.9rem] lg:text-[1rem] font-medium text-[#0A2463] mb-1">Nombre de la Empresa:</label>
                        <input type="text" 
                        placeholder="Nombre" 
                        required 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="rounded-lg px-3 py-2 w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A2463] focus:border-transparent placeholder:text-gray-500 text-[0.85rem] lg:text-[0.9rem] transition-all duration-200"/>
                    </div>
                    
                    <div className="flex flex-col w-full">
                        <label className="text-[0.9rem] lg:text-[1rem] font-medium text-[#0A2463] mb-1">Dirección:</label>
                        <input type="text" 
                        placeholder="Dirección de la empresa" 
                        required 
                        value={addres}
                        onChange={(e) => setAddres(e.target.value)}
                        className="rounded-lg px-3 py-2 w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A2463] focus:border-transparent placeholder:text-gray-500 text-[0.85rem] lg:text-[0.9rem] transition-all duration-200"/>
                    </div>
                    
                    <div className="flex flex-col w-full">
                        <label className="text-[0.9rem] lg:text-[1rem] font-medium text-[#0A2463] mb-1">Teléfono:</label>
                        <input type="tel" 
                        placeholder="xxx-xxxxxxx" 
                        required 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="rounded-lg px-3 py-2 w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A2463] focus:border-transparent placeholder:text-gray-500 text-[0.85rem] lg:text-[0.9rem] transition-all duration-200"/>
                    </div>
                    
                    <div className="flex flex-col w-full">
                        <label className="text-[0.9rem] lg:text-[1rem] font-medium text-[#0A2463] mb-1">Contraseña:</label>
                        <input type="password" 
                        placeholder="Contraseña" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="rounded-lg px-3 py-2 w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A2463] focus:border-transparent placeholder:text-gray-500 text-[0.85rem] lg:text-[0.9rem] transition-all duration-200"/>
                    </div>
                    
                    <div className="flex flex-col w-full mt-1">
                      <button type="submit" className="bg-[#D8315B] rounded-xl text-[#fffaff] py-2.5 px-4 border-none cursor-pointer w-full text-[0.9rem] lg:text-[1rem] font-semibold hover:bg-[#b81e48] transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl">
                        Registrarse
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
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        
                        <h3 className="text-lg font-bold text-[#0A2463] mb-2">
                            {popupMessage.includes('correctamente') ? '¡Éxito!' : 'Aviso'}
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
                            
                            {popupMessage.includes('ya se encuentra registrado') && (
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