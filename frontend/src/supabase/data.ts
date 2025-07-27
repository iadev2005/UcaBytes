import {client} from  '../supabase/client'

//obtener los datos de una empresa medante el correo del usuario 
export async function getCompany(email:string) {
    
    try{
        const result = await client
        .from('empresas')
        .select('*')
        .eq('email', email)

        return result
    }catch(err){
        console.error(err)
        throw err
    }
    
}

// Actualizar los datos de la empresa por id
export async function updateCompany(id: number, data: {
  rif: string;
  razonsocial: string;
  descripcion: string;
  direccion: string;
  telefono: string;
  fecha_fundacion: string;
}) {
  try {
    const { error } = await client
      .from('empresas')
      .update(data)
      .eq('id', id);
    if (error) {
      return { success: false, message: 'No se pudieron actualizar los datos: ' + error.message };
    }
    return { success: true, message: '¡Datos actualizados con éxito!' };
  } catch (err) {
    console.error(err);
    return { success: false, message: 'No se pudieron actualizar los datos.' };
  }
}


// Crear un nuevo producto y su inventario asociado
export async function createProductWithInventory({
  nombre,
  descripcion,
  cantidad_minima,
  cantidad_maxima,
  categoria,
  imagen_producto,
  precio_venta,
  cantidad_actual,
  id_empresa
}: {
  nombre: string;
  descripcion: string;
  cantidad_minima: number;
  cantidad_maxima: number;
  categoria: string;
  imagen_producto: string;
  precio_venta: number;
  cantidad_actual: number;
  id_empresa: number;
}) {
  try {
    // 1. Insertar producto
    const { data: productoData, error: productoError } = await client
      .from('productos')
      .insert([
        {
          nombre,
          descripcion,
          cantidad_minima,
          cantidad_maxima,
          categoria,
          imagen: imagen_producto
        }
      ])
      .select();

    if (productoError || !productoData || productoData.length === 0) {
      return { success: false, message: 'No se pudo crear el producto: ' + (productoError?.message || 'Error desconocido') };
    }

    const producto = productoData[0];

    // 2. Insertar inventario
    const { data: inventarioData, error: inventarioError } = await client
      .from('inventario')
      .insert([
        {
          id_empresa,
          id_producto: producto.id,
          precio_venta,
          cantidad_actual
        }
      ])
      .select();

    if (inventarioError) {
      return { success: false, message: 'Producto creado, pero no se pudo crear el inventario: ' + inventarioError.message };
    }

    return { success: true, message: '¡Producto y stock creados con éxito!', producto, inventario: inventarioData[0] };
  } catch (err) {
    console.error(err);
    return { success: false, message: 'No se pudo crear el producto o inventario.' };
  }
}

// Obtener productos con inventario para una empresa
export async function getProductsByCompany(id_empresa: number) {
  try {
    const { data, error } = await client
      .from('inventario')
      .select(`
        id_empresa,
        id_producto,
        precio_venta,
        cantidad_actual,
        productos (
          id,
          nombre,
          descripcion,
          cantidad_minima,
          cantidad_maxima,
          imagen,
          categoria
        )
      `)
      .eq('id_empresa', id_empresa);
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error(err);
    return { success: false, data: [], error: err };
  }
}


/*
LINK PARA SUBIR FOTOS AL STORAGE 

https://UcaBytes.supabase.co/storage/v1/object/public/avatars/mi_avatar.jpg

import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

// Configuración del cliente Supabase
const supabase = createClient('https://UcaBytes.supabase.co', 'TU_ANON_KEY')

// Función para subir avatar
async function uploadAvatar(file: File, empresaId: number) {
  try {
    // Generar nombre único para el archivo
    const fileExt = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Subir archivo al Storage
    const { data, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    // Actualizar registro de Empresa con el nombre del archivo
    const { error: updateError } = await supabase
      .from('Empresas')
      .update({ avatar: fileName })
      .eq('id', empresaId)

    if (updateError) {
      throw updateError
    }

    // Obtener URL pública del avatar
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    console.error('Error uploading avatar:', error)
    return null
  }
}

// Ejemplo de uso en un componente React
function AvatarUpload() {
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const empresaId = 123 // ID de la empresa obtenido de tu contexto
      const avatarUrl = await uploadAvatar(file, empresaId)
      if (avatarUrl) {
        // Actualizar UI con la nueva URL del avatar
      }
    }
  }

  return (
    <input 
      type="file" 
      accept="image/*" 
      onChange={handleFileUpload} 
    />
  )
}

*/
