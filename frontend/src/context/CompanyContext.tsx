import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface CompanyData {
  name: string;
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
    avatar: 'https://ui-avatars.com/api/?name=Empresa&background=8B5CF6&color=fff&size=128',
    profileImage: null
  });

  const [isEditing, setIsEditing] = useState(false);

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