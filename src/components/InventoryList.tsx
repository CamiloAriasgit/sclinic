"use client"

import { useEffect, useState, useCallback } from 'react'
import { getInventoryAction } from '@/app/actions/get-inventory'
import { ChevronDown, Package, Calendar, Barcode, Loader2 } from 'lucide-react'

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
    <div className="w-full py-10">
      <div className="mb-8 px-2 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Stock en Tiempo Real</h2>
          <p className="text-sm text-zinc-500">Gestión de lotes y fechas de caducidad por insumo.</p>
        </div>
        <div className="px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-bold text-zinc-500 uppercase">
          {inventoryArray.length} Productos
        </div>
      </div>

      <div className="space-y-2">
        {inventoryArray.map((group: any) => {
          const isExpanded = expandedInsumo === group.nombre;
          return (
            <div 
              key={group.nombre} 
              className={`border transition-all duration-200 rounded-xl overflow-hidden ${isExpanded ? 'border-zinc-900 bg-white' : 'border-zinc-200 bg-white hover:border-zinc-400'}`}
            >
              <button 
                onClick={() => setExpandedInsumo(isExpanded ? null : group.nombre)}
                className="w-full p-5 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isExpanded ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                    <Package size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{group.marca}</span>
                    <h3 className="text-base font-semibold text-zinc-900 leading-tight">{group.nombre}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-lg font-bold text-zinc-900 leading-none">{group.totalUnits}</p>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">Unidades</span>
                  </div>
                  <ChevronDown size={18} className={`text-zinc-300 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-zinc-900' : ''}`} />
                </div>
              </button>

              <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[800px]' : 'max-h-0'}`}>
                <div className="px-5 pb-5 pt-0 space-y-2">
                  <div className="grid grid-cols-3 gap-2 px-4 py-2 text-[9px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-50">
                    <span>Identificador Lote</span>
                    <span>Vencimiento</span>
                    <span className="text-right">Stock</span>
                  </div>
                  {group.lotes.map((lote: any) => (
                    <div key={lote.id} className="grid grid-cols-3 items-center px-4 py-3 bg-zinc-50 rounded-lg border border-zinc-100 group">
                      <div className="flex items-center gap-2">
                        <Barcode size={14} className="text-zinc-400" />
                        <span className="text-xs font-mono font-bold text-zinc-700">{lote.numero_lote}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-zinc-400" />
                        <span className={`text-xs font-semibold ${new Date(lote.fecha_vencimiento) < new Date() ? 'text-red-500' : 'text-zinc-600'}`}>
                          {lote.fecha_vencimiento}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-zinc-900">{lote.cantidad_actual}</span>
                        <span className="text-[10px] ml-1 font-medium text-zinc-400">uds</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}