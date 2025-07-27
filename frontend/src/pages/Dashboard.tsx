import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend, PieChart, Pie, Cell } from 'recharts';
import { useEffect, useState } from 'react';
import LoadingScreen from '../components/marketing/LoadingScreen';
import TokenInputModal from '../components/marketing/TokenInputModal';
import { cn } from '../lib/utils';

interface FollowerData {
  name: string;
  seguidores: number;
  originalDate?: string;
}

interface DemographicsData {
  gender: Record<string, number>;
  age: Record<string, number>;
  city: Record<string, number>;
}

const AGE_RANGES = [
  { id: '13-17', label: '13 a 17 años', fill: '#8884d8' },
  { id: '18-24', label: '18 a 24 años', fill: '#83a6ed' },
  { id: '25-34', label: '25 a 34 años', fill: '#8dd1e1' },
  { id: '35-44', label: '35 a 44 años', fill: '#82ca9d' },
  { id: '45-54', label: '45 a 54 años', fill: '#a4de6c' },
  { id: '55-64', label: '55 a 64 años', fill: '#d0ed57' },
  { id: '65+', label: '65 años o más', fill: '#ffc658' },
];

const GENDER_COLORS: { [key: string]: string } = {
  F: '#FF69B4',  // Rosa para Femenino
  M: '#4169E1',  // Azul para Masculino
  U: '#808080'   // Gris para No especificado
};

// Label personalizado para pie charts de productos y servicios
const renderCustomPieLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent, index, nombre, tipo, porcentaje
}: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.15;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Usar nombre o tipo según el gráfico
  const labelText = nombre || tipo || '';
  const texto = `${labelText.length > 10 ? labelText.slice(0, 10) + '...' : labelText} ${porcentaje !== undefined ? porcentaje + '%' : ''}`;

  return (
    <text
      x={x}
      y={y}
      fill="#4F46E5"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={11}
      fontWeight={500}
      style={{ pointerEvents: 'none' }}
    >
      {texto}
    </text>
  );
};

export default function Dashboard() {
  const [followersData, setFollowersData] = useState<FollowerData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataUpdating, setDataUpdating] = useState(true);
  const [growthPercentage, setGrowthPercentage] = useState(0);
  const [firstDate, setFirstDate] = useState<string>('');
  const [demographics, setDemographics] = useState<DemographicsData | null>(null);
  const [currentFollowers, setCurrentFollowers] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState('marketing');
  const [reachData, setReachData] = useState(0);
  const [impressionsData, setImpressionsData] = useState(0);
  
  // Estados para datos de operaciones centrales
  const [ventasData, setVentasData] = useState<any[]>([]);
  const [serviciosData, setServiciosData] = useState<any[]>([]);
  const [empleadosData, setEmpleadosData] = useState<any[]>([]);
  const [productosData, setProductosData] = useState<any[]>([]);
  
  // Estados para el token de Instagram
  const [instagramToken, setInstagramToken] = useState<string>('');
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [validatingToken, setValidatingToken] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Función para cargar token guardado
  const loadSavedToken = async () => {
    const savedToken = localStorage.getItem('instagram_token');
    const tokenValid = localStorage.getItem('instagram_token_valid');
    
    if (savedToken && tokenValid === 'true') {
      // Validar el token guardado para asegurar que sigue siendo válido
      try {
        const response = await fetch('http://localhost:3001/api/instagram/validate-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: savedToken }),
        });
        
        const data = await response.json();
        
        if (data.valid) {
          setInstagramToken(savedToken);
          return true;
        } else {
          // Token ya no es válido, limpiarlo
          clearInvalidToken();
          return false;
        }
      } catch (error) {
        // Error de conexión, limpiar token por seguridad
        clearInvalidToken();
        return false;
      }
    }
    return false;
  };

  // Función para guardar token válido
  const saveValidToken = (token: string) => {
    localStorage.setItem('instagram_token', token);
    localStorage.setItem('instagram_token_valid', 'true');
  };

  // Función para limpiar token inválido
  const clearInvalidToken = () => {
    localStorage.removeItem('instagram_token');
    localStorage.removeItem('instagram_token_valid');
  };

  // Función para validar el token de Instagram
  const validateInstagramToken = async (token: string) => {
    setValidatingToken(true);
    setTokenError(null);
    
    try {
      const response = await fetch('http://localhost:3001/api/instagram/validate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      
      const data = await response.json();
      
      if (data.valid) {
        setInstagramToken(token);
        saveValidToken(token); // Guardar token válido
        setShowTokenModal(false);
        setTokenError(null);
        return true;
      } else {
        setTokenError(data.error || 'Token inválido');
        clearInvalidToken(); // Limpiar token inválido
        return false;
      }
    } catch (error) {
      setTokenError('Error de conexión al validar el token');
      return false;
    } finally {
      setValidatingToken(false);
    }
  };

  const handleTokenSubmit = async (token: string) => {
    const isValid = await validateInstagramToken(token);
    if (isValid) {
      // Ejecutar la actualización de datos después de validar el token
      updateAndFetchData();
    }
  };

  const handleTokenModalClose = () => {
    // Solo permitir cerrar si hay un token válido
    if (instagramToken) {
      setShowTokenModal(false);
      setTokenError(null);
    }
  };

  // Cargar datos de operaciones centrales
  useEffect(() => {
    const cargarDatosOperaciones = () => {
      try {
        // Cargar ventas
        const ventasGuardadas = localStorage.getItem('ventas');
        if (ventasGuardadas) {
          const ventas = JSON.parse(ventasGuardadas);
          setVentasData(ventas);
        }

        // Cargar servicios
        const serviciosGuardados = localStorage.getItem('ventasServicios');
        if (serviciosGuardados) {
          const servicios = JSON.parse(serviciosGuardados);
          setServiciosData(servicios);
        }

        // Cargar empleados
        const empleadosGuardados = localStorage.getItem('empleados');
        if (empleadosGuardados) {
          const empleados = JSON.parse(empleadosGuardados);
          setEmpleadosData(empleados);
        }

        // Cargar productos (desde ProductsServices)
        const productosGuardados = localStorage.getItem('productos');
        if (productosGuardados) {
          const productos = JSON.parse(productosGuardados);
          setProductosData(productos);
        }

        // Cargar servicios del catálogo (desde ProductsServices)
        const serviciosCatalogoGuardados = localStorage.getItem('servicios');
        if (serviciosCatalogoGuardados) {
          const serviciosCatalogo = JSON.parse(serviciosCatalogoGuardados);
          // Aquí podrías usar serviciosCatalogo si necesitas datos del catálogo de servicios
        }
      } catch (error) {
        console.error('Error al cargar datos de operaciones centrales:', error);
      }
    };

    cargarDatosOperaciones();
  }, []);

  // Funciones para procesar datos reales
  const procesarDatosVentas = () => {
    if (!ventasData.length) return { totalVentas: 0, ventasMes: 0, clientesUnicos: 0, ticketPromedio: 0, ventasMensuales: [], productosVendidos: [] };

    const totalVentas = ventasData.reduce((total, venta) => total + (venta.total || 0), 0);
    const ventasMes = ventasData.filter(venta => {
      const fechaVenta = new Date(venta.fechaVenta || new Date());
      const ahora = new Date();
      return fechaVenta.getMonth() === ahora.getMonth() && fechaVenta.getFullYear() === ahora.getFullYear();
    }).reduce((total, venta) => total + (venta.total || 0), 0);

    const clientesUnicos = new Set(ventasData.map(venta => venta.cliente?.nombre || 'Cliente sin nombre')).size;
    const ticketPromedio = totalVentas / ventasData.length;

    // Agrupar ventas por mes
    const ventasPorMes = ventasData.reduce((acc, venta) => {
      const fecha = new Date(venta.fechaVenta || new Date());
      const mes = fecha.toLocaleDateString('es-ES', { month: 'short' });
      if (!acc[mes]) acc[mes] = 0;
      acc[mes] += venta.total || 0;
      return acc;
    }, {} as Record<string, number>);

    const ventasMensuales = Object.entries(ventasPorMes).map(([mes, total]) => ({
      mes,
      ventas: total
    }));

    // Procesar productos vendidos usando los campos correctos
    const productosVendidos = ventasData.reduce((acc, venta) => {
      if (venta.productos && Array.isArray(venta.productos)) {
        venta.productos.forEach((prod: any) => {
          const nombre = prod.nombre_producto || 'Producto sin nombre';
          if (!acc[nombre]) acc[nombre] = 0;
          acc[nombre] += (prod.cantidad as number) || 1;
        });
      }
      return acc;
    }, {} as Record<string, number>);

    const totalProductosVendidos = Object.values(productosVendidos).reduce((a, b) => (a as number) + (b as number), 0) as number;
    const productosVendidosArray = Object.entries(productosVendidos).map(([nombre, cantidad]) => ({
      nombre,
      cantidad,
      porcentaje: Math.round(((cantidad as number) / totalProductosVendidos) * 100)
    }));

    return { totalVentas, ventasMes, clientesUnicos, ticketPromedio, ventasMensuales, productosVendidos: productosVendidosArray };
  };

  const procesarDatosServicios = () => {
    if (!serviciosData.length) return { totalServicios: 0, ingresosServicios: 0, clientesUnicos: 0, serviciosMensuales: [], serviciosPorTipo: [] };

    const totalServicios = serviciosData.length;
    const ingresosServicios = serviciosData.reduce((total, servicio) => total + (servicio.total || 0), 0);
    const clientesUnicos = new Set(serviciosData.map(servicio => servicio.cliente?.nombre || 'Cliente sin nombre')).size;

    // Agrupar servicios por mes
    const serviciosPorMes = serviciosData.reduce((acc, servicio) => {
      const fecha = new Date(servicio.fechaServicio || new Date());
      const mes = fecha.toLocaleDateString('es-ES', { month: 'short' });
      if (!acc[mes]) acc[mes] = { servicios: 0, ingresos: 0 };
      acc[mes].servicios += 1;
      acc[mes].ingresos += servicio.total || 0;
      return acc;
    }, {} as Record<string, { servicios: number; ingresos: number }>);

    const serviciosMensuales = Object.entries(serviciosPorMes).map(([mes, data]) => ({
      mes,
      servicios: (data as any).servicios,
      ingresos: (data as any).ingresos
    }));

    // Procesar servicios por tipo usando los campos correctos
    const serviciosPorTipo = serviciosData.reduce((acc, servicio) => {
      if (servicio.servicios && Array.isArray(servicio.servicios)) {
        servicio.servicios.forEach((serv: any) => {
          const tipo = serv.nombre_servicio || 'Servicio General';
          if (!acc[tipo]) acc[tipo] = 0;
          acc[tipo] += (serv.cantidad as number) || 1;
        });
      }
      return acc;
    }, {} as Record<string, number>);

    const serviciosPorTipoArray = Object.entries(serviciosPorTipo).map(([tipo, cantidad]) => ({
      tipo,
      cantidad,
      porcentaje: Math.round(((cantidad as number) / totalServicios) * 100)
    }));

    return { totalServicios, ingresosServicios, clientesUnicos, serviciosMensuales, serviciosPorTipo: serviciosPorTipoArray };
  };

  const procesarDatosEmpleados = () => {
    if (!empleadosData.length) return { 
      totalEmpleados: 0, 
      salarioPromedio: 0, 
      empleadosPorCategoria: [], 
      empleadosPagados: 0,
      empleadosNuevos: 0,
      empleadosActuales: 0
    };

    const totalEmpleados = empleadosData.length;
    const salarioPromedio = empleadosData.reduce((total, emp) => total + (emp.salario || 0), 0) / totalEmpleados;
    const empleadosPagados = empleadosData.filter(emp => emp.pagado).length;
    
    // Simular empleados nuevos vs actuales (en un sistema real esto vendría de fechas de contratación)
    const empleadosNuevos = totalEmpleados > 1 ? Math.floor(totalEmpleados * 0.3) : 0; // 30% nuevos, mínimo 0
    const empleadosActuales = totalEmpleados - empleadosNuevos;

    // Agrupar empleados por categoría usando el campo correcto
    const empleadosPorCategoria = empleadosData.reduce((acc, emp) => {
      const categoria = emp.categoria || 'Sin categoría';
      if (!acc[categoria]) acc[categoria] = 0;
      acc[categoria] += 1;
      return acc;
    }, {} as Record<string, number>);

    const empleadosPorCategoriaArray = Object.entries(empleadosPorCategoria).map(([categoria, cantidad]) => ({
      categoria,
      cantidad: Number(cantidad)
    }));

    return { 
      totalEmpleados, 
      salarioPromedio, 
      empleadosPorCategoria: empleadosPorCategoriaArray, 
      empleadosPagados,
      empleadosNuevos,
      empleadosActuales
    };
  };

  const procesarDatosProductos = () => {
    if (!productosData.length) return { totalProductos: 0, valorInventario: 0, productosPorCategoria: [] };

    const totalProductos = productosData.length;
    const valorInventario = productosData.reduce((total, prod) => {
      return total + (parseFloat(prod.precio_producto || '0') * parseInt(prod.stock_producto || '0'));
    }, 0);

    // Agrupar productos por categoría usando el campo correcto
    const productosPorCategoria = productosData.reduce((acc, prod) => {
      const categoria = prod.categoria_producto || 'Sin categoría';
      if (!acc[categoria]) acc[categoria] = 0;
      acc[categoria] += 1;
      return acc;
    }, {} as Record<string, number>);

    const productosPorCategoriaArray = Object.entries(productosPorCategoria).map(([categoria, cantidad]) => ({
      categoria,
      cantidad
    }));

    return { totalProductos, valorInventario, productosPorCategoria: productosPorCategoriaArray };
  };

  useEffect(() => {
    // Cargar token guardado al inicio
    const initializeToken = async () => {
      const hasValidToken = await loadSavedToken();
      setInitializing(false);
      
      const updateAndFetchData = async () => {
      try {
        setDataUpdating(true);
        setError(null);
        
        // Verificar si hay token disponible
        if (!instagramToken) {
          setShowTokenModal(true);
          return;
        }
        
        // Primero ejecutar los scripts para actualizar los datos
        const updateResponse = await fetch('http://localhost:3001/api/update-dashboard-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: instagramToken }),
        });
        
        if (!updateResponse.ok) {
          throw new Error('Error al actualizar los datos');
        }
        setDataUpdating(false);
        setLoading(true);
        
        // Ahora cargar los datos actualizados
        const [demographicsResponse, followerInsightsResponse, instagramDetailsResponse, reachResponse, impressionsResponse] = await Promise.all([
          fetch('http://localhost:3001/api/demographics'),
          fetch('http://localhost:3001/api/follower-insights'),
          fetch('http://localhost:3001/api/instagram-details'),
          fetch('http://localhost:3001/api/reach-insights'),
          fetch('http://localhost:3001/api/impressions-insights')
        ]);
        
        if (!followerInsightsResponse.ok) {
          throw new Error(`Error HTTP en follower insights: ${followerInsightsResponse.status}`);
        }
        
        const demographicsJson = demographicsResponse.ok ? await demographicsResponse.json() : null;
        const followerInsightsJson = await followerInsightsResponse.json();
        const instagramDetailsJson = instagramDetailsResponse.ok ? await instagramDetailsResponse.json() : null;
        const reachJson = reachResponse.ok ? await reachResponse.json() : null;
        const impressionsJson = impressionsResponse.ok ? await impressionsResponse.json() : null;
        
        // Procesar datos de follower insights para el histograma (obligatorio)
        let processedFollowersData = [];
        if (followerInsightsJson && followerInsightsJson.data && followerInsightsJson.data[0] && followerInsightsJson.data[0].values) {
          const values = followerInsightsJson.data[0].values;
          processedFollowersData = values.map((item: { end_time: string; value: number }) => ({
            name: new Date(item.end_time).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
            seguidores: item.value,
            originalDate: item.end_time.split('T')[0]
          }));
          
          // Obtener el último valor para current followers
          const lastValue = values[values.length - 1];
          if (lastValue) {
            setCurrentFollowers(lastValue.value);
          }
        } else {
          throw new Error('No se pudieron obtener los datos de follower insights');
        }
        
        // Calculate growth percentage comparing yesterday vs today
        const sortedData = processedFollowersData.sort((a: FollowerData, b: FollowerData) => a.originalDate?.localeCompare(b.originalDate || '') || 0);
        
        if (sortedData.length >= 2) {
          // Buscar explícitamente las últimas dos fechas disponibles
          const allDates = sortedData.map((item: FollowerData) => item.originalDate).filter((date: string | undefined) => date);
          const uniqueDates = [...new Set(allDates)].sort();
          

          
          if (uniqueDates.length >= 2) {
            const todayDate = uniqueDates[uniqueDates.length - 1]; // Última fecha disponible
            const yesterdayDate = uniqueDates[uniqueDates.length - 2]; // Penúltima fecha disponible
            
            const todayData = sortedData.find((item: FollowerData) => item.originalDate === todayDate);
            const yesterdayData = sortedData.find((item: FollowerData) => item.originalDate === yesterdayDate);
            
            if (todayData && yesterdayData) {
              const todayFollowers = todayData.seguidores;
              const yesterdayFollowers = yesterdayData.seguidores;
              
              const growth = todayFollowers - yesterdayFollowers;
              let growthPercent = 0;
              
              if (yesterdayFollowers === 0 && todayFollowers === 0) {
                // Si ambos días son 0, no hay crecimiento
                growthPercent = 0;
              } else if (yesterdayFollowers === 0 && todayFollowers > 0) {
                // Si ayer era 0 y hoy hay seguidores, es crecimiento infinito (mostrar 100%)
                growthPercent = 100;
              } else {
                // Cálculo normal
                growthPercent = (growth / yesterdayFollowers) * 100;
              }
              setGrowthPercentage(Math.round(growthPercent));
              
              // Mostrar la fecha de ayer (día de referencia)
              // Agregar tiempo para evitar problemas de zona horaria
              const yesterdayDateObj = new Date(yesterdayDate + 'T12:00:00');
              setFirstDate(yesterdayDateObj.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              }));
            }
          }
        }

        setFollowersData(processedFollowersData);

        // Obtener el total real de seguidores desde instagram_details.json
        let totalFollowersFromDetails = currentFollowers; // fallback al valor anterior
        if (instagramDetailsJson && instagramDetailsJson.data && instagramDetailsJson.data[0]) {
          const instagramData = instagramDetailsJson.data[0];
          if (instagramData.instagram_business_account && instagramData.instagram_business_account.followers_count) {
            totalFollowersFromDetails = instagramData.instagram_business_account.followers_count;
            setCurrentFollowers(totalFollowersFromDetails);
          }
        }

        // Procesar datos de alcance (reach)
        if (reachJson && reachJson.data && reachJson.data[0] && reachJson.data[0].values) {
          const reachValues = reachJson.data[0].values;
          if (reachValues.length > 0) {
            const latestReach = reachValues[reachValues.length - 1].value;
            setReachData(latestReach);
          }
        }



        // Procesar datos de impresiones
        if (impressionsJson && impressionsJson.data && impressionsJson.data[0] && impressionsJson.data[0].values) {
          const impressionsValues = impressionsJson.data[0].values;
          if (impressionsValues.length > 0) {
            const latestImpressions = impressionsValues[impressionsValues.length - 1].value;
            setImpressionsData(latestImpressions);
          }
        }

        // Procesar datos demográficos del nuevo formato
        if (demographicsJson) {
          const processedDemographics = {
            gender: {},
            age: {},
            city: {}
          };
          
          // Extraer datos de género
          if (demographicsJson.gender && demographicsJson.gender.data && demographicsJson.gender.data[0]) {
            const genderData = demographicsJson.gender.data[0];
            if (genderData.total_value && genderData.total_value.breakdowns && genderData.total_value.breakdowns[0]) {
              const results = genderData.total_value.breakdowns[0].results;
              const genderObj: Record<string, number> = {};
              results.forEach((result: any) => {
                genderObj[result.dimension_values[0]] = result.value;
              });
              processedDemographics.gender = genderObj;
            }
          }
          
          // Extraer datos de edad
          if (demographicsJson.age && demographicsJson.age.data && demographicsJson.age.data[0]) {
            const ageData = demographicsJson.age.data[0];
            if (ageData.total_value && ageData.total_value.breakdowns && ageData.total_value.breakdowns[0]) {
              const results = ageData.total_value.breakdowns[0].results;
              const ageObj: Record<string, number> = {};
              results.forEach((result: any) => {
                ageObj[result.dimension_values[0]] = result.value;
              });
              processedDemographics.age = ageObj;
            }
          }
          
          // Extraer datos de ciudad
          if (demographicsJson.city && demographicsJson.city.data && demographicsJson.city.data[0]) {
            const cityData = demographicsJson.city.data[0];
            if (cityData.total_value && cityData.total_value.breakdowns && cityData.total_value.breakdowns[0]) {
              const results = cityData.total_value.breakdowns[0].results;
              const cityObj: Record<string, number> = {};
              results.forEach((result: any) => {
                cityObj[result.dimension_values[0]] = result.value;
              });
              processedDemographics.city = cityObj;
            }
          }
          
          setDemographics(processedDemographics);
        }

        setError(null);
      } catch (error) {
        console.error('Error completo:', error);
        setError('Error al cargar los datos del dashboard');
        setDataUpdating(false);
      } finally {
        setLoading(false);
      }
    };

      // Solo ejecutar updateAndFetchData si hay token
      if (instagramToken) {
        updateAndFetchData();
      } else if (!hasValidToken) {
        // Si no hay token y no se cargó uno válido, mostrar el modal inmediatamente
        setShowTokenModal(true);
      }
    };

    // Ejecutar la inicialización
    initializeToken();
  }, [instagramToken]); // eslint-disable-line react-hooks/exhaustive-deps

  const radialData = [
    {
      name: 'Crecimiento',
      value: Math.abs(growthPercentage),
      fill: growthPercentage >= 0 ? '#4CAF50' : '#f44336',
    },
  ];

  // Preparar datos para el gráfico de edad usando el total real de seguidores
  const ageData = demographics?.age ? (() => {
    // Calcular el total de seguidores especificados por edad (de demografía)
    const specifiedTotal = Object.values(demographics.age).reduce((sum, count) => sum + count, 0);
    // Calcular los no especificados (total real - especificados en demografía)
    const unspecified = currentFollowers - specifiedTotal;

    // Crear el array base con los rangos de edad
    const data = AGE_RANGES.map(range => {
      const count = demographics.age[range.id] || 0;
      return {
        name: range.label,
        value: currentFollowers > 0 ? (count / currentFollowers) * 100 : 0,
        fill: range.fill,
        count: count
      };
    });

    // Agregar los no especificados si hay alguno
    if (unspecified > 0) {
      data.push({
        name: 'No especificado',
        value: currentFollowers > 0 ? (unspecified / currentFollowers) * 100 : 0,
        fill: '#808080', // Gris para no especificados
        count: unspecified
      });
    }

    const finalData = data.sort((a, b) => b.value - a.value);
    return finalData;
  })() : [];

  // Preparar datos para el gráfico de género
  const genderData = demographics?.gender ? (() => {
    const female = demographics.gender['F'] || 0;
    const male = demographics.gender['M'] || 0;
    const unspecified = currentFollowers - (female + male);
    
    return [
      { 
        name: 'Femenino', 
        value: female, 
        key: 'F',
        percentage: currentFollowers > 0 ? ((female / currentFollowers) * 100).toFixed(1) : '0.0'
      },
      { 
        name: 'Masculino', 
        value: male, 
        key: 'M',
        percentage: currentFollowers > 0 ? ((male / currentFollowers) * 100).toFixed(1) : '0.0'
      },
      { 
        name: 'No especificado', 
        value: unspecified, 
        key: 'U',
        percentage: currentFollowers > 0 ? ((unspecified / currentFollowers) * 100).toFixed(1) : '0.0'
      }
    ].filter(item => item.value > 0);
  })() : [];

  // Preparar datos para el gráfico de ciudades (Top 5 + Otros + No especificados)
  const cityData = demographics?.city ? (() => {
    // Calcular el total de seguidores especificados por ciudad
    const specifiedTotal = Object.values(demographics.city).reduce((sum, count) => sum + count, 0);
    // Calcular los no especificados
    const unspecified = currentFollowers - specifiedTotal;

    // Obtener todas las ciudades y ordenarlas por cantidad
    const allCities = Object.entries(demographics.city)
      .map(([city, count]) => ({
        name: city,
        value: count
      }))
      .sort((a, b) => b.value - a.value);

    // Tomar las top 5 ciudades
    const top5Cities = allCities.slice(0, 5);
    
    // Calcular el total de "Otros" (ciudades fuera del top 5)
    const otherCities = allCities.slice(5);
    const othersTotal = otherCities.reduce((sum, city) => sum + city.value, 0);

    // Crear el array final
    const data = [...top5Cities];

    // Agregar "Otros" si hay ciudades fuera del top 5
    if (othersTotal > 0) {
      data.push({
        name: 'Otros',
        value: othersTotal
      });
    }

    // Agregar los no especificados si hay alguno
    if (unspecified > 0) {
      data.push({
        name: 'No especificado',
        value: unspecified
      });
    }

    return data;
  })() : [];

  // Función para renderizar el contenido según el tema
  const renderThemeContent = () => {
    switch (selectedTheme) {
      case 'marketing':
        return (
          <div className="w-full bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-8 mb-12">
            
            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-[var(--color-primary-50)] rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-[var(--color-primary-700)] mb-2">Seguidores Totales</h3>
                <p className="text-3xl font-bold text-[var(--color-primary-600)]">{currentFollowers.toLocaleString()}</p>
                <p className="text-sm text-[var(--color-primary-500)] mt-1">+{growthPercentage >= 0 ? '+' : ''}{growthPercentage}% vs ayer</p>
              </div>
              <div className="bg-[var(--color-secondary-50)] rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-[var(--color-secondary-700)] mb-2">Crecimiento</h3>
                <p className="text-3xl font-bold text-[var(--color-secondary-600)]">{growthPercentage >= 0 ? '+' : ''}{growthPercentage}%</p>
                <p className="text-sm text-[var(--color-secondary-500)] mt-1">Desde {firstDate}</p>
              </div>
              <div className="bg-[var(--color-primary-50)] rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-[var(--color-primary-700)] mb-2">Alcance</h3>
                <p className="text-3xl font-bold text-[var(--color-primary-600)]">{reachData.toLocaleString()}</p>
                <p className="text-sm text-[var(--color-primary-500)] mt-1">Últimos 30 días</p>
              </div>
              <div className="bg-[var(--color-secondary-50)] rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-[var(--color-secondary-700)] mb-2">Impresiones</h3>
                <p className="text-3xl font-bold text-[var(--color-secondary-600)]">{impressionsData.toLocaleString()}</p>
                <p className="text-sm text-[var(--color-secondary-500)] mt-1">Últimos 30 días</p>
              </div>
            </div>

            {/* Primera fila: Histograma y Crecimiento */}
            <div className="w-full flex flex-col md:flex-row gap-8 justify-center items-stretch">
              {/* Gráfico de barras */}
              <div className="bg-white rounded-3xl p-4 flex-1 flex flex-col items-center shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                <span className="text-xs mb-2 text-gray-500">Histórico de Seguidores en Instagram</span>
                {loading ? (
                  <div className="h-[200px] flex items-center justify-center">
                    <p>Cargando datos...</p>
                  </div>
                ) : error ? (
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-red-500">{error}</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={followersData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`${value} seguidores`, 'Seguidores']}
                        labelFormatter={(label) => `Fecha: ${label}`}
                      />
                      <Bar dataKey="seguidores" fill="#8ecae6" radius={[6, 6, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
              {/* Gráfico radial de crecimiento */}
              <div className="bg-white rounded-3xl p-4 flex-1 flex flex-col items-center relative shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                <span className="text-xs mb-2 text-gray-500">Crecimiento de Seguidores</span>
                <div className="relative w-[180px] h-[180px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="50%"
                      outerRadius="100%"
                      barSize={18}
                      data={radialData}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <RadialBar
                        dataKey="value"
                        background={{ fill: '#e5e7eb' }}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-black">
                      {growthPercentage >= 0 ? '+' : ''}{growthPercentage}%
                    </span>
                  </div>
                </div>
                <div className="mt-4 text-center text-xs text-gray-600">
                  <p>Crecimiento desde ayer:</p>
                  <p className="mt-1 font-semibold">{firstDate}</p>
                </div>
              </div>
            </div>

            {/* Segunda fila: Distribución por edad y ciudades */}
            <div className="w-full flex flex-col md:flex-row gap-8 justify-start">
              {/* Columna izquierda: Edad y Género */}
              <div className="w-full md:w-1/2 flex flex-col gap-8">
                {/* Distribución por edad */}
                <div className="bg-white rounded-3xl p-4 flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                  <span className="text-xs mb-2 text-gray-500 text-center w-full">
                    Distribución por Edad
                  </span>
                  {loading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <p>Cargando datos demográficos...</p>
                    </div>
                  ) : error ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-red-500">{error}</p>
                    </div>
                  ) : !demographics?.age ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <p>No hay datos demográficos disponibles</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <RadialBarChart
                        innerRadius="10%"
                        outerRadius="80%"
                        data={ageData}
                        startAngle={180}
                        endAngle={0}
                        cx="30%"
                        cy="55%"
                      >
                        <RadialBar
                          background
                          dataKey="value"
                        />
                        <Legend
                          iconSize={10}
                          width={180}
                          height={140}
                          layout="vertical"
                          verticalAlign="middle"
                          align="right"
                          wrapperStyle={{
                            top: '15%',
                            right: 20,
                            transform: 'translate(0, 0)',
                            lineHeight: '24px'
                          }}
                          formatter={(_value: string, entry: any) => {
                            // Mostrar en la leyenda: "Rango - Cantidad"
                            const data = entry.payload;
                            return `${data.name} - ${data.count}`;
                          }}
                        />
                        <Tooltip
                          formatter={(value: number, _name: string, entry: any) => {
                            const data = entry.payload;
                            return [
                              `${data.count} ${data.count === 1 ? 'seguidor' : 'seguidores'}`,
                              `${value.toFixed(1)}% del total`
                            ];
                          }}
                          labelFormatter={(label: string, payload: any) => {
                            if (payload && payload[0]) {
                              return payload[0].payload.name;
                            }
                            return label;
                          }}
                        />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Distribución por género */}
                <div className="bg-white rounded-3xl p-4 flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                  <span className="text-xs mb-2 text-gray-500 text-center w-full">
                    Distribución por Género
                  </span>
                  {loading ? (
                    <div className="h-[200px] flex items-center justify-center">
                      <p>Cargando datos demográficos...</p>
                    </div>
                  ) : error ? (
                    <div className="h-[200px] flex items-center justify-center">
                      <p className="text-red-500">{error}</p>
                    </div>
                  ) : !demographics?.gender ? (
                    <div className="h-[200px] flex items-center justify-center">
                      <p>No hay datos de género disponibles</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={genderData}
                          cx="40%"
                          cy="50%"
                          labelLine={false}
                          label={({ value }) => `${value}`}
                          outerRadius={75}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {genderData.map((entry) => (
                            <Cell key={entry.key} fill={GENDER_COLORS[entry.key]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, _name, entry) => [
                            `${value} seguidores (${entry.payload.percentage}%)`, 
                            'Cantidad'
                          ]}
                        />
                        <Legend 
                          verticalAlign="middle"
                          align="right"
                          layout="vertical"
                          iconSize={12}
                          wrapperStyle={{
                            paddingLeft: '5px',
                            lineHeight: '24px',
                            fontSize: '12px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Columna derecha: Ciudades (altura completa) */}
              <div className="w-full md:w-1/2 flex flex-col">
                <div className="bg-white rounded-3xl p-4 flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.12)] h-full">
                  <span className="text-xs mb-2 text-gray-500 text-center w-full">
                    Seguidores por Ciudad (Top 5)
                  </span>
                  {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                      <p>Cargando datos demográficos...</p>
                    </div>
                  ) : error ? (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-red-500">{error}</p>
                    </div>
                  ) : !demographics?.city ? (
                    <div className="flex-1 flex items-center justify-center">
                      <p>No hay datos de ciudades disponibles</p>
                    </div>
                  ) : (
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={cityData}
                          layout="vertical"
                          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis 
                            type="category" 
                            dataKey="name" 
                            width={150}
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip 
                            formatter={(value: number) => {
                              const percentage = currentFollowers > 0 ? ((value / currentFollowers) * 100).toFixed(1) : '0.0';
                              return [`${value} seguidores (${percentage}%)`, 'Cantidad'];
                            }}
                          />
                          <Bar 
                            dataKey="value" 
                            radius={[0, 6, 6, 0]}
                          >
                            {cityData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.name === 'No especificado' ? '#808080' : '#8884d8'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'ventas':
        // Procesar datos reales de ventas
        const datosVentas = procesarDatosVentas();
        const datosProductos = procesarDatosProductos();

        // Crear datos para gráficos basados en datos reales
        const ventasChartData = datosVentas.ventasMensuales.length > 0 ? datosVentas.ventasMensuales : [
          { mes: 'Sin datos', ventas: 0 }
        ];

        // Usar productos vendidos reales si existen, sino usar productos del inventario
        const productosVendidos = datosVentas.productosVendidos.length > 0 ? datosVentas.productosVendidos : 
          (datosProductos.productosPorCategoria.length > 0 ? datosProductos.productosPorCategoria.map(prod => ({
            nombre: prod.categoria,
            cantidad: prod.cantidad,
            porcentaje: Math.round(((prod.cantidad as number) / datosProductos.totalProductos) * 100)
          })) : [
            { nombre: 'Sin productos', cantidad: 0, porcentaje: 0 }
          ]);



        return (
          <div className="w-full bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-8 mb-12">
            
            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-[var(--color-primary-50)] rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-[var(--color-primary-700)] mb-2">Ventas Totales</h3>
                <p className="text-3xl font-bold text-[var(--color-primary-600)]">${datosVentas.totalVentas.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                <p className="text-sm text-[var(--color-primary-500)] mt-1">{ventasData.length} ventas registradas</p>
              </div>
              <div className="bg-[var(--color-secondary-50)] rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-[var(--color-secondary-700)] mb-2">Ventas del Mes</h3>
                <p className="text-3xl font-bold text-[var(--color-secondary-600)]">${datosVentas.ventasMes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                <p className="text-sm text-[var(--color-secondary-500)] mt-1">Mes actual</p>
              </div>
              <div className="bg-[var(--color-primary-50)] rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-[var(--color-primary-700)] mb-2">Clientes Únicos</h3>
                <p className="text-3xl font-bold text-[var(--color-primary-600)]">{datosVentas.clientesUnicos}</p>
                <p className="text-sm text-[var(--color-primary-500)] mt-1">Clientes diferentes</p>
              </div>
              <div className="bg-[var(--color-secondary-50)] rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-[var(--color-secondary-700)] mb-2">Ticket Promedio</h3>
                <p className="text-3xl font-bold text-[var(--color-secondary-600)]">${datosVentas.ticketPromedio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                <p className="text-sm text-[var(--color-secondary-500)] mt-1">Por venta</p>
              </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Gráfico de ventas mensuales */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Ventas Mensuales</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ventasChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`$${value.toLocaleString()}`, 'Ventas']}
                      labelFormatter={(label) => `Mes: ${label}`}
                    />
                    <Bar dataKey="ventas" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de productos más vendidos */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Productos Más Vendidos</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={productosVendidos}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomPieLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="cantidad"
                    >
                      {productosVendidos.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'][index]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value} unidades`, name === 'cantidad' ? 'Cantidad' : 'Producto']}
                      labelFormatter={(label) => `Producto: ${label}`}
                      contentStyle={{
                        fontSize: '12px',
                        padding: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>


            </div>
          </div>
        );



      case 'servicios':
        // Procesar datos reales de servicios
        const datosServicios = procesarDatosServicios();

        // Crear datos para gráficos basados en datos reales
        const serviciosChartData = datosServicios.serviciosMensuales.length > 0 ? datosServicios.serviciosMensuales : [
          { mes: 'Sin datos', servicios: 0, ingresos: 0 }
        ];

        // Usar servicios por tipo reales si existen
        const serviciosPorTipo = datosServicios.serviciosPorTipo.length > 0 ? datosServicios.serviciosPorTipo : 
          (datosServicios.totalServicios > 0 ? [
            { tipo: 'Servicios Generales', cantidad: Math.ceil(datosServicios.totalServicios * 0.4), porcentaje: 40 },
            { tipo: 'Mantenimiento', cantidad: Math.ceil(datosServicios.totalServicios * 0.3), porcentaje: 30 },
            { tipo: 'Consultoría', cantidad: Math.ceil(datosServicios.totalServicios * 0.2), porcentaje: 20 },
            { tipo: 'Otros', cantidad: Math.ceil(datosServicios.totalServicios * 0.1), porcentaje: 10 }
          ] : [
            { tipo: 'Sin servicios', cantidad: 0, porcentaje: 0 }
          ]);



        return (
          <div className="w-full bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-8 mb-12">
            
            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-[var(--color-primary-50)] rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-[var(--color-primary-700)] mb-2">Servicios Totales</h3>
                <p className="text-3xl font-bold text-[var(--color-primary-600)]">{datosServicios.totalServicios}</p>
                <p className="text-sm text-[var(--color-primary-500)] mt-1">Servicios registrados</p>
              </div>
              <div className="bg-[var(--color-secondary-50)] rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-[var(--color-secondary-700)] mb-2">Ingresos por Servicios</h3>
                <p className="text-3xl font-bold text-[var(--color-secondary-600)]">${datosServicios.ingresosServicios.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                <p className="text-sm text-[var(--color-secondary-500)] mt-1">Total acumulado</p>
              </div>
              <div className="bg-[var(--color-primary-50)] rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-[var(--color-primary-700)] mb-2">Clientes Atendidos</h3>
                <p className="text-3xl font-bold text-[var(--color-primary-600)]">{datosServicios.clientesUnicos}</p>
                <p className="text-sm text-[var(--color-primary-500)] mt-1">Clientes únicos</p>
              </div>
              <div className="bg-[var(--color-secondary-50)] rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-[var(--color-secondary-700)] mb-2">Promedio por Servicio</h3>
                <p className="text-3xl font-bold text-[var(--color-secondary-600)]">${datosServicios.totalServicios > 0 ? (datosServicios.ingresosServicios / datosServicios.totalServicios).toLocaleString('es-MX', { minimumFractionDigits: 2 }) : '0.00'}</p>
                <p className="text-sm text-[var(--color-secondary-500)] mt-1">Por servicio</p>
              </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Gráfico de servicios mensuales */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Servicios Mensuales</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={serviciosChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'servicios' ? `${value} servicios` : name === 'ingresos' ? `$${value.toLocaleString()}` : `${value} clientes`, 
                        name === 'servicios' ? 'Servicios' : name === 'ingresos' ? 'Ingresos' : 'Clientes'
                      ]}
                      labelFormatter={(label) => `Mes: ${label}`}
                    />
                    <Bar dataKey="servicios" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="ingresos" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de servicios por tipo */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Servicios por Tipo</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={serviciosPorTipo}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomPieLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="cantidad"
                    >
                      {serviciosPorTipo.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'][index]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value} servicios`, name === 'cantidad' ? 'Cantidad' : 'Servicio']}
                      labelFormatter={(label) => `Tipo: ${label}`}
                      contentStyle={{
                        fontSize: '12px',
                        padding: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>




            </div>
          </div>
        );

      case 'recursos':
        // Procesar datos reales de recursos humanos
        const datosEmpleados = procesarDatosEmpleados();

        // Generar datos para gráficos basados en datos reales
        const empleadosChartData = [
          { 
            mes: 'Actual', 
            total: datosEmpleados.totalEmpleados, 
            pagados: datosEmpleados.empleadosPagados
          }
        ];

        // Usar datos reales de empleados por departamento
        const empleadosPorDeptoRRHH = datosEmpleados.empleadosPorCategoria.length > 0 ? datosEmpleados.empleadosPorCategoria.map(emp => ({
          departamento: emp.categoria || 'Sin categoría',
          empleados: Number(emp.cantidad) || 0
        })) : [
          { departamento: 'Administrativo', empleados: 2 },
          { departamento: 'Ventas', empleados: 3 },
          { departamento: 'Soporte', empleados: 1 }
        ];

        return (
          <div className="w-full bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-8 mb-12">
            
            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-[var(--color-primary-50)] rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-[var(--color-primary-700)] mb-2">Total Empleados</h3>
                <p className="text-3xl font-bold text-[var(--color-primary-600)]">{datosEmpleados.totalEmpleados}</p>
                <p className="text-sm text-[var(--color-primary-500)] mt-1">Empleados registrados</p>
              </div>
              <div className="bg-[var(--color-secondary-50)] rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-[var(--color-secondary-700)] mb-2">Nómina Mensual</h3>
                <p className="text-3xl font-bold text-[var(--color-secondary-600)]">${(datosEmpleados.salarioPromedio * datosEmpleados.totalEmpleados).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                <p className="text-sm text-[var(--color-secondary-500)] mt-1">Total mensual</p>
              </div>
              <div className="bg-[var(--color-primary-50)] rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-[var(--color-primary-700)] mb-2">Empleados Pagados</h3>
                <p className="text-3xl font-bold text-[var(--color-primary-600)]">{datosEmpleados.empleadosPagados}</p>
                <p className="text-sm text-[var(--color-primary-500)] mt-1">Nómina pagada</p>
              </div>
              <div className="bg-[var(--color-secondary-50)] rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-[var(--color-secondary-700)] mb-2">Salario Promedio</h3>
                <p className="text-3xl font-bold text-[var(--color-secondary-600)]">${datosEmpleados.salarioPromedio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                <p className="text-sm text-[var(--color-secondary-500)] mt-1">Por empleado</p>
              </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Gráfico de empleados */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Empleados</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={empleadosChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => {
                        const labels = {
                          total: 'Total',
                          pagados: 'Pagados'
                        };
                        return [`${value} empleados`, labels[name as keyof typeof labels] || name];
                      }}
                      labelFormatter={(label) => `Período: ${label}`}
                    />
                    <Bar dataKey="total" fill="#EC4899" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pagados" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>



              {/* Gráfico de empleados por departamento */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Empleados por Departamento</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={empleadosPorDeptoRRHH}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="departamento" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value} empleados`, 'Empleados']}
                      labelFormatter={(label) => `Departamento: ${label}`}
                    />
                    <Bar dataKey="empleados" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>


            </div>
          </div>
        );

      default:
        return (
          <div className="w-full bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-8 mb-12">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-[var(--color-primary-700)] mb-4">Dashboard</h2>
              <p className="text-gray-600">Selecciona un tema para ver las métricas correspondientes</p>
            </div>
          </div>
        );
    }
  };

  // Mostrar pantalla de carga durante inicialización o actualización de datos
  if (initializing) {
    return <LoadingScreen 
      message="Inicializando dashboard..." 
      subtitle="Verificando token de Instagram" 
    />;
  }
  
  if (dataUpdating && instagramToken) {
    return <LoadingScreen 
      message="Actualizando datos del dashboard..." 
      subtitle="Obteniendo información actualizada de Instagram" 
    />;
  }

  return (
    <div className="min-h-screen p-10 h-screen bg-[var(--color-background)] w-full overflow-y-auto">
                  <div className="flex flex-col gap-6 mb-6">
              <h1 className="text-2xl font-bold text-[var(--color-primary-700)]">Vista General</h1>
              
              {/* Botones de filtro */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                  { value: 'marketing', label: 'Marketing' },
                  { value: 'ventas', label: 'Ventas' },
                  { value: 'servicios', label: 'Servicios' },
                  { value: 'recursos', label: 'Recursos Humanos' }
                ].map((theme) => (
                  <button
                    key={theme.value}
                    onClick={() => setSelectedTheme(theme.value)}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap cursor-pointer',
                      selectedTheme === theme.value
                        ? 'bg-[var(--color-primary-600)] text-white'
                        : 'bg-gray-100 text-[var(--color-primary-700)] hover:bg-[var(--color-primary-100)] hover:text-[var(--color-primary-900)]'
                    )}
                  >
                    {theme.label}
                  </button>
                ))}
              </div>
            </div>
      {renderThemeContent()}
      
      {/* Modal de Token */}
      <TokenInputModal
        isOpen={showTokenModal}
        onSubmit={handleTokenSubmit}
        onClose={handleTokenModalClose}
        isLoading={validatingToken}
        error={tokenError}
        showCancelButton={false}
      />
    </div>
  );
} 