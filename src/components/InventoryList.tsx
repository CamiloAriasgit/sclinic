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
      <p className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest">Sincronizando Stock...</p>
    </div>
  )

  // ... (mismos imports y lógica de agrupación)

  return (
    <div className="w-full space-y-6">
      <header className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Inventario</h2>
          <p className="text-xs text-zinc-500">Stock total por producto y lote.</p>
        </div>
        <div className="h-10 w-10 bg-white border border-zinc-200 rounded-lg flex items-center justify-center">
           <span className="text-xs font-bold text-zinc-900">{inventoryArray.length}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3">
        {inventoryArray.map((group: any) => {
          const isExpanded = expandedInsumo === group.nombre;
          return (
            <div key={group.nombre} className={`group bg-white border rounded-lg transition-all duration-200 ${isExpanded ? 'border-zinc-900 shadow-md' : 'border-zinc-200'}`}>
              <button 
                onClick={() => setExpandedInsumo(isExpanded ? null : group.nombre)}
                className="w-full p-4 flex items-center gap-4 text-left"
              >
                <div className={`w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center transition-colors ${isExpanded ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-400'}`}>
                  <Package size={22} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-black uppercase tracking-tighter text-zinc-400">{group.marca}</span>
                  <h3 className="text-sm md:text-base font-bold text-zinc-900 leading-none truncate">{group.nombre}</h3>
                </div>

                <div className="text-right">
                  <p className="text-lg font-black text-zinc-900 leading-none">{group.totalUnits}</p>
                  <p className="text-[9px] font-bold text-zinc-400 uppercase">Total</p>
                </div>
                <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-180' : 'text-zinc-300'}`} />
              </button>

              <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[500px] border-t border-zinc-100' : 'max-h-0'}`}>
                <div className="p-2 bg-zinc-50/50 space-y-1">
                  {group.lotes.map((lote: any) => (
                    <div key={lote.id} className="bg-white border border-zinc-200 p-3 rounded-lg flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-zinc-100 px-2 py-1 rounded">
                          <Barcode size={12} className="text-zinc-500" />
                          <span className="text-[10px] font-mono font-bold text-zinc-700">{lote.numero_lote}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-zinc-400" />
                          <span className="text-[10px] font-bold text-zinc-600">{lote.fecha_vencimiento}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-zinc-900">{lote.cantidad_actual}</span>
                        <span className="text-[10px] ml-1 text-zinc-400 font-bold uppercase">Uds</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}