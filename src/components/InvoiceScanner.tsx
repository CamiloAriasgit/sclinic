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
    <div className="w-full space-y-6">
      <div className={`
        relative border-2 border-dashed rounded-2xl p-8 transition-all
        flex flex-col items-center justify-center text-center
        ${loading ? 'bg-zinc-100 border-zinc-300' : 'bg-white border-zinc-200 hover:border-zinc-400'}
      `}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${loading ? 'bg-white' : 'bg-zinc-900 text-white'}`}>
          {loading ? <Loader2 size={20} className="animate-spin text-zinc-900" /> : <Upload size={20} />}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-zinc-900">{loading ? "Procesando..." : "Subir factura"}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">JPG, PNG o PDF</p>
        </div>
        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer disabled:hidden" onChange={handleUpload} disabled={loading} accept="image/*" />
      </div>

      {results && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-end px-1">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Previsualización</h3>
            <button onClick={() => setResults(null)} className="text-[10px] font-bold text-red-500 hover:underline">CANCELAR</button>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl divide-y divide-zinc-100 overflow-hidden shadow-sm">
            {results.map((item, index) => (
              <div key={index} className="p-4 grid grid-cols-12 gap-3 items-center">
                <div className="col-span-8 min-w-0">
                  <p className="font-bold text-sm text-zinc-900 truncate">{item.producto_nombre}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[9px] font-mono bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-600">L:{item.lote_numero}</span>
                    <span className="text-[9px] font-bold bg-red-50 text-red-600 px-1.5 py-0.5 rounded">V:{item.fecha_vencimiento}</span>
                  </div>
                </div>
                <div className="col-span-4 text-right">
                  <p className="text-sm font-black text-zinc-900">{item.cantidad} U</p>
                  <p className="text-[10px] text-zinc-400 font-medium">${Number(item.precio_compra).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            className="w-full bg-zinc-900 text-white h-14 rounded-xl text-sm font-bold hover:bg-zinc-800 transition-transform active:scale-[0.98] shadow-xl shadow-zinc-200 flex items-center justify-center gap-2"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
            Confirmar e Ingresar Stock
          </button>
        </div>
      )}
    </div>
  )
}