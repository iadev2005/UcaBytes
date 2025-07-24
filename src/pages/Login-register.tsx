import React from 'react';
import { Link } from 'react-router-dom';

export default function LoginRegister() {
    return (
      <div className="bg-cover bg-center min-h-screen min-w-full" style={{backgroundImage: "url('/images/EquipoTrabajo01.jpg')"}}>
        <div className="flex flex-col items-center justify-center absolute top-1/2 left-2/6 h-screen w-2/6 bg-[#fffaff]" style={{transform: 'translate(0%, -50%)'}}>
            <img src="/images/Coffee.jpg" alt="Coffee" className="mb-10 w-52 h-52 object-cover rounded-full" />
            <h2 className="text-[3rem] font-bold text-[#0A2463] mb-24">Nombre de la Empresa</h2>
            <h3 className="text-[2rem] font-bold text-[#0A2463] mb-24">Frase inspirdaoras</h3>
            <div className="flex flex-col w-4/5 " style={{paddingBottom: "1vh"}}>
              <Link to="/login">
                <button type="button" className="bg-[#D8315B] rounded-2xl text-[#fffaff] py-4 px-5 border-none cursor-pointer w-full text-[1.5rem] font-normal hover:bg-[#b81e48] transition-colors">Iniciar Seccion</button>
              </Link>
            </div>
            <div className="flex flex-col w-4/5 mt-4" style={{paddingBottom: "1vh"}}>
              <Link to="/register">
                <button type="button" className="bg-[#fffaff] rounded-2xl text-[#D8315B] py-4 px-5 border-[0.2em] cursor-pointer w-full text-[1.5rem] font-normal hover:bg-[#b81e48] hover:text-[#fffaff] transition-colors">Registrarse</button>
              </Link>
            </div>
        </div>
      </div>
    );
  }