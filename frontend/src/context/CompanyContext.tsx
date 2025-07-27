import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getCompany } from '../supabase/data';
import { client } from '../supabase/client';

interface CompanyData {
  id: number;
  email: string;
  nombrecomercial: string;
  rif: string;
  razonsocial: string;
  descripcion: string;
  avatar: string;
  direccion: string;
  fecha_fundacion: string;
  telefono: string;
}

interface CompanyContextType {
  companyData: CompanyData | null;
  updateCompanyData: (data: Partial<CompanyData>) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  companyLoading: boolean;
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
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [companyLoading, setCompanyLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      setCompanyLoading(true);
      try {
        const { data: sessionData } = await client.auth.getSession();
        const email = sessionData?.session?.user?.email;
        if (email) {
          const { data, error } = await getCompany(email);
          if (error) {
            console.error('Error fetching company:', error);
            setCompanyData(null);
          } else if (data && data.length > 0) {
            setCompanyData(data[0]);
          } else {
            setCompanyData(null);
          }
        } else {
          setCompanyData(null);
        }
      } catch (error) {
        console.error('Error fetching company data:', error);
        setCompanyData(null);
      } finally {
        setCompanyLoading(false);
      }
    };
    fetchCompany();
  }, []);

  const updateCompanyData = (data: Partial<CompanyData>) => {
    setCompanyData(prev => prev ? { ...prev, ...data } : prev);
  };

  return (
    <CompanyContext.Provider value={{
      companyData,
      updateCompanyData,
      isEditing,
      setIsEditing,
      companyLoading
    }}>
      {children}
    </CompanyContext.Provider>
  );
}; 