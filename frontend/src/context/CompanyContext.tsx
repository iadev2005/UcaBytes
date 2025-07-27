import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { getCompanyData } from '../supabase/data'; // Assuming this function fetches company data

interface CompanyData {
  name: string;
  phone: string;
  address: string;
  email: string;
  rif: string;
  nameSocial: string;
  type: string;
  description: string;
  avatar: string;
  profileImage: string | null;
}

interface CompanyContextType {
  companyData: CompanyData;
  updateCompanyData: (data: Partial<CompanyData>) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};

interface CompanyProviderProps {
  children: ReactNode;
}

export const CompanyProvider: React.FC<CompanyProviderProps> = ({ children }) => {

  const [companyData, setCompanyData] = useState<CompanyData>({
    name: 'Nombre Empresa',
    type: 'Empresa de Tecnología',
    description: 'Somos una empresa comprometida con la excelencia y la innovación. Nuestra misión es brindar soluciones de calidad que satisfagan las necesidades de nuestros clientes, contribuyendo al crecimiento y desarrollo del sector empresarial.',
    avatar: 'https://ui-avatars.com/api/?name=Usuario&background=8B5CF6&color=fff&size=128&bold=true',
    profileImage: 'https://ui-avatars.com/api/?name=Usuario&background=8B5CF6&color=fff&size=128&bold=true',
    phone: '123-456-7890',
    address: '123 Calle Principal, Ciudad, País',
    email: '',
    rif: '',
    nameSocial: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [companyLoading,setCompanyLoading] = useState(true);


  //funcióin para obtener los datos de la emprsa 
  const fetchDataCompany = async (email: string) => {
    try {
      setCompanyLoading(true);
      const data = await getCompanyData(email);

      if (data) {
        setCompanyData(data);0
      } else {
        console.error('No company data found');
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
    }
  }

  const updateCompanyData = (data: Partial<CompanyData>) => {
    setCompanyData(prev => ({ ...prev, ...data }));
  };

  return (
    <CompanyContext.Provider value={{
      companyData,
      updateCompanyData,
      isEditing,
      setIsEditing
    }}>
      {children}
    </CompanyContext.Provider>
  );
}; 