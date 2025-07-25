import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend, PieChart, Pie, Cell } from 'recharts';
import { useEffect, useState } from 'react';

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
  const [growthPercentage, setGrowthPercentage] = useState(0);
  const [firstDate, setFirstDate] = useState<string>('');
  const [demographics, setDemographics] = useState<DemographicsData | null>(null);
  const [currentFollowers, setCurrentFollowers] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch followers data
        const followersResponse = await fetch('http://localhost:3001/api/followers');
        if (!followersResponse.ok) {
          throw new Error(`Error HTTP: ${followersResponse.status}`);
        }
        const followersJson = await followersResponse.json();
        
        // Get current followers count (last date)
        const lastDate = Object.keys(followersJson).sort().pop();
        if (lastDate) {
          setCurrentFollowers(followersJson[lastDate]);
        }
        
        // Transform followers data
        const formattedData = Object.entries(followersJson).map(([date, followers]) => ({
          name: new Date(new Date(date).setDate(new Date(date).getDate() + 1)).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
          seguidores: followers as number,
          originalDate: date
        }));
        
        // Calculate growth percentage and first date
        const sortedData = formattedData.sort((a, b) => a.originalDate?.localeCompare(b.originalDate || '') || 0);
        if (sortedData.length >= 2) {
          const firstValue = sortedData[0].seguidores;
          const lastValue = sortedData[sortedData.length - 1].seguidores;
          const growth = lastValue - firstValue;
          const growthPercent = firstValue === 0 ? 100 : (growth / firstValue) * 100;
          setGrowthPercentage(Math.round(growthPercent));
          
          const firstDateObj = new Date(sortedData[0].originalDate || '');
          firstDateObj.setDate(firstDateObj.getDate() + 1);
          setFirstDate(firstDateObj.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          }));
        }

        setFollowersData(formattedData);

        // Fetch demographics data
        const demographicsResponse = await fetch('http://localhost:3001/api/demographics');
        if (!demographicsResponse.ok) {
          throw new Error('Error al cargar datos demográficos');
        }
        const demographicsJson = await demographicsResponse.json();
        const latestDate = Object.keys(demographicsJson).sort().pop();
        if (latestDate) {
          setDemographics(demographicsJson[latestDate]);
        }

        setError(null);
      } catch (error) {
        console.error('Error completo:', error);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const radialData = [
    {
      name: 'Crecimiento',
      value: Math.abs(growthPercentage),
      fill: growthPercentage >= 0 ? '#4CAF50' : '#f44336',
    },
  ];

  // Preparar datos para el gráfico de edad usando el número actual de seguidores
  const ageData = demographics?.age ? (() => {
    // Calcular el total de seguidores especificados por edad
    const specifiedTotal = Object.values(demographics.age).reduce((sum, count) => sum + count, 0);
    // Calcular los no especificados
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

    return data.sort((a, b) => b.value - a.value);
  })() : [];

  // Preparar datos para el gráfico de género
  const genderData = demographics?.gender ? (() => {
    const female = demographics.gender['F'] || 0;
    const male = demographics.gender['M'] || 0;
    const unspecified = currentFollowers - (female + male);
    
    return [
      { name: 'Femenino', value: female, key: 'F' },
      { name: 'Masculino', value: male, key: 'M' },
      { name: 'No especificado', value: unspecified, key: 'U' }
    ].filter(item => item.value > 0);
  })() : [];

  // Preparar datos para el gráfico de ciudades
  const cityData = demographics?.city ? (() => {
    // Calcular el total de seguidores especificados por ciudad
    const specifiedTotal = Object.values(demographics.city).reduce((sum, count) => sum + count, 0);
    // Calcular los no especificados
    const unspecified = currentFollowers - specifiedTotal;

    // Obtener las ciudades y ordenarlas por cantidad
    const data = Object.entries(demographics.city)
      .map(([city, count]) => ({
        name: city,
        value: count
      }))
      .sort((a, b) => b.value - a.value);

    // Agregar los no especificados si hay alguno
    if (unspecified > 0) {
      data.push({
        name: 'No especificado',
        value: unspecified
      });
    }

    return data;
  })() : [];

  return (
    <div className="min-h-screen p-8 bg-[var(--color-background)]">
      <h1 className="text-2xl font-bold text-[var(--color-primary-700)] mb-6 text-left">Vista General</h1>
      <div className="w-full bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-8">
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
              <p>Crecimiento desde el primer registro:</p>
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
                      label={{
                        fill: '#666',
                        position: 'insideStart',
                        formatter: (label: any) => typeof label === 'number' ? `${label.toFixed(1)}%` : ''
                      }}
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
                    />
                    <Tooltip
                      labelFormatter={(index) => {
                        const count = ageData[index].count;
                        return `${count} ${count === 1 ? 'seguidor' : 'seguidores'}`;
                      }}
                      formatter={(value: number) => [`Porcentaje`, `${value.toFixed(1)}%`]}
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
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ value }) => `${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {genderData.map((entry) => (
                        <Cell key={entry.key} fill={GENDER_COLORS[entry.key]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value} seguidores`, 'Cantidad']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Columna derecha: Ciudades (altura completa) */}
          <div className="w-full md:w-1/2 flex flex-col">
            <div className="bg-white rounded-3xl p-4 flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.12)] h-full">
              <span className="text-xs mb-2 text-gray-500 text-center w-full">
                Procedencia de Seguidores
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
                        formatter={(value) => [`${value} seguidores`, 'Cantidad']}
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