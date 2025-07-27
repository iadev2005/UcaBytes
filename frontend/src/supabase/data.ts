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

// Crear una nueva venta con productos
export async function createSale({
  cliente,
  productos,
  metodoPago,
  fechaVenta,
  fechaPago,
  total,
  id_empresa
}: {
  cliente: {
    nombre: string;
    email: string;
    telefono: string;
    direccion: string;
    ci?: string;
    apellido?: string;
  };
  productos: Array<{
    id_producto: number;
    cantidad: number;
    precio: number;
  }>;
  metodoPago: string;
  fechaVenta: string;
  fechaPago?: string;
  total: number;
  id_empresa: number;
}) {
  try {
    // 1. Crear o actualizar cliente
    const ci_cliente = cliente.ci || `CI-${Date.now()}`; // Usar CI existente o generar uno temporal
    const { error: clienteError } = await client
      .from('clientes')
      .upsert({
        ci: ci_cliente,
        nombre: cliente.nombre,
        apellido: cliente.apellido || cliente.nombre, // Usar apellido si existe, sino usar nombre
        email: cliente.email,
        telefono: cliente.telefono
      });

    if (clienteError) {
      return { success: false, message: 'No se pudo crear/actualizar el cliente: ' + clienteError.message };
    }

    // 2. Relacionar cliente con empresa
    const { error: clienteEmpresaError } = await client
      .from('clientesempresa')
      .upsert({
        id_empresa,
        ci_cliente
      });

    if (clienteEmpresaError) {
      return { success: false, message: 'No se pudo relacionar el cliente con la empresa: ' + clienteEmpresaError.message };
    }

    // 3. Crear orden de venta
    const referencia = `V-${Date.now()}`;
    const { data: ordenVentaData, error: ordenVentaError } = await client
      .from('ordenventa')
      .insert({
        descripcion: `Venta de ${productos.length} productos`,
        fechaventa: fechaVenta,
        referencia,
        ci_cliente,
        id_empresa
      })
      .select();

    if (ordenVentaError || !ordenVentaData || ordenVentaData.length === 0) {
      return { success: false, message: 'No se pudo crear la orden de venta: ' + (ordenVentaError?.message || 'Error desconocido') };
    }

    const ordenVenta = ordenVentaData[0];

    // 4. Agregar productos a la orden de venta
    const productosVenta = productos.map(producto => ({
      nro_orden: ordenVenta.nro_orden,
      id_producto: producto.id_producto,
      precio: producto.precio,
      cantidad: producto.cantidad
    }));

    const { error: productosError } = await client
      .from('ordenventaproductos')
      .insert(productosVenta);

    if (productosError) {
      return { success: false, message: 'No se pudo agregar los productos a la venta: ' + productosError.message };
    }

    // 5. Actualizar inventario (reducir stock)
    for (const producto of productos) {
      // Primero obtener la cantidad actual
      const { data: inventarioActual } = await client
        .from('inventario')
        .select('cantidad_actual')
        .eq('id_empresa', id_empresa)
        .eq('id_producto', producto.id_producto)
        .single();

      if (inventarioActual) {
        const nuevaCantidad = inventarioActual.cantidad_actual - producto.cantidad;
        const { error: inventarioError } = await client
          .from('inventario')
          .update({ cantidad_actual: nuevaCantidad })
          .eq('id_empresa', id_empresa)
          .eq('id_producto', producto.id_producto);

        if (inventarioError) {
          console.error('Error actualizando inventario para producto:', producto.id_producto, inventarioError);
        }
      }
    }

    return { 
      success: true, 
      message: '¡Venta creada con éxito!', 
      venta: {
        ...ordenVenta,
        cliente,
        productos,
        total
      }
    };
  } catch (err) {
    console.error(err);
    return { success: false, message: 'No se pudo crear la venta.' };
  }
}

// Obtener ventas de una empresa
export async function getSalesByCompany(id_empresa: number) {
  try {
    const { data, error } = await client
      .from('ordenventa')
      .select(`
        nro_orden,
        descripcion,
        fechaventa,
        referencia,
        ci_cliente,
        id_empresa,
        clientes (
          ci,
          nombre,
          apellido,
          email,
          telefono
        ),
        ordenventaproductos (
          cantidad,
          precio,
          productos (
            id,
            nombre,
            descripcion,
            categoria,
            imagen
          )
        )
      `)
      .eq('id_empresa', id_empresa)
      .order('fechaventa', { ascending: false });

    if (error) throw error;

    // Transformar datos al formato esperado
    const ventasTransformadas = data.map(venta => {
      const cliente = Array.isArray(venta.clientes) ? venta.clientes[0] : venta.clientes;
      return {
        id: venta.nro_orden,
        cliente: {
          nombre: `${cliente?.nombre || ''} ${cliente?.apellido || ''}`.trim(),
          email: cliente?.email || '',
          telefono: cliente?.telefono || '',
          direccion: ''
        },
        productos: venta.ordenventaproductos.map((item: any) => ({
          id_producto: item.productos.id,
          nombre_producto: item.productos.nombre,
          descripcion_producto: item.productos.descripcion,
          precio_producto: item.precio,
          categoria_producto: item.productos.categoria,
          stock_producto: 0, // No disponible en esta consulta
          imagen_producto: item.productos.imagen,
          cantidad: item.cantidad,
          subtotal: item.precio * item.cantidad
        })),
        metodoPago: 'Efectivo', // No disponible en la BD
        fechaVenta: venta.fechaventa,
        fechaPago: null, // No disponible en la BD
        total: venta.ordenventaproductos.reduce((sum: number, item: any) => sum + (item.precio * item.cantidad), 0),
        pagada: true // Asumimos que todas las ventas están pagadas
      };
    });

    return { success: true, data: ventasTransformadas };
  } catch (err) {
    console.error(err);
    return { success: false, data: [], error: err };
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

// Obtener servicios por empresa
export async function getServicesByCompany(id_empresa: number) {
  try {
    const { data, error } = await client
      .from('servicios')
      .select('*')
      .eq('id_empresa', id_empresa)
      .order('nro_servicio', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error obteniendo servicios:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

// Crear un nuevo servicio
export async function createService({
  nombre,
  descripcion,
  plazo,
  precio,
  id_empresa
}: {
  nombre: string;
  descripcion: string;
  plazo?: string;
  precio: number;
  id_empresa: number;
}) {
  try {
    // Obtener el siguiente número de servicio para esta empresa
    const { data: maxService, error: maxError } = await client
      .from('servicios')
      .select('nro_servicio')
      .eq('id_empresa', id_empresa)
      .order('nro_servicio', { ascending: false })
      .limit(1);

    const nextServiceNumber = maxService && maxService.length > 0 ? maxService[0].nro_servicio + 1 : 1;

    // Insertar el nuevo servicio
    const { data, error } = await client
      .from('servicios')
      .insert([
        {
          id_empresa,
          nro_servicio: nextServiceNumber,
          nombre,
          descripcion,
          plazo: plazo ? new Date(plazo) : null,
          precio
        }
      ])
      .select();

    if (error) {
      return { success: false, message: 'No se pudo crear el servicio: ' + error.message };
    }

    return { success: true, data: data[0], message: 'Servicio creado exitosamente' };
  } catch (error) {
    console.error('Error creando servicio:', error);
    return { success: false, message: 'Error interno del servidor' };
  }
}

// Actualizar un servicio existente
export async function updateService({
  id_empresa,
  nro_servicio,
  nombre,
  descripcion,
  plazo,
  precio
}: {
  id_empresa: number;
  nro_servicio: number;
  nombre: string;
  descripcion: string;
  plazo?: string;
  precio: number;
}) {
  try {
    const { data, error } = await client
      .from('servicios')
      .update({
        nombre,
        descripcion,
        plazo: plazo ? new Date(plazo) : null,
        precio
      })
      .eq('id_empresa', id_empresa)
      .eq('nro_servicio', nro_servicio)
      .select();

    if (error) {
      return { success: false, message: 'No se pudo actualizar el servicio: ' + error.message };
    }

    return { success: true, data: data[0], message: 'Servicio actualizado exitosamente' };
  } catch (error) {
    console.error('Error actualizando servicio:', error);
    return { success: false, message: 'Error interno del servidor' };
  }
}

// Eliminar un servicio
export async function deleteService(id_empresa: number, nro_servicio: number) {
  try {
    const { error } = await client
      .from('servicios')
      .delete()
      .eq('id_empresa', id_empresa)
      .eq('nro_servicio', nro_servicio);

    if (error) {
      return { success: false, message: 'No se pudo eliminar el servicio: ' + error.message };
    }

    return { success: true, message: 'Servicio eliminado exitosamente' };
  } catch (error) {
    console.error('Error eliminando servicio:', error);
    return { success: false, message: 'Error interno del servidor' };
  }
}

// Buscar cliente existente por email o teléfono
export async function findExistingClient(email?: string, telefono?: string) {
  try {
    let query = client.from('clientes').select('*');
    
    if (email && telefono) {
      query = query.or(`email.eq.${email},telefono.eq.${telefono}`);
    } else if (email) {
      query = query.eq('email', email);
    } else if (telefono) {
      query = query.eq('telefono', telefono);
    } else {
      return { success: false, data: null, message: 'Se requiere email o teléfono para buscar cliente' };
    }

    const { data, error } = await query;
    
    if (error) {
      return { success: false, data: null, message: 'Error buscando cliente: ' + error.message };
    }

    return { success: true, data: data && data.length > 0 ? data[0] : null, message: data && data.length > 0 ? 'Cliente encontrado' : 'Cliente no encontrado' };
  } catch (error) {
    console.error('Error buscando cliente:', error);
    return { success: false, data: null, message: 'Error interno del servidor' };
  }
}

// Buscar cliente existente por CI
export async function findClientByCI(ci: string) {
  try {
    const { data, error } = await client
      .from('clientes')
      .select('*')
      .eq('ci', ci)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: true, data: null, message: 'Cliente no encontrado' };
      }
      return { success: false, data: null, message: 'Error buscando cliente: ' + error.message };
    }

    return { success: true, data, message: 'Cliente encontrado' };
  } catch (error) {
    console.error('Error buscando cliente por CI:', error);
    return { success: false, data: null, message: 'Error interno del servidor' };
  }
}

// Obtener todos los clientes de una empresa
export async function getClientsByCompany(id_empresa: number) {
  try {
    console.log('🔍 Buscando clientes para empresa:', id_empresa);
    
    // Primero obtener los CIs de clientes de la empresa
    const { data: clientesEmpresa, error: errorCE } = await client
      .from('clientesempresa')
      .select('ci_cliente')
      .eq('id_empresa', id_empresa);

    console.log('📋 Resultado de clientesempresa:', { data: clientesEmpresa, error: errorCE });

    if (errorCE) {
      console.error('❌ Error obteniendo clientesempresa:', errorCE);
      return { success: false, error: errorCE.message };
    }

    if (!clientesEmpresa || clientesEmpresa.length === 0) {
      console.log('ℹ️ No hay clientes asociados a esta empresa');
      return { success: true, data: [] };
    }

    // Obtener los datos de los clientes
    const cis = clientesEmpresa.map(ce => ce.ci_cliente);
    console.log('🆔 CIs de clientes encontrados:', cis);
    
    const { data, error } = await client
      .from('clientes')
      .select(`
        ci,
        nombre,
        apellido,
        email,
        telefono
      `)
      .in('ci', cis)
      .order('nombre', { ascending: true });

    console.log('👥 Resultado de clientes:', { data, error });

    if (error) {
      console.error('❌ Error obteniendo datos de clientes:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Clientes obtenidos exitosamente:', data?.length || 0);
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('❌ Error obteniendo clientes:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

// Crear venta de servicios
export async function createServiceSale({
  cliente,
  servicios,
  metodoPago,
  fechaServicio,
  fechaPago,
  total,
  id_empresa
}: {
  cliente: {
    nombre: string;
    email: string;
    telefono: string;
    direccion: string;
    ci?: string;
    apellido?: string;
  };
  servicios: Array<{
    nombre_servicio: string;
    descripcion_servicio: string;
    precio_servicio: string;
    cantidad: number;
  }>;
  metodoPago: string;
  fechaServicio: string;
  fechaPago?: string;
  total: number;
  id_empresa: number;
}) {
  try {
    // 1. Crear o actualizar cliente
    const ci_cliente = cliente.ci || `CI-${Date.now()}`; // Usar CI existente o generar uno temporal
    const { error: clienteError } = await client
      .from('clientes')
      .upsert({
        ci: ci_cliente,
        nombre: cliente.nombre,
        apellido: cliente.apellido || cliente.nombre, // Usar apellido si existe, sino usar nombre
        email: cliente.email,
        telefono: cliente.telefono
      });

    if (clienteError) {
      return { success: false, message: 'No se pudo crear/actualizar el cliente: ' + clienteError.message };
    }

    // 2. Relacionar cliente con empresa
    const { error: clienteEmpresaError } = await client
      .from('clientesempresa')
      .upsert({
        id_empresa,
        ci_cliente
      });

    if (clienteEmpresaError) {
      return { success: false, message: 'No se pudo relacionar el cliente con la empresa: ' + clienteEmpresaError.message };
    }

    // 3. Crear orden de venta
    const referencia = `S-${Date.now()}`;
    const { data: ordenVentaData, error: ordenVentaError } = await client
      .from('ordenventa')
      .insert({
        descripcion: `Venta de ${servicios.length} servicios`,
        fechaventa: fechaServicio,
        referencia,
        ci_cliente,
        id_empresa
      })
      .select();

    if (ordenVentaError || !ordenVentaData || ordenVentaData.length === 0) {
      return { success: false, message: 'No se pudo crear la orden de venta: ' + (ordenVentaError?.message || 'Error desconocido') };
    }

    const ordenVenta = ordenVentaData[0];

    // 4. Agregar servicios a la orden de venta
    for (const servicio of servicios) {
      // Buscar el servicio en la base de datos
      const { data: servicioData, error: servicioError } = await client
        .from('servicios')
        .select('nro_servicio')
        .eq('id_empresa', id_empresa)
        .eq('nombre', servicio.nombre_servicio)
        .single();

      if (servicioError || !servicioData) {
        console.warn(`Servicio no encontrado: ${servicio.nombre_servicio}`);
        continue;
      }

      // Insertar en ordenventaservicios
      const { error: ordenServicioError } = await client
        .from('ordenventaservicios')
        .insert({
          nro_orden: ordenVenta.nro_orden,
          id_empresa,
          nro_servicio: servicioData.nro_servicio,
          fecha_vencimiento: fechaPago ? new Date(fechaPago) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días por defecto
          estado: fechaPago ? 'PAGADO' : 'VIGENTE'
        });

      if (ordenServicioError) {
        console.error('Error insertando servicio en orden:', ordenServicioError);
      }
    }

    return { success: true, message: 'Venta de servicios creada exitosamente' };
  } catch (error) {
    console.error('Error creando venta de servicios:', error);
    return { success: false, message: 'Error interno del servidor' };
  }
}

// Obtener ventas de servicios de una empresa
export async function getServiceSalesByCompany(id_empresa: number) {
  try {
    const { data: ventas, error } = await client
      .from('ordenventa')
      .select(`
        nro_orden,
        descripcion,
        fechaventa,
        referencia,
        ci_cliente,
        id_empresa,
        clientes (
          ci,
          nombre,
          apellido,
          email,
          telefono
        ),
        ordenventaservicios (
          id_empresa,
          nro_servicio,
          fecha_vencimiento,
          estado,
          servicios (
            nombre,
            descripcion,
            precio
          )
        )
      `)
      .eq('id_empresa', id_empresa)
      .order('fechaventa', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    // Transformar los datos al formato esperado
    const ventasTransformadas = ventas?.map(venta => {
      const cliente = Array.isArray(venta.clientes) ? venta.clientes[0] : venta.clientes;
      const servicios = venta.ordenventaservicios?.map((ovs: any) => ({
        nombre_servicio: ovs.servicios?.nombre || 'Servicio desconocido',
        descripcion_servicio: ovs.servicios?.descripcion || '',
        precio_servicio: ovs.servicios?.precio?.toString() || '0',
        cantidad: 1,
        subtotal: ovs.servicios?.precio || 0
      })) || [];

      return {
        id: venta.nro_orden,
        servicios,
        cliente: {
          ci: cliente?.ci || '',
          nombre: cliente?.nombre || '',
          apellido: cliente?.apellido || '',
          email: cliente?.email || '',
          telefono: cliente?.telefono || '',
          direccion: ''
        },
        metodoPago: 'Efectivo', // Por defecto, ya que no está en el esquema
        fechaServicio: venta.fechaventa,
        fechaPago: venta.ordenventaservicios?.some((ovs: any) => ovs.estado === 'PAGADO') ? venta.fechaventa : undefined,
        total: servicios.reduce((sum, s) => sum + (s.subtotal || 0), 0),
        pagado: venta.ordenventaservicios?.some((ovs: any) => ovs.estado === 'PAGADO') || false
      };
    }) || [];

    return { success: true, data: ventasTransformadas };
  } catch (error) {
    console.error('Error obteniendo ventas de servicios:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}
