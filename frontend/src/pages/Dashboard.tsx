import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend } from 'recharts';
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

export default function Dashboard() {
  const [followersData, setFollowersData] = useState<FollowerData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [growthPercentage, setGrowthPercentage] = useState(0);
  const [firstDate, setFirstDate] = useState<string>('');
  const [demographics, setDemographics] = useState<DemographicsData | null>(null);

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
          console.log('Datos demográficos cargados:', demographicsJson[latestDate]);
        } else {
          console.log('No se encontraron datos demográficos');
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

  // Calcular el total de seguidores por edad
  const totalFollowers = demographics?.age ? 
    Object.values(demographics.age).reduce((sum, value) => sum + value, 0) : 0;

  // Preparar datos para el gráfico de edad
  const ageData = AGE_RANGES.map(range => ({
    name: range.label,
    value: ((demographics?.age?.[range.id] || 0) / totalFollowers) * 100,
    fill: range.fill,
  })).sort((a, b) => b.value - a.value); // Ordenar por porcentaje descendente

  return (
    <div className="min-h-screen p-8 bg-[var(--color-background)]">
      <h1 className="text-2xl font-bold text-[var(--color-primary-700)] mb-6 text-left">Vista General</h1>
      <div className="w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="w-full flex flex-col md:flex-row gap-8 justify-center items-center">
          {/* Gráfico de barras */}
          <div className="bg-gray-50 rounded-3xl p-4 flex-1 flex flex-col items-center border-2 border-gray-800">
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
          <div className="bg-gray-50 rounded-3xl p-4 flex-1 flex flex-col items-center relative border-2 border-gray-800">
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

        {/* Sección de distribución por edad */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-left">Distribución por Edad</h2>
          <div className="bg-gray-50 rounded-3xl p-6 border-2 border-gray-800">
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
                    width={120}
                    height={140}
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    wrapperStyle={{
                      top: '50%',
                      right: 0,
                      transform: 'translate(0, -50%)'
                    }}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Porcentaje']}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 