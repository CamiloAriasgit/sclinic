"use client"
import { useState, useEffect } from 'react'
import { getDashboardStatsAction } from '@/app/actions/get-dashboard-stats'
import { 
  TrendingUp, AlertTriangle, Package, Box, Users, Plus, BarChart3, ChevronRight 
} from 'lucide-react'

interface DashboardStats {
  ingresosHoy: number;
  procedimientosHoy: number;
  saludStock: number;
  alertas: any[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({ 
    ingresosHoy: 0, 
    procedimientosHoy: 0,
    saludStock: 0,
    alertas: [] 
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStatsAction().then((data) => {
      setStats(data)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="p-6 text-zinc-400 animate-pulse text-sm">Sincronizando activos...</div>

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans antialiased">
      <div className="mx-auto space-y-6 md:space-y-10">
        
        {/* Grid de Métricas Principales: Forzamos 3 columnas siempre */}
        <div className="grid grid-cols-3 gap-2 md:gap-6">
          
          {/* Card: Ingresos */}
          <div className="bg-white border border-zinc-200 p-3 md:p-6 rounded-lg relative overflow-hidden group hover:border-zinc-300 transition-all flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <div className="p-1.5 md:p-2 bg-zinc-100 rounded-md group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                <TrendingUp size={14} className="md:w-[18px] md:h-[18px]" />
              </div>
              <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">
                Hoy
              </span>
            </div>
            <div className="mt-2 md:mt-4">
              <p className="text-[9px] md:text-sm font-medium text-zinc-500 leading-tight">Caja (Hoy)</p>
              <h2 className="text-sm md:text-3xl font-bold tracking-tight truncate mt-0.5">
                ${(stats.ingresosHoy / 1000).toFixed(0)}k
                <span className="hidden md:inline">{stats.ingresosHoy.toLocaleString('es-CO').slice(-4)}</span>
              </h2>
            </div>
          </div>

          {/* Card: Procedimientos */}
          <div className="bg-white border border-zinc-200 p-3 md:p-6 rounded-lg hover:border-zinc-300 transition-all flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <div className="p-1.5 md:p-2 bg-zinc-100 rounded-md">
                <Users size={14} className="text-zinc-600 md:w-[18px] md:h-[18px]" />
              </div>
            </div>
            <div className="mt-2 md:mt-4">
              <p className="text-[9px] md:text-sm font-medium text-zinc-500 leading-tight">Proceds.</p>
              <div className="flex items-end gap-1 md:gap-3">
                <h2 className="text-base md:text-3xl font-bold tracking-tight mt-0.5">
                  {stats.procedimientosHoy.toString().padStart(2, '0')}
                </h2>
                <div className="hidden md:flex -space-x-2 mb-1.5">
                   {[...Array(Math.min(stats.procedimientosHoy, 3))].map((_, i) => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-zinc-100 flex items-center justify-center">
                       <Users size={10} className="text-zinc-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card: Estado Stock */}
          <div className="bg-white border border-zinc-200 p-3 md:p-6 rounded-lg hover:border-zinc-300 transition-all flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <div className="p-1.5 md:p-2 bg-zinc-100 rounded-md">
                <Box size={14} className="text-zinc-600 md:w-[18px] md:h-[18px]" />
              </div>
            </div>
            <div className="mt-2 md:mt-4">
              <p className="text-[9px] md:text-sm font-medium text-zinc-500 leading-tight">Stock</p>
              <h2 className={`text-[10px] md:text-xl font-bold md:font-semibold tracking-tight mt-0.5 leading-none ${stats.alertas.length > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {stats.alertas.length > 0 ? 'CRÍTICO' : 'OK'}
                <span className="hidden md:inline"> (100%)</span>
              </h2>
            </div>
          </div>
        </div>

        {/* Sección Inferior: Alertas y Acciones  */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <section className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" />
                Stock Crítico ({stats.alertas.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {stats.alertas.length > 0 ? (
                stats.alertas.map((alerta, i) => (
                  <div key={i} className="group bg-white border border-zinc-200 p-4 rounded-lg flex justify-between items-center hover:border-zinc-300 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-zinc-50 border border-zinc-100 rounded-lg flex items-center justify-center text-zinc-400 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                        <Package size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-800">{alerta.insumos.nombre}</p>
                        <p className="text-xs text-zinc-400">{alerta.insumos.marca}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-red-600">
                          {alerta.cantidad_actual} uds
                        </span>
                        <ChevronRight size={14} className="text-zinc-300" />
                      </div>
                      <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-tight">Reabastecer</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-16 border-2 border-dashed border-zinc-100 rounded-lg text-center">
                  <p className="text-sm text-zinc-300 font-medium">Todo el inventario está en niveles óptimos.</p>
                </div>
              )}
            </div>
          </section>

          {/* Acciones Rápidas */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-900 px-1">Acciones Rápidas</h3>
            <div className="grid grid-cols-1 gap-2">
              <button className="flex items-center gap-3 w-full p-4 rounded-lg text-sm font-bold bg-zinc-900 text-white hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-100">
                <Plus size={16} />
                Nueva Operación
              </button>
              <button className="flex items-center gap-3 w-full p-4 rounded-lg text-sm font-medium border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-all">
                <BarChart3 size={16} />
                Reportes de Auditoría
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}