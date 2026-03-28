"use client"
import { useState, useMemo } from 'react'
import { Plus, Trash2, DollarSign, Loader2, PieChart } from 'lucide-react'
import { createServiceAction } from '@/app/actions/create-service'

export default function ServiceForm({ inventoryData, onComplete }: any) {
  const [loading, setLoading] = useState(false)
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState('')
  const [items, setItems] = useState<{ insumo_id: string; cantidad: number }[]>([])

  // Lógica de procesamiento de insumos
  const insumosDisponibles = useMemo(() => {
    const map = new Map();
    inventoryData.forEach((lote: any) => {
      if (!lote.insumos) return;
      const id = lote.insumos.id;
      const precioUnitario = Number(lote.precio_compra_unidad) || 0;
      if (!map.has(id)) {
        map.set(id, { ...lote.insumos, precio_sugerido: precioUnitario });
      } else {
        const existente = map.get(id);
        if (precioUnitario > existente.precio_sugerido) {
          map.set(id, { ...existente, precio_sugerido: precioUnitario });
        }
      }
    });
    return Array.from(map.values());
  }, [inventoryData]);

  const costoTotal = useMemo(() => {
    return items.reduce((acc, item) => {
      const insumo = insumosDisponibles.find(i => i.id === item.insumo_id);
      return acc + ((insumo?.precio_sugerido || 0) * item.cantidad);
    }, 0);
  }, [items, insumosDisponibles]);

  const margen = useMemo(() => {
    const p = Number(precio) || 0;
    if (p === 0) return 0;
    return ((p - costoTotal) / p) * 100;
  }, [precio, costoTotal]);

  const agregarInsumo = () => setItems([...items, { insumo_id: '', cantidad: 1 }]);

  const handleSubmit = async () => {
    if (!nombre || items.length === 0 || !precio) return;
    setLoading(true);
    try {
      const res = await createServiceAction({ nombre, precio: Number(precio), insumos: items });
      if (res.success) onComplete();
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-12 pb-10">
      {/* Sección 1: Definición Básica */}
      <div className="space-y-6">
        <div className="group">
          <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider ml-1">Nombre del Servicio</label>
          <input 
            type="text" 
            placeholder="Nombre del procedimiento..."
            className="w-full text-2xl font-semibold tracking-tight border-b border-zinc-100 focus:border-zinc-900 focus:ring-0 placeholder:text-zinc-200 text-zinc-900 bg-transparent py-3 transition-all outline-none"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        <div className="group">
          <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider ml-1">Precio de Venta</label>
          <div className="flex items-center gap-2 border-b border-zinc-100 focus-within:border-zinc-900 transition-all py-3">
            <span className="text-zinc-400 text-xl font-medium">$</span>
            <input 
              type="number" 
              placeholder="0"
              className="bg-transparent border-none focus:ring-0 p-0 w-full font-semibold text-xl text-zinc-900 placeholder:text-zinc-200 outline-none"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Sección 2: Receta */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-50 pb-2">
          <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-tight flex items-center gap-2">
            Insumos Requeridos
          </h4>
        </div>
        
        <div className="space-y-1">
          {items.map((item, idx) => (
            <div key={idx} className="flex flex-col md:flex-row gap-4 py-3 border-b border-zinc-50 last:border-0 items-start md:items-center">
              <select 
                className="flex-1 bg-transparent border-none font-medium text-sm focus:ring-0 text-zinc-600 cursor-pointer outline-none min-w-0 truncate"
                value={item.insumo_id}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[idx].insumo_id = e.target.value;
                  setItems(newItems);
                }}
              >
                <option value="">Seleccionar del stock...</option>
                {insumosDisponibles.map((ins: any) => (
                  <option key={ins.id} value={ins.id}>{ins.nombre} — {ins.marca}</option>
                ))}
              </select>
              
              <div className="flex items-center gap-4 w-full md:w-auto justify-between">
                <div className="flex items-center gap-2 bg-zinc-50 px-3 py-1 rounded-lg">
                  <input 
                    type="number" 
                    min="1"
                    className="w-8 bg-transparent border-none p-0 text-center font-bold text-xs focus:ring-0 text-zinc-900"
                    value={item.cantidad}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[idx].cantidad = Math.max(1, Number(e.target.value));
                      setItems(newItems);
                    }}
                  />
                  <span className="text-[10px] text-zinc-400 font-medium">UDS</span>
                </div>

                <button 
                  onClick={() => setItems(items.filter((_, i) => i !== idx))} 
                  className="text-zinc-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          <button 
            onClick={agregarInsumo} 
            className="flex items-center gap-2 text-[11px] font-bold text-zinc-400 hover:text-zinc-900 transition-colors py-4 uppercase tracking-widest"
          >
            <Plus size={14} /> Agregar Insumo
          </button>
        </div>
      </div>

      {/* Sección 3: Análisis de Rentabilidad */}
      <div className="bg-zinc-50 rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
          <PieChart size={14} /> Análisis de Rentabilidad
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] text-zinc-500 font-medium uppercase mb-1">Costo Estimado</p>
            <p className="text-xl font-semibold text-zinc-900">
              ${costoTotal.toLocaleString('es-CO')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-zinc-500 font-medium uppercase mb-1">Margen Neto</p>
            <p className={`text-2xl font-bold tracking-tight ${margen > 60 ? 'text-emerald-600' : margen > 30 ? 'text-amber-600' : 'text-rose-600'}`}>
              {margen.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Botón Principal */}
      <button 
        disabled={loading || !nombre || items.length === 0 || !precio}
        onClick={handleSubmit}
        className="w-full bg-zinc-900 text-white py-4 rounded-lg font-bold text-sm hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:opacity-30 flex items-center justify-center gap-3"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? "Guardando..." : "Guardar Protocolo"}
      </button>
    </div>
  )
}