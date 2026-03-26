"use client"
import { useState, useMemo } from 'react'
import { Plus, Trash2, Calculator, DollarSign, Info, Loader2 } from 'lucide-react'
import { createServiceAction } from '@/app/actions/create-service'

export default function ServiceForm({ inventoryData, onComplete }: any) {
  const [loading, setLoading] = useState(false)
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState('')
  const [items, setItems] = useState<{ insumo_id: string; cantidad: number }[]>([])

  // 1. Procesamiento de Insumos (Lógica intacta)
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

  // 2. Cálculos (Lógica intacta)
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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header del Formulario */}
      <section className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Identificación del Procedimiento</label>
          <input 
            type="text" 
            placeholder="Ej. Aplicación de Toxina Botulínica"
            className="w-full text-2xl font-bold tracking-tight border-b-2 border-zinc-100 focus:border-zinc-900 focus:ring-0 placeholder:text-zinc-200 text-zinc-900 bg-transparent py-2 transition-colors"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Valor de Venta (PVP)</label>
          <div className="flex items-center gap-3 bg-zinc-50 px-5 py-4 rounded-xl border border-zinc-100 focus-within:border-zinc-300 transition-all">
            <DollarSign className="text-zinc-400" size={20} />
            <input 
              type="number" 
              placeholder="0.00"
              className="bg-transparent border-none focus:ring-0 p-0 w-full font-bold text-xl text-zinc-900 placeholder:text-zinc-300"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Receta de Insumos */}
      <section className="space-y-4">
        <div className="flex justify-between items-end px-1">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
              <Plus size={12} className="text-zinc-900" /> Receta de Insumos
            </h4>
            <span className="text-[9px] font-medium text-zinc-400 italic flex items-center gap-1">
              <Info size={10} /> Precios de último lote
            </span>
        </div>
        
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="group flex gap-3 items-center bg-white p-3 rounded-xl border border-zinc-200 hover:border-zinc-400 transition-all">
              <select 
                className="flex-1 bg-transparent border-none font-semibold text-sm focus:ring-0 text-zinc-900 appearance-none cursor-pointer"
                value={item.insumo_id}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[idx].insumo_id = e.target.value;
                  setItems(newItems);
                }}
              >
                <option value="">Seleccionar insumo del stock...</option>
                {insumosDisponibles.map((ins: any) => (
                  <option key={ins.id} value={ins.id}>{ins.nombre} — {ins.marca}</option>
                ))}
              </select>
              
              <div className="flex items-center gap-2 bg-zinc-100 px-3 py-1.5 rounded-lg border border-zinc-200">
                  <input 
                    type="number" 
                    min="1"
                    className="w-8 bg-transparent border-none p-0 text-center font-bold text-sm focus:ring-0 text-zinc-900"
                    value={item.cantidad}
                    onChange={(e) => {
                        const newItems = [...items];
                        newItems[idx].cantidad = Math.max(1, Number(e.target.value));
                        setItems(newItems);
                    }}
                  />
                  <span className="text-[9px] font-bold text-zinc-400 uppercase">uds</span>
              </div>

              <button 
                  onClick={() => setItems(items.filter((_, i) => i !== idx))} 
                  className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          <button 
              onClick={agregarInsumo} 
              className="w-full py-4 border-2 border-dashed border-zinc-100 rounded-xl text-zinc-400 font-bold text-[10px] hover:border-zinc-900 hover:text-zinc-900 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
          >
            <Plus size={14} /> Vincular Insumo
          </button>
        </div>
      </section>

      {/* Panel Financiero (Black Mode) */}
      <section className="bg-zinc-900 rounded-2xl p-8 relative overflow-hidden">
        <div className="flex justify-between items-start relative z-10">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-2 text-zinc-500 font-bold text-[10px] uppercase tracking-widest">
              <Calculator size={12} /> Desglose Financiero
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-zinc-500 text-[9px] font-bold uppercase mb-1">Costo Operativo</p>
                <p className="font-mono text-xl text-white font-bold">
                  ${costoTotal.toLocaleString('es-CO')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-zinc-500 text-[9px] font-bold uppercase mb-1">Margen Estimado</p>
                <p className={`text-3xl font-bold tracking-tighter ${margen > 60 ? 'text-emerald-400' : margen > 30 ? 'text-amber-400' : 'text-rose-500'}`}>
                    {margen.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-zinc-800">
          <p className="text-[10px] text-zinc-500 font-medium leading-tight">
            * Margen basado en el costo unitario más alto registrado para asegurar rentabilidad mínima.
          </p>
        </div>
      </section>

      <button 
        disabled={loading || !nombre || items.length === 0 || !precio}
        onClick={handleSubmit}
        className="w-full bg-zinc-900 text-white py-5 rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:opacity-20 disabled:grayscale flex items-center justify-center gap-3"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : null}
        {loading ? "Sincronizando..." : "Publicar Protocolo Médico"}
      </button>
    </div>
  )
}