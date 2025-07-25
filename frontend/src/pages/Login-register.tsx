import { Link } from 'react-router-dom';
import logo from '../assets/logo/logo.svg';

export default function LoginRegister() {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-[var(--color-primary-50)] via-[var(--color-primary-100)] to-[var(--color-primary-200)] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          {/* Large gradient circles */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-[var(--color-primary-100)] to-[var(--color-primary-200)] rounded-full opacity-40 blur-3xl animate-pulse" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-gradient-to-tl from-[var(--color-primary-200)] to-[var(--color-primary-300)] rounded-full opacity-30 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[var(--color-primary-50)] to-[var(--color-primary-100)] rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          
          {/* Floating geometric shapes - First row */}
          <div className="absolute top-20 right-20 w-16 h-16 bg-[var(--color-primary-300)] opacity-20 rounded-lg transform rotate-12 animate-bounce" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-20 left-20 w-12 h-12 bg-[var(--color-primary-400)] opacity-15 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/3 left-10 w-8 h-8 bg-[var(--color-primary-200)] opacity-25 transform -rotate-45 animate-bounce" style={{ animationDelay: '2.5s' }} />
          <div className="absolute bottom-1/3 right-10 w-10 h-10 bg-[var(--color-primary-100)] opacity-30 rounded-lg animate-bounce" style={{ animationDelay: '3s' }} />
          
          {/* Additional floating elements - Second row */}
          <div className="absolute top-10 left-1/4 w-6 h-6 bg-[var(--color-primary-400)] opacity-20 rounded-full animate-ping" style={{ animationDelay: '0.8s' }} />
          <div className="absolute top-3/4 right-1/3 w-14 h-14 bg-[var(--color-primary-200)] opacity-15 rounded-lg transform rotate-45 animate-bounce" style={{ animationDelay: '1.2s' }} />
          <div className="absolute bottom-10 right-1/4 w-8 h-8 bg-[var(--color-primary-300)] opacity-25 rounded-full animate-pulse" style={{ animationDelay: '1.8s' }} />
          <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-[var(--color-primary-100)] opacity-20 transform -rotate-12 animate-bounce" style={{ animationDelay: '2.2s' }} />
          
          {/* Floating elements - Third row */}
          <div className="absolute top-1/4 right-1/6 w-10 h-10 bg-[var(--color-primary-400)] opacity-15 rounded-lg animate-ping" style={{ animationDelay: '0.3s' }} />
          <div className="absolute bottom-1/4 left-1/6 w-7 h-7 bg-[var(--color-primary-200)] opacity-25 rounded-full animate-bounce" style={{ animationDelay: '1.7s' }} />
          <div className="absolute top-2/3 left-2/3 w-9 h-9 bg-[var(--color-primary-300)] opacity-20 transform rotate-30 animate-pulse" style={{ animationDelay: '2.8s' }} />
          <div className="absolute bottom-2/3 right-2/3 w-11 h-11 bg-[var(--color-primary-100)] opacity-15 rounded-lg animate-bounce" style={{ animationDelay: '3.3s' }} />
          
          {/* Small floating dots */}
          <div className="absolute top-5 left-1/2 w-3 h-3 bg-[var(--color-primary-400)] opacity-30 rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
          <div className="absolute top-1/3 right-5 w-4 h-4 bg-[var(--color-primary-200)] opacity-25 rounded-full animate-bounce" style={{ animationDelay: '1.1s' }} />
          <div className="absolute bottom-5 left-1/3 w-3 h-3 bg-[var(--color-primary-300)] opacity-20 rounded-full animate-pulse" style={{ animationDelay: '2.1s' }} />
          <div className="absolute bottom-1/3 left-5 w-4 h-4 bg-[var(--color-primary-100)] opacity-30 rounded-full animate-ping" style={{ animationDelay: '3.1s' }} />
          
          {/* Floating lines and shapes */}
          <div className="absolute top-1/6 right-1/4 w-16 h-2 bg-[var(--color-primary-300)] opacity-20 rounded-full animate-pulse" style={{ animationDelay: '0.7s' }} />
          <div className="absolute bottom-1/6 left-1/3 w-12 h-1 bg-[var(--color-primary-200)] opacity-25 rounded-full animate-bounce" style={{ animationDelay: '1.9s' }} />
          <div className="absolute top-5/6 right-1/2 w-8 h-3 bg-[var(--color-primary-400)] opacity-15 rounded-full animate-ping" style={{ animationDelay: '2.6s' }} />
          
          {/* Diagonal floating elements */}
          <div className="absolute top-1/5 left-1/5 w-5 h-5 bg-[var(--color-primary-300)] opacity-20 transform rotate-45 animate-bounce" style={{ animationDelay: '0.4s' }} />
          <div className="absolute bottom-1/5 right-1/5 w-6 h-6 bg-[var(--color-primary-200)] opacity-25 rounded-full animate-pulse" style={{ animationDelay: '1.6s' }} />
          <div className="absolute top-4/5 left-4/5 w-7 h-7 bg-[var(--color-primary-400)] opacity-15 rounded-lg animate-ping" style={{ animationDelay: '2.9s' }} />
        </div>

        <div className="flex flex-col items-center justify-center w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto space-y-4 md:space-y-6 lg:space-y-8 relative z-10 animate-fade-in-up">
          {/* Logo */}
          <div className="w-52 h-52 md:w-60 md:h-60 lg:w-72 lg:h-72 flex items-center justify-center hover:scale-110 transition-transform duration-500 cursor-pointer">
            <img 
              src={logo} 
              alt="PymeUp Logo" 
              className="w-full h-full object-contain p-8 hover:rotate-12 transition-transform duration-700"
            />
          </div>
          
          {/* Company name */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0A2463] text-center px-4 drop-shadow-sm hover:scale-105 transition-transform duration-300">
            PymeUp
          </h1>
          
          {/* Company tagline */}
          <p className="text-base md:text-lg lg:text-xl text-[#0A2463] text-center px-4 -mt-2 md:-mt-3 lg:-mt-4 font-medium hover:text-[var(--color-primary-600)] transition-colors duration-300 cursor-pointer">
            "Transforma la forma en que trabajas y vendes"
          </p>
          
          {/* Buttons container */}
          <div className="w-full flex flex-col items-center space-y-3 md:space-y-4 lg:space-y-5 px-4">
            {/* Login button */}
            <Link to="/login">
              <button 
                type="button" 
                className="w-48 md:w-56 lg:w-64 bg-[#D8315B] hover:bg-[#b81e48] text-white py-2 md:py-3 lg:py-3 rounded-xl text-base md:text-lg lg:text-xl font-medium transition-all duration-500 cursor-pointer shadow-lg hover:shadow-2xl transform hover:scale-110 hover:-translate-y-1 active:scale-95"
              >
                Iniciar Sesión
              </button>
            </Link>
            
            {/* Register button */}
            <Link to="/register">
              <button 
                type="button" 
                className="w-48 md:w-56 lg:w-64 bg-white/90 backdrop-blur-sm hover:bg-white text-[#D8315B] hover:border-[var(--color-secondary-300)] hover:text-[var(--color-secondary-400)] py-2 md:py-3 lg:py-3 rounded-xl text-base md:text-lg lg:text-xl font-medium border-2 border-[#D8315B] transition-all duration-500 cursor-pointer shadow-lg hover:shadow-2xl transform hover:scale-110 hover:-translate-y-1 active:scale-95"
              >
                Registrarse
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
} 