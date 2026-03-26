"use client"

import { useEffect, useState, useCallback } from 'react'
import { getInventoryAction } from '@/app/actions/get-inventory'
import { ChevronDown, Package, Calendar, Barcode, Loader2, Info } from 'lucide-react'

export default function InventoryList() {
  const [inventory, setInventory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedInsumo, setExpandedInsumo] = useState<string | null>(null)

  const refreshInventory = useCallback(async () => {
    setLoading(true);
    const data = await getInventoryAction();
    setInventory(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { refreshInventory() }, [refreshInventory])

  useEffect(() => {
    const handleUpdate = () => refreshInventory()
    window.addEventListener('inventory-updated', handleUpdate)
    return () => window.removeEventListener('inventory-updated', handleUpdate)
  }, [refreshInventory])

  const groupedInventory = inventory.reduce((acc: any, item) => {
    const nombreInsumo = item.insumos?.nombre || "Insumo Desconocido"
    if (!acc[nombreInsumo]) {
      acc[nombreInsumo] = {
        nombre: nombreInsumo,
        marca: item.insumos?.marca || "Sin Marca",
        totalUnits: 0,
        lotes: []
      }
    }
    acc[nombreInsumo].totalUnits += item.cantidad_actual
    acc[nombreInsumo].lotes.push(item)
    return acc
  }, {})

  const inventoryArray = Object.values(groupedInventory)

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <Loader2 className="animate-spin text-zinc-300" size={32} />
      <p className="text-zinc-400 font-semibold text-[10px] uppercase tracking-widest">Sincronizando Stock...</p>
    </div>
  )

  return (
    <div className="w-full">
      {/* Header de la lista */}
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4 px-1">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900">Stock en Tiempo Real</h2>
          <p className="text-xs md:text-sm text-zinc-500">Gestión de lotes y caducidad por activo.</p>
        </div>
        <div className="self-start px-3 py-1 bg-zinc-200 text-zinc-500 rounded-full text-[10px] font-bold uppercase tracking-wider">
          {inventoryArray.length} Productos
        </div>
      </div>

      <div className="space-y-3">
        {inventoryArray.map((group: any) => {
          const isExpanded = expandedInsumo === group.nombre;
          return (
            <div 
              key={group.nombre} 
              className={`border transition-all duration-300 rounded-xl overflow-hidden ${isExpanded ? 'border-zinc-900 ring-1 ring-zinc-900 shadow-sm' : 'border-zinc-200 bg-white hover:border-zinc-300'}`}
            >
              <button 
                onClick={() => setExpandedInsumo(isExpanded ? null : group.nombre)}
                className="w-full p-4 md:p-5 flex items-center justify-between text-left bg-white"
              >
                <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center transition-colors ${isExpanded ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                    <Package size={20} />
                  </div>
                  <div className="truncate">
                    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-zinc-400 block truncate">{group.marca}</span>
                    <h3 className="text-sm md:text-base font-bold text-zinc-900 leading-tight truncate">{group.nombre}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-4 md:gap-8 ml-4">
                  <div className="text-right">
                    <p className="text-base md:text-xl font-black text-zinc-900 leading-none">{group.totalUnits}</p>
                    <span className="text-[8px] md:text-[9px] font-bold text-zinc-400 uppercase">Uds</span>
                  </div>
                  <ChevronDown size={18} className={`text-zinc-300 transition-transform duration-500 ${isExpanded ? 'rotate-180 text-zinc-900' : ''}`} />
                </div>
              </button>

              <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-4 md:px-5 pb-5 pt-2 space-y-2 bg-zinc-50/50">
                  {/* Cabecera Lotes - Solo en Desktop */}
                  <div className="hidden md:grid grid-cols-3 gap-2 px-4 py-2 text-[9px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100">
                    <span>Identificador Lote</span>
                    <span>Vencimiento</span>
                    <span className="text-right">Stock</span>
                  </div>

                  {/* Lista de Lotes */}
                  {group.lotes.map((lote: any) => {
                    const isExpired = new Date(lote.fecha_vencimiento) < new Date();
                    return (
                      <div key={lote.id} className="flex flex-col md:grid md:grid-cols-3 gap-2 md:items-center px-4 py-3 bg-white rounded-lg border border-zinc-200/60 shadow-sm group">
                        
                        {/* Lote */}
                        <div className="flex items-center gap-2">
                          <Barcode size={14} className="text-zinc-400" />
                          <span className="text-[11px] md:text-xs font-mono font-bold text-zinc-700"># {lote.numero_lote}</span>
                        </div>

                        {/* Vencimiento y Stock (En móvil van en la misma fila para ahorrar espacio) */}
                        <div className="flex items-center justify-between md:contents">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className={isExpired ? 'text-red-500' : 'text-zinc-400'} />
                            <span className={`text-[11px] md:text-xs font-bold ${isExpired ? 'text-red-600' : 'text-zinc-600'}`}>
                              {lote.fecha_vencimiento}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-black text-zinc-900">{lote.cantidad_actual}</span>
                            <span className="text-[10px] ml-1 font-bold text-zinc-400 uppercase">uds</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}