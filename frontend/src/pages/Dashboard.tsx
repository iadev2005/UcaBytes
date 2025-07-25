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

  // Mostrar pantalla de carga mientras se actualizan los datos
  if (dataUpdating) {
    return <LoadingScreen 
      message="Actualizando datos del dashboard..." 
      subtitle="Obteniendo información actualizada de Instagram" 
    />;
  }

  return (
    <div className="min-h-screen p-10 h-screen bg-[var(--color-background)] w-full overflow-y-auto">
      <h1 className="text-2xl font-bold text-[var(--color-primary-700)] text-left p-6">Vista General</h1>
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
    </div>
  );
} 