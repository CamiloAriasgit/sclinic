"use client"

import { useState } from 'react'
import { processInvoiceAction } from '@/app/actions/process-invoice'
import { saveLotesAction } from '@/app/actions/save-lotes'
import { Upload, FileText, Check, AlertCircle, Loader2, X } from 'lucide-react'

export default function InvoiceScanner() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[] | null>(null)

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setResults(null)

    try {
      const base64Data = await fileToBase64(file);
      const aiResponse = await processInvoiceAction(base64Data);
      if (aiResponse.lotes) setResults(aiResponse.lotes)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (!results) return
    setLoading(true)
    try {
      const response = await saveLotesAction(results);
      if (response.success) {
        window.dispatchEvent(new Event('inventory-updated'));
        setResults(null);
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      {/* Zona de Carga Refinada */}
      <div className={`
        relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300
        flex flex-col items-center justify-center text-center
        ${loading ? 'bg-zinc-50 border-zinc-200' : 'bg-white border-zinc-200 hover:border-zinc-900'}
      `}>
        <div className={`
          w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-all
          ${loading ? 'bg-zinc-100' : 'bg-zinc-900 text-white'}
        `}>
          {loading ? <Loader2 size={20} className="animate-spin text-zinc-900" /> : <Upload size={20} />}
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-zinc-900">
            {loading ? "Analizando Factura con IA..." : "Cargar Factura de Compra"}
          </h3>
          <p className="text-xs text-zinc-500">Sube una imagen para extraer lotes automáticamente</p>
        </div>

        <input
          type="file"
          className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
          onChange={handleUpload}
          disabled={loading}
          accept="image/*"
        />
      </div>

      {/* Resultados de Extracción */}
      {results && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
          <div className="flex justify-between items-center px-2">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
              <FileText size={12} /> Items Detectados
            </h4>
            <button onClick={() => setResults(null)} className="text-[10px] font-bold text-zinc-400 hover:text-zinc-900 flex items-center gap-1">
              <X size={12} /> DESCARTAR
            </button>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden divide-y divide-zinc-100">
            {results.map((item, index) => (
              <div key={index} className="p-5 flex justify-between items-center bg-white">
                <div className="space-y-1.5">
                  <p className="font-semibold text-sm text-zinc-900">{item.producto_nombre}</p>
                  <div className="flex gap-3">
                    <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">LOTE: {item.lote_numero}</span>
                    <span className="text-[10px] font-bold text-red-600">VENCE: {item.fecha_vencimiento}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-zinc-900">{item.cantidad} <span className="text-[10px] text-zinc-400">UDS</span></p>
                  <p className="text-[10px] font-semibold text-zinc-500">${Number(item.precio_compra).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            className="w-full bg-zinc-900 text-white py-4 rounded-lg text-sm font-semibold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {loading ? "Sincronizando..." : "Confirmar Ingreso a Inventario"}
          </button>
        </div>
      )}
    </div>
  )
}