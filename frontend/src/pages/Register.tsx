import React from 'react';
import { Link } from 'react-router-dom';
import { ReturnIcon } from '../icons/Return';

export default function Register() {
    return (
      <div className="bg-cover bg-center min-h-screen min-w-full" style={{backgroundImage: "url('/images/EquipoTrabajo02.webp')", background:"cover" }}>
        <div className="flex flex-col items-center justify-center absolute top-1/2 left-0/5 h-screen w-2/5 bg-[#fffaff]" style={{transform: 'translate(0%, -50%)'}}>
            <div className="absolute top-6 left-6">
                <Link to="/Login-register" className="text-[1.5rem] font-normal text-[#3e92ee]">
                    <ReturnIcon className="w-12 h-12" />
                </Link>
            </div>
            <h2 className="text-[3rem] font-bold text-[#0A2463] mb-24">Registrarse</h2>
            <form className="w-full flex flex-col items-center">
              <div className="flex flex-col gap-4 w-full items-center">
                <div className="flex flex-col w-4/5">
                    <div className="flex flex-row">
                        <p className="text-[1.5rem] font-normal text-[#0A2463]">Correo</p>
                    </div>
                    <div className="flex flex-row w-full h-12">
                        <input type="email" placeholder="Correo electrónico / Usuario" required className="rounded-lg px-5 py-4 w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A2463] placeholder:text-[1.5rem] placeholder:font-normal"/>
                    </div>
                </div>
                <div className="flex flex-col w-4/5">
                    <div className="flex flex-row">
                        <p className="text-[1.5rem] font-normal text-[#0A2463]">Nombre</p>
                    </div>
                    <div className="flex flex-row w-full h-12">
                        <input type="text" placeholder="Nombre" required className="rounded-lg px-5 py-4 w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A2463] placeholder:text-[1.5rem] placeholder:font-normal"/>
                    </div>
                </div>
                <div className="flex flex-col w-4/5">
                    <div className="flex flex-row">
                        <p className="text-[1.5rem] font-normal text-[#0A2463]">Apellido</p>
                    </div>
                    <div className="flex flex-row w-full h-12">
                        <input type="text" placeholder="Apellido" required className="rounded-lg px-5 py-4 w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A2463] placeholder:text-[1.5rem] placeholder:font-normal"/>
                    </div>
                </div>
                <div className="flex flex-col w-4/5">
                    <div className="flex flex-row">
                        <p className="text-[1.5rem] font-normal text-[#0A2463]">telefono</p>
                    </div>
                    <div className="flex flex-row w-full h-12">
                        <input type="number" placeholder="xxx-xxxxxxx" required className="rounded-lg px-5 py-4 w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A2463] placeholder:text-[1.5rem] placeholder:font-normal"/>
                    </div>
                </div>
                <div className="flex flex-col w-4/5">
                    <div className="flex flex-row">
                        <p className="text-[1.5rem] font-normal text-[#0A2463]">Contraseña</p>
                    </div>
                    <div className="flex flex-row w-full h-12">
                        <input type="password" placeholder="Contraseña" required className="rounded-lg px-5 py-4 w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A2463] placeholder:text-[1.5rem] placeholder:font-normal"/>
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
      </div>
    );
  } 