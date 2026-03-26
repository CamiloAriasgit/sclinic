"use client"

import { useEffect, useState } from 'react'
import { getServicesAction } from '@/app/actions/get-services'
import { getInventoryAction } from '@/app/actions/get-inventory'
import { Plus, Beaker, X, Activity, DollarSign, Layers } from 'lucide-react'
import ServiceForm from '@/components/ServiceForm'

export default function ProtocolsPage() {
  const [services, setServices] = useState<any[]>([])
  const [inventoryData, setInventoryData] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const [servicesData, iData] = await Promise.all([
        getServicesAction(),
        getInventoryAction()
      ])
      setServices(servicesData)
      setInventoryData(iData)
    } catch (error) {
      console.error("Error cargando protocolos:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="mx-auto pb-20 pt-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 border-b border-zinc-100 pb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Layers className="text-zinc-900" size={24} strokeWidth={2.5} />
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 uppercase">Protocolos</h1>
          </div>
          <p className="text-zinc-500 text-sm font-medium">Define la hoja de ruta de insumos para cada procedimiento clínico.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-zinc-900 text-white px-6 py-3 rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-zinc-800 transition-all active:scale-95 shadow-none"
        >
          <Plus size={18} /> Crear Nuevo Protocolo
        </button>
      </header>

      {/* Grid de Protocolos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-24">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
              <p className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest">Sincronizando Base de Datos</p>
            </div>
          </div>
        ) : services.length === 0 ? (
          <div className="col-span-full py-32 bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200 text-center flex flex-col items-center">
            <Beaker className="text-zinc-200 mb-4" size={48} />
            <p className="text-zinc-500 font-semibold text-sm">No existen protocolos configurados.</p>
            <button onClick={() => setShowForm(true)} className="mt-4 text-xs font-bold text-zinc-900 underline">Comenzar ahora</button>
          </div>
        ) : (
          services.map(service => (
            <div key={service.id} className="bg-white border border-zinc-200 rounded-xl overflow-hidden hover:border-zinc-900 transition-colors duration-300 group">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-zinc-900 leading-tight">
                      {service.nombre}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <Activity size={12} className="text-emerald-500" />
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Activo para Consulta</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-zinc-900 bg-zinc-100 px-3 py-1.5 rounded-md flex items-center gap-1">
                      <DollarSign size={12} />
                      {Number(service.precio_venta || 0).toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-[1px] flex-1 bg-zinc-100" />
                    <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-[0.2em]">Insumos del Protocolo</span>
                    <div className="h-[1px] flex-1 bg-zinc-100" />
                  </div>

                  <div className="grid grid-cols-1 gap-1.5">
                    {service.servicio_insumos?.map((si: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center bg-zinc-50 px-4 py-2.5 rounded-lg border border-transparent hover:border-zinc-200 transition-all group/item">
                        <span className="text-xs font-medium text-zinc-600 group-hover/item:text-zinc-900 transition-colors">
                          {si.insumos?.nombre}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-zinc-400 bg-white border border-zinc-200 px-2 py-0.5 rounded uppercase">
                          {si.cantidad_consumo || 0} x Uni
                        </span>
                      </div>
                    ))}
                    {(!service.servicio_insumos || service.servicio_insumos.length === 0) && (
                      <div className="py-4 text-center">
                        <p className="text-[10px] font-bold text-zinc-300 italic uppercase">Sin receta configurada</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal / Slide-over Estilo Shadcn */}
      {showForm && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-md z-[100] flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl h-screen border-l border-zinc-200 shadow-none relative flex flex-col animate-in slide-in-from-right duration-500">
            <header className="p-8 border-b border-zinc-100 flex justify-between items-center">
              <div>
                <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em] mb-1">Configuración</h2>
                <p className="text-2xl font-bold text-zinc-900 tracking-tight">Nuevo Protocolo</p>
              </div>
              <button 
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400 hover:text-zinc-900"
              >
                <X size={20} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
              <ServiceForm 
                inventoryData={inventoryData} 
                onComplete={() => {
                  setShowForm(false)
                  loadData()
                }} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}