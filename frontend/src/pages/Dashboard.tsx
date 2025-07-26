import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend, PieChart, Pie, Cell } from 'recharts';
import { useEffect, useState } from 'react';
import LoadingScreen from '../components/marketing/LoadingScreen';

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

  useEffect(() => {
    const updateAndFetchData = async () => {
      try {
        setDataUpdating(true);
        setError(null);
        
        // Primero ejecutar los scripts para actualizar los datos
        console.log('Ejecutando scripts de actualización...');
        const updateResponse = await fetch('http://localhost:3001/api/update-dashboard-data', {
          method: 'POST',
        });
        
        if (!updateResponse.ok) {
          throw new Error('Error al actualizar los datos');
        }
        
        console.log('Scripts ejecutados exitosamente, cargando datos...');
        setDataUpdating(false);
        setLoading(true);
        
        // Ahora cargar los datos actualizados
        const [demographicsResponse, followerInsightsResponse, instagramDetailsResponse] = await Promise.all([
          fetch('http://localhost:3001/api/demographics'),
          fetch('http://localhost:3001/api/follower-insights'),
          fetch('http://localhost:3001/api/instagram-details')
        ]);
        
        if (!followerInsightsResponse.ok) {
          throw new Error(`Error HTTP en follower insights: ${followerInsightsResponse.status}`);
        }
        
        const demographicsJson = demographicsResponse.ok ? await demographicsResponse.json() : null;
        const followerInsightsJson = await followerInsightsResponse.json();
        const instagramDetailsJson = instagramDetailsResponse.ok ? await instagramDetailsResponse.json() : null;
        
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
            console.log('Total real de seguidores desde Instagram Details:', totalFollowersFromDetails);
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
          
          console.log('Datos demográficos procesados:', processedDemographics);
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

    updateAndFetchData();
  }, []);

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
    console.log('Datos del gráfico de edad:', finalData);
    console.log('Total de seguidores usado para porcentajes:', currentFollowers);
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
                      <Tooltip />
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
                          formatter={(value: string, entry: any) => {
                            // Mostrar en la leyenda: "Rango - Cantidad"
                            const data = entry.payload;
                            return `${data.name} - ${data.count}`;
                          }}
                        />
                        <Tooltip
                          formatter={(value: number, name: string, entry: any) => {
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
                          formatter={(value, name, entry) => [
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
                            lineHeight: '24px'
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
        // Datos simulados para ventas
        const ventasData = [
          { mes: 'Ene', ventas: 45000, clientes: 23, productos: 156 },
          { mes: 'Feb', ventas: 52000, clientes: 28, productos: 189 },
          { mes: 'Mar', ventas: 48000, clientes: 25, productos: 167 },
          { mes: 'Abr', ventas: 61000, clientes: 32, productos: 234 },
          { mes: 'May', ventas: 55000, clientes: 29, productos: 198 },
          { mes: 'Jun', ventas: 67000, clientes: 35, productos: 245 },
          { mes: 'Jul', ventas: 72000, clientes: 38, productos: 267 },
          { mes: 'Ago', ventas: 68000, clientes: 36, productos: 251 },
          { mes: 'Sep', ventas: 75000, clientes: 40, productos: 278 },
          { mes: 'Oct', ventas: 82000, clientes: 43, productos: 295 },
          { mes: 'Nov', ventas: 78000, clientes: 41, productos: 283 },
          { mes: 'Dic', ventas: 95000, clientes: 48, productos: 312 }
        ];

        const productosVendidos = [
          { nombre: 'Laptops', cantidad: 45, porcentaje: 35 },
          { nombre: 'Monitores', cantidad: 38, porcentaje: 29 },
          { nombre: 'Teclados', cantidad: 25, porcentaje: 19 },
          { nombre: 'Mouse', cantidad: 15, porcentaje: 12 },
          { nombre: 'Otros', cantidad: 7, porcentaje: 5 }
        ];

        const clientesPorRegion = [
          { region: 'Caracas', clientes: 25, ventas: 45000 },
          { region: 'Valencia', clientes: 18, ventas: 32000 },
          { region: 'Maracaibo', clientes: 15, ventas: 28000 },
          { region: 'Barquisimeto', clientes: 12, ventas: 22000 },
          { region: 'Mérida', clientes: 8, ventas: 15000 }
        ];

        return (
          <div className="w-full bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-8 mb-12">
            
            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-blue-50 rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-blue-700 mb-2">Ventas Totales</h3>
                <p className="text-3xl font-bold text-blue-600">$738,000</p>
                <p className="text-sm text-blue-500 mt-1">+12.5% vs mes anterior</p>
              </div>
              <div className="bg-green-50 rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-green-700 mb-2">Ventas del Mes</h3>
                <p className="text-3xl font-bold text-green-600">$95,000</p>
                <p className="text-sm text-green-500 mt-1">+8.3% vs mes anterior</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-purple-700 mb-2">Clientes Nuevos</h3>
                <p className="text-3xl font-bold text-purple-600">48</p>
                <p className="text-sm text-purple-500 mt-1">+5 clientes este mes</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-orange-700 mb-2">Ticket Promedio</h3>
                <p className="text-3xl font-bold text-orange-600">$1,979</p>
                <p className="text-sm text-orange-500 mt-1">+2.1% vs mes anterior</p>
              </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Gráfico de ventas mensuales */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Ventas Mensuales</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ventasData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Ventas']} />
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
                      label={({ nombre, porcentaje }) => `${nombre} ${porcentaje}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="cantidad"
                    >
                      {productosVendidos.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'][index]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} unidades`, 'Cantidad']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de clientes por región */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Clientes por Región</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={clientesPorRegion} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="region" type="category" width={100} />
                    <Tooltip formatter={(value, name) => [name === 'clientes' ? `${value} clientes` : `$${value.toLocaleString()}`, name === 'clientes' ? 'Clientes' : 'Ventas']} />
                    <Bar dataKey="clientes" fill="#10B981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de tendencia de clientes */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Tendencia de Clientes</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ventasData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} clientes`, 'Clientes']} />
                    <Bar dataKey="clientes" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );



      case 'servicios':
        // Datos simulados para servicios
        const serviciosData = [
          { mes: 'Ene', servicios: 45, ingresos: 22500, clientes: 38 },
          { mes: 'Feb', servicios: 52, ingresos: 26000, clientes: 42 },
          { mes: 'Mar', servicios: 48, ingresos: 24000, clientes: 40 },
          { mes: 'Abr', servicios: 61, ingresos: 30500, clientes: 48 },
          { mes: 'May', servicios: 55, ingresos: 27500, clientes: 44 },
          { mes: 'Jun', servicios: 67, ingresos: 33500, clientes: 52 },
          { mes: 'Jul', servicios: 72, ingresos: 36000, clientes: 56 },
          { mes: 'Ago', servicios: 68, ingresos: 34000, clientes: 54 },
          { mes: 'Sep', servicios: 75, ingresos: 37500, clientes: 58 },
          { mes: 'Oct', servicios: 82, ingresos: 41000, clientes: 62 },
          { mes: 'Nov', servicios: 78, ingresos: 39000, clientes: 60 },
          { mes: 'Dic', servicios: 95, ingresos: 47500, clientes: 68 }
        ];

        const serviciosPorTipo = [
          { tipo: 'Mantenimiento', cantidad: 35, porcentaje: 30 },
          { tipo: 'Instalación', cantidad: 28, porcentaje: 24 },
          { tipo: 'Reparación', cantidad: 25, porcentaje: 22 },
          { tipo: 'Consultoría', cantidad: 18, porcentaje: 16 },
          { tipo: 'Otros', cantidad: 8, porcentaje: 8 }
        ];

        const clientesPorServicio = [
          { servicio: 'Mantenimiento PC', clientes: 45, satisfaccion: 4.5 },
          { servicio: 'Instalación Software', clientes: 32, satisfaccion: 4.3 },
          { servicio: 'Reparación Hardware', clientes: 28, satisfaccion: 4.7 },
          { servicio: 'Consultoría IT', clientes: 18, satisfaccion: 4.8 },
          { servicio: 'Recuperación Datos', clientes: 15, satisfaccion: 4.6 }
        ];

        const tiempoPromedioServicios = [
          { servicio: 'Mantenimiento', tiempo: 2.5, meta: 3.0, unidad: 'horas' },
          { servicio: 'Instalación', tiempo: 4.2, meta: 5.0, unidad: 'horas' },
          { servicio: 'Reparación', tiempo: 6.8, meta: 8.0, unidad: 'horas' },
          { servicio: 'Consultoría', tiempo: 3.5, meta: 4.0, unidad: 'horas' }
        ];

        return (
          <div className="w-full bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-8 mb-12">
            
            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-emerald-50 rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-emerald-700 mb-2">Servicios Totales</h3>
                <p className="text-3xl font-bold text-emerald-600">738</p>
                <p className="text-sm text-emerald-500 mt-1">+15.2% vs año anterior</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-blue-700 mb-2">Ingresos por Servicios</h3>
                <p className="text-3xl font-bold text-blue-600">$369,000</p>
                <p className="text-sm text-blue-500 mt-1">+12.8% vs año anterior</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-purple-700 mb-2">Clientes Atendidos</h3>
                <p className="text-3xl font-bold text-purple-600">598</p>
                <p className="text-sm text-purple-500 mt-1">+18.5% vs año anterior</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-orange-700 mb-2">Satisfacción</h3>
                <p className="text-3xl font-bold text-orange-600">4.6/5</p>
                <p className="text-sm text-orange-500 mt-1">+0.2 vs año anterior</p>
              </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Gráfico de servicios mensuales */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Servicios Mensuales</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={serviciosData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [name === 'servicios' ? value : name === 'ingresos' ? `$${value.toLocaleString()}` : value, name === 'servicios' ? 'Servicios' : name === 'ingresos' ? 'Ingresos' : 'Clientes']} />
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
                      label={({ tipo, porcentaje }) => `${tipo} ${porcentaje}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="cantidad"
                    >
                      {serviciosPorTipo.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'][index]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} servicios`, 'Cantidad']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de clientes por servicio */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Clientes por Servicio</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={clientesPorServicio} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="servicio" type="category" width={150} />
                    <Tooltip formatter={(value, name) => [name === 'clientes' ? `${value} clientes` : `${value}/5`, name === 'clientes' ? 'Clientes' : 'Satisfacción']} />
                    <Bar dataKey="clientes" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de tiempo promedio de servicios */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Tiempo Promedio de Servicios</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={tiempoPromedioServicios} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="servicio" type="category" width={120} />
                    <Tooltip formatter={(value, name) => [name === 'tiempo' ? `${value} horas` : `${value} horas`, name === 'tiempo' ? 'Tiempo Real' : 'Meta']} />
                    <Bar dataKey="tiempo" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );

      case 'recursos':
        // Datos simulados para recursos humanos
        const empleadosData = [
          { mes: 'Ene', total: 35, nuevos: 3, salidas: 1 },
          { mes: 'Feb', total: 37, nuevos: 2, salidas: 0 },
          { mes: 'Mar', total: 38, nuevos: 2, salidas: 1 },
          { mes: 'Abr', total: 39, nuevos: 3, salidas: 2 },
          { mes: 'May', total: 40, nuevos: 2, salidas: 1 },
          { mes: 'Jun', total: 41, nuevos: 2, salidas: 1 },
          { mes: 'Jul', total: 42, nuevos: 3, salidas: 2 },
          { mes: 'Ago', total: 41, nuevos: 1, salidas: 2 },
          { mes: 'Sep', total: 42, nuevos: 2, salidas: 1 },
          { mes: 'Oct', total: 43, nuevos: 3, salidas: 2 },
          { mes: 'Nov', total: 44, nuevos: 2, salidas: 1 },
          { mes: 'Dic', total: 45, nuevos: 2, salidas: 1 }
        ];

        const empleadosPorEdad = [
          { rango: '18-25', cantidad: 8, porcentaje: 18 },
          { rango: '26-35', cantidad: 15, porcentaje: 33 },
          { rango: '36-45', cantidad: 12, porcentaje: 27 },
          { rango: '46-55', cantidad: 7, porcentaje: 16 },
          { rango: '55+', cantidad: 3, porcentaje: 6 }
        ];

        const empleadosPorDeptoRRHH = [
          { departamento: 'Administrativo', empleados: 8, salarioPromedio: 2500 },
          { departamento: 'Ventas', empleados: 12, salarioPromedio: 2200 },
          { departamento: 'Soporte', empleados: 6, salarioPromedio: 2000 },
          { departamento: 'Desarrollo', empleados: 10, salarioPromedio: 3500 },
          { departamento: 'Marketing', empleados: 5, salarioPromedio: 2300 },
          { departamento: 'Finanzas', empleados: 4, salarioPromedio: 2800 }
        ];

        const satisfaccionEmpleados = [
          { categoria: 'Muy Satisfecho', cantidad: 18, porcentaje: 40 },
          { categoria: 'Satisfecho', cantidad: 15, porcentaje: 33 },
          { categoria: 'Neutral', cantidad: 8, porcentaje: 18 },
          { categoria: 'Insatisfecho', cantidad: 3, porcentaje: 7 },
          { categoria: 'Muy Insatisfecho', cantidad: 1, porcentaje: 2 }
        ];

        return (
          <div className="w-full bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-8 mb-12">
            
            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-pink-50 rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-pink-700 mb-2">Total Empleados</h3>
                <p className="text-3xl font-bold text-pink-600">45</p>
                <p className="text-sm text-pink-500 mt-1">+2 este mes</p>
              </div>
              <div className="bg-cyan-50 rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-cyan-700 mb-2">Nómina Mensual</h3>
                <p className="text-3xl font-bold text-cyan-600">$108,500</p>
                <p className="text-sm text-cyan-500 mt-1">+5.2% vs mes anterior</p>
              </div>
              <div className="bg-lime-50 rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-lime-700 mb-2">Tasa de Rotación</h3>
                <p className="text-3xl font-bold text-lime-600">2.2%</p>
                <p className="text-sm text-lime-500 mt-1">-0.5% vs mes anterior</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-purple-700 mb-2">Satisfacción</h3>
                <p className="text-3xl font-bold text-purple-600">4.2/5</p>
                <p className="text-sm text-purple-500 mt-1">+0.3 vs mes anterior</p>
              </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Gráfico de crecimiento de empleados */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Crecimiento de Empleados</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={empleadosData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [value, name === 'total' ? 'Total' : name === 'nuevos' ? 'Nuevos' : 'Salidas']} />
                    <Bar dataKey="total" fill="#EC4899" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="nuevos" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="salidas" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de empleados por edad */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribución por Edad</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={empleadosPorEdad}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ rango, cantidad }) => `${rango} (${cantidad})`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="cantidad"
                    >
                      {empleadosPorEdad.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#EC4899', '#06B6D4', '#84CC16', '#F59E0B', '#8B5CF6'][index]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} empleados`, 'Cantidad']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de empleados por departamento */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Empleados por Departamento</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={empleadosPorDeptoRRHH} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="departamento" type="category" width={120} />
                    <Tooltip formatter={(value, name) => [name === 'empleados' ? `${value} empleados` : `$${value}`, name === 'empleados' ? 'Empleados' : 'Salario Promedio']} />
                    <Bar dataKey="empleados" fill="#06B6D4" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de satisfacción de empleados */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Satisfacción de Empleados</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={satisfaccionEmpleados}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ categoria, porcentaje }) => `${categoria} ${porcentaje}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="cantidad"
                    >
                      {satisfaccionEmpleados.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#10B981', '#84CC16', '#F59E0B', '#EF4444', '#991B1B'][index]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} empleados`, 'Cantidad']} />
                  </PieChart>
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

  // Mostrar pantalla de carga mientras se actualizan los datos
  if (dataUpdating) {
    return <LoadingScreen 
      message="Actualizando datos del dashboard..." 
      subtitle="Obteniendo información actualizada de Instagram" 
    />;
  }

  return (
    <div className="min-h-screen p-10 h-screen bg-[var(--color-background)] w-full overflow-y-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-primary-700)]">Vista General</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Tema:</span>
                      <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] bg-white"
            >
              <option value="marketing">Marketing</option>
              <option value="ventas">Ventas</option>
              <option value="servicios">Servicios</option>
              <option value="recursos">Recursos Humanos</option>
            </select>
        </div>
      </div>
      {renderThemeContent()}
    </div>
  );
} 