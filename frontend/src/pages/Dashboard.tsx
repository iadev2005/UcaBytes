import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend } from 'recharts';

export default function Dashboard() {
  // Datos de ejemplo para el gráfico de barras
  const data = [
    { name: 'Julio', ventas: 120 },
    { name: 'Agosto', ventas: 150 },
    { name: 'Septiembre', ventas: 110 },
    { name: 'Octubre', ventas: 130 },
  ];

  // Datos de ejemplo para el gráfico radial
  const ventasAlcanzadas = 158;
  const ventasMeta = 200;
  const porcentaje = Math.round((ventasAlcanzadas / ventasMeta) * 100);
  const radialData = [
    {
      name: 'Ventas',
      value: (ventasAlcanzadas / ventasMeta) * 100, // valor real en porcentaje
      fill: '#8884d8',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-background)] p-8">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center gap-6">
        <h1 className="text-3xl font-bold text-[var(--color-primary-700)]">el Dashboard!</h1>
        <div className="w-full flex flex-col md:flex-row gap-8 justify-center items-center">
          {/* Gráfico de barras */}
          <div className="bg-gray-50 rounded-xl p-4 flex-1 flex flex-col items-center">
            <span className="text-xs mb-2 text-gray-500">Ventas respecto al año pasado</span>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="ventas" fill="#8ecae6" radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Gráfico radial */}
          <div className="bg-gray-50 rounded-xl p-4 flex-1 flex flex-col items-center relative">
            <ResponsiveContainer width={180} height={180}>
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
                  fill="#8884d8"
                  background={{ fill: '#e5e7eb' }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            {/* Porcentaje centrado, pero un poco más arriba */}
            <div className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">{porcentaje}%</span>
            </div>
            <div className="mt-2 text-center text-xs text-gray-600">
              {ventasAlcanzadas}/{ventasMeta} Ventas alcanzadas este mes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 