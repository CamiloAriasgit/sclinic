"use client"

import { useEffect, useState } from 'react'
import { getServicesAction } from '@/app/actions/get-services'
import { getInventoryAction } from '@/app/actions/get-inventory'
import { Plus, Beaker, X, Activity, DollarSign, Layers, Loader2 } from 'lucide-react'
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

  useEffect(() => { loadData() }, [])

  return (
    <div className="w-full mx-auto pb-20 overflow-x-hidden">
      {/* Header Minimalista */}
      <header className="flex flex-row justify-between items-center mb-5">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl md:text-2xl font-black tracking-tighter text-zinc-900 uppercase">Protocolos</h1>
        </div>
        
        <button 
          onClick={() => setShowForm(true)}
          className="bg-zinc-900 text-white p-3 md:px-6 md:py-3 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-zinc-800 transition-all active:scale-95"
        >
          <Plus size={18} /> 
          <span className="hidden md:inline">Crear Protocolo</span>
        </button>
      </header>

      {/* Grid de Protocolos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {loading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="animate-spin text-zinc-300" size={32} />
            <p className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest text-center">Sincronizando Protocolos...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="col-span-full py-20 bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200 text-center flex flex-col items-center">
            <Beaker className="text-zinc-300 mb-4" size={40} />
            <p className="text-zinc-500 font-bold text-xs uppercase tracking-tight">No existen protocolos configurados.</p>
            <button onClick={() => setShowForm(true)} className="mt-2 text-[10px] font-black text-zinc-900 underline uppercase tracking-widest">Definir Primer Procedimiento</button>
          </div>
        ) : (
          services.map(service => (
            <div key={service.id} className="bg-white border border-zinc-200 rounded-xl overflow-hidden hover:border-zinc-400 transition-all duration-300">
              <div className="p-5 md:p-6">
                <div className="flex justify-between items-start mb-5 gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base md:text-lg font-bold text-zinc-900 leading-tight truncate">
                      {service.nombre}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Activo</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="text-[11px] md:text-xs font-black text-zinc-900 bg-zinc-100 px-2.5 py-1.5 rounded-md flex items-center gap-1">
                      <DollarSign size={10} strokeWidth={3} />
                      {Number(service.precio_venta || 0).toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black text-zinc-300 uppercase tracking-[0.2em] whitespace-nowrap">Hoja de Insumos</span>
                    <div className="h-[1px] w-full bg-zinc-50" />
                  </div>

                  <div className="grid grid-cols-1 gap-1.5">
                    {service.servicio_insumos?.map((si: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center bg-zinc-100 px-3 py-2 rounded-lg group/item">
                        <span className="text-[11px] font-semibold text-zinc-600 truncate mr-4">
                          {si.insumos?.nombre}
                        </span>
                        <span className="text-[9px] font-mono font-bold text-zinc-900 bg-white px-2 py-0.5 rounded-md flex-shrink-0">
                          {si.cantidad_consumo || 0} Uds
                        </span>
                      </div>
                    ))}
                    {(!service.servicio_insumos || service.servicio_insumos.length === 0) && (
                      <div className="py-2 text-center">
                        <p className="text-[9px] font-bold text-zinc-300 uppercase italic">Sin receta vinculada</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Formulario Estilo Drawer */}
      {showForm && (
        <div className="fixed inset-0 bg-zinc-900/20 backdrop-blur-sm z-[100] flex justify-end animate-in fade-in duration-300">
          <div className="bg-white w-full md:max-w-xl h-full shadow-2xl relative flex flex-col animate-in slide-in-from-right duration-500">
            <header className="p-6 md:p-8 border-b border-zinc-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-1">Configuración</h2>
                <p className="text-xl md:text-2xl font-bold text-zinc-900 tracking-tight">Nuevo Protocolo</p>
              </div>
              <button 
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400 hover:text-zinc-900"
              >
                <X size={20} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 no-scrollbar bg-white">
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