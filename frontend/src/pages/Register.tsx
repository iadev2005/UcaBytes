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
      <div className="bg-cover bg-center min-h-screen min-w-full" style={{backgroundImage: "url('/images/EquipoTrabajo02.webp')", background:"cover" }}>
        <div className="flex flex-col items-center justify-center absolute top-1/2 left-0/5 h-screen w-2/5 bg-[#fffaff]" style={{transform: 'translate(0%, -50%)'}}>
            <div className="absolute top-6 left-6">
                <Link to="/" className="text-[1.5rem] font-normal text-[#3e92ee]">
                    <ReturnIcon className="w-12 h-12" />
                </Link>
            </div>
            <h2 className="text-[3rem] font-bold text-[#0A2463] mb-24">Registrarse</h2>
            <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
              <div className="flex flex-col gap-4 w-full items-center">
                <div className="flex flex-col w-4/5">
                    <div className="flex flex-row">
                        <p className="text-[1.5rem] font-normal text-[#0A2463]">Correo de la Empresa: </p>
                    </div>
                    <div className="flex flex-row w-full h-12">
                        <input type="email" 
                        placeholder="Correo electrónico / Usuario" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="rounded-lg px-5 py-4 w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A2463] placeholder:text-[1.5rem] placeholder:font-normal"/>
                    </div>
                </div>
                <div className="flex flex-col w-4/5">
                    <div className="flex flex-row">
                        <p className="text-[1.5rem] font-normal text-[#0A2463]">Nombre de la Empresa: </p>
                    </div>
                    <div className="flex flex-row w-full h-12">
                        <input type="text" 
                        placeholder="Nombre" 
                        required 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="rounded-lg px-5 py-4 w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A2463] placeholder:text-[1.5rem] placeholder:font-normal"/>
                    </div>
                </div>
                <div className="flex flex-col w-4/5">
                    <div className="flex flex-row">
                        <p className="text-[1.5rem] font-normal text-[#0A2463]">Direcion: </p>
                    </div>
                    <div className="flex flex-row w-full h-12">
                        <input type="text" 
                        placeholder="Apellido" 
                        required 
                        value={addres}
                        onChange={(e) => setAddres(e.target.value)}
                        className="rounded-lg px-5 py-4 w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A2463] placeholder:text-[1.5rem] placeholder:font-normal"/>
                    </div>
                </div>
                <div className="flex flex-col w-4/5">
                    <div className="flex flex-row">
                        <p className="text-[1.5rem] font-normal text-[#0A2463]">Telefono:</p>
                    </div>
                    <div className="flex flex-row w-full h-12">
                        <input type="tel" 
                        placeholder="xxx-xxxxxxx" 
                        required 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="rounded-lg px-5 py-4 w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A2463] placeholder:text-[1.5rem] placeholder:font-normal"/>
                    </div>
                </div>
                <div className="flex flex-col w-4/5">
                    <div className="flex flex-row">
                        <p className="text-[1.5rem] font-normal text-[#0A2463]">Contraseña:</p>
                    </div>
                    <div className="flex flex-row w-full h-12">
                        <input type="password" 
                        placeholder="Contraseña" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="rounded-lg px-5 py-4 w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A2463] placeholder:text-[1.5rem] placeholder:font-normal"/>
                    </div>
                </div>
                <div className="flex flex-col w-4/5">
                  <button type="submit" className="bg-[#D8315B] rounded-2xl text-[#fffaff] py-4 px-5 border-none cursor-pointer w-full text-[1.5rem] font-normal hover:bg-[#b81e48] transition-colors">Resgistrarse</button>
                </div>
              </div>
            </form>
            <p className="mt-6 text-base text-[#0A2463] text-[1.5rem] font-normal">
              ¿Ya tienes una cuenta? <Link to="/Login" className="text-[#D8315B] hover:underline text-[1.5rem] font-normal">Login</Link>
            </p>
        </div>


        {
            showPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full text-center relative">
                        <h3 className="text-2xl font-bold text-[#0A2463] mb-4">Aviso</h3>
                        <p className="text-lg text-[#0A2463] mb-6">{popupMessage}</p>
                        <button
                            onClick={() => setShowPopup(false)}
                            className="bg-[#D8315B] text-[#fffaff] py-2 px-6 rounded-lg hover:bg-[#b81e48] transition-colors text-[1.2rem]"
                        >
                            Cerrar
                        </button>
                        {/* Puedes añadir un botón para redirigir al login si es el caso */}
                        {popupMessage.includes('ya se encuentra registrada') && (
                            <button
                                onClick={() => {
                                    setShowPopup(false); // Redirige al login
                                }}
                                className="ml-4 bg-[#3e92ee] text-[#fffaff] py-2 px-6 rounded-lg hover:bg-[#2a7bd3] transition-colors text-[1.2rem]"
                            >
                                Ir a Iniciar Sesión
                            </button>
                        )}
                    </div>
                </div>
            )
        }
      </div>
    );
  } 