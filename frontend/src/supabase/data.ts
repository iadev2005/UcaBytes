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

// Eliminar un producto y su inventario
export async function deleteProduct(id_producto: number) {
  try {
    // 1. Eliminar el inventario asociado
    const { error: inventarioError } = await client
      .from('inventario')
      .delete()
      .eq('id_producto', id_producto);

    if (inventarioError) {
      return { success: false, message: 'No se pudo eliminar el inventario: ' + inventarioError.message };
    }

    // 2. Eliminar el producto
    const { error: productoError } = await client
      .from('productos')
      .delete()
      .eq('id', id_producto);

    if (productoError) {
      return { success: false, message: 'No se pudo eliminar el producto: ' + productoError.message };
    }

    return { success: true, message: '¡Producto eliminado con éxito!' };
  } catch (err) {
    console.error(err);
    return { success: false, message: 'No se pudo eliminar el producto.' };
  }
}

// Subir imagen a Supabase Storage
export async function uploadImage(file: File, fileName: string) {
  try {
    const { data, error } = await client.storage
      .from('product-images')
      .upload(fileName, file);

    if (error) {
      return { success: false, message: 'Error subiendo imagen: ' + error.message };
    }

    // Obtener la URL pública de la imagen
    const { data: urlData } = client.storage
      .from('product-images')
      .getPublicUrl(fileName);

    return { success: true, url: urlData.publicUrl };
  } catch (err) {
    console.error(err);
    return { success: false, message: 'Error subiendo imagen.' };
  }
}
