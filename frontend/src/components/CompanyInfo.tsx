import React from 'react';
import { useCompany } from '../context/CompanyContext';

const CompanyInfo = () => {
  const { companyData, companyLoading } = useCompany();

  if (companyLoading) {
    return <div>Cargando datos de la empresa...</div>;
  }

  if (!companyData) {
    return <div>No se encontraron datos de la empresa para este usuario.</div>;
  }

  return (
    <div style={{border: '1px solid #ccc', padding: 24, borderRadius: 12, maxWidth: 500, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.07)'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16}}>
        <img src={companyData.avatar || 'https://ui-avatars.com/api/?name=Empresa&background=8B5CF6&color=fff&size=128&bold=true'} alt="Avatar de la empresa" width={80} height={80} style={{borderRadius: '50%', border: '2px solid #eee', objectFit: 'cover'}} />
        <div>
          <h2 style={{margin: 0, fontSize: 24, fontWeight: 700}}>{companyData.nombrecomercial}</h2>
          <p style={{margin: 0, color: '#666'}}>{companyData.email}</p>
        </div>
      </div>
      <div style={{marginBottom: 8}}><b>RIF:</b> {companyData.rif}</div>
      <div style={{marginBottom: 8}}><b>Razón Social:</b> {companyData.razonsocial}</div>
      <div style={{marginBottom: 8}}><b>Descripción:</b> {companyData.descripcion}</div>
      <div style={{marginBottom: 8}}><b>Dirección:</b> {companyData.direccion}</div>
      <div style={{marginBottom: 8}}><b>Teléfono:</b> {companyData.telefono}</div>
      <div style={{marginBottom: 8}}><b>Fecha de Fundación:</b> {companyData.fecha_fundacion ? companyData.fecha_fundacion.slice(0, 10) : '-'}</div>
    </div>
  );
};

export default CompanyInfo; 