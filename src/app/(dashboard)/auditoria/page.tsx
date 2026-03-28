// src/app/(dashboard)/auditoria/page.tsx
"use client"
import { useState, useEffect } from 'react'
import { getAuditLogsAction } from '@/app/actions/get-audit-logs'
import { User, Package, Clock, ArrowDownRight, Search, Loader2, ClipboardList } from 'lucide-react'

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    getAuditLogsAction()
      .then(data => {
        setLogs(data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-7xl mx-auto pb-20 md:px-0 space-y-8">
      {/* Header Compacto */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900 uppercase">Auditoría</h1>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
          <input 
            type="text" 
            placeholder="Buscar registro..." 
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 ring-zinc-100 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* Vista de Escritorio (Tabla) */}
      <div className="hidden md:block bg-white border border-zinc-200 rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50/50 border-b border-zinc-100">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Fecha y Hora</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Paciente / Servicio</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Insumo Utilizado</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-right">Cantidad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-zinc-50/30 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <Clock size={14} className="text-zinc-300" />
                    <div>
                      <p className="text-xs font-bold text-zinc-900">{new Date(log.fecha_procedimiento).toLocaleDateString('es-CO')}</p>
                      <p className="text-[10px] text-zinc-400 font-medium">{new Date(log.fecha_procedimiento).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <p className="text-xs font-bold text-zinc-800 uppercase truncate max-w-[200px]">{log.pacientes?.nombre_completo}</p>
                  <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-tight">{log.servicios?.nombre}</p>
                </td>
                <td className="px-6 py-5">
                  <p className="text-xs font-semibold text-zinc-700">{log.lotes?.insumos?.nombre}</p>
                  <p className="text-[9px] font-mono text-zinc-400">Lote: {log.lotes?.numero_lote}</p>
                </td>
                <td className="px-6 py-5 text-right">
                  <span className="inline-flex items-center gap-1 text-xs font-black text-red-500 bg-red-50/50 px-2 py-1 rounded">
                    -{log.cantidad_used}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista Móvil (Cards) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {logs.map((log) => (
          <div key={log.id} className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-zinc-100 rounded-lg text-zinc-400">
                  <Clock size={14} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-900 uppercase tracking-tight">
                    {new Date(log.fecha_procedimiento).toLocaleDateString('es-CO')}
                  </p>
                  <p className="text-[9px] text-zinc-400 font-medium tracking-widest uppercase">
                    {new Date(log.fecha_procedimiento).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-red-50 px-2 py-1 rounded text-red-600 font-black text-[10px]">
                <ArrowDownRight size={10} />
                -{log.cantidad_used}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-zinc-900 text-white rounded-full flex items-center justify-center">
                  <User size={12} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-zinc-900 uppercase truncate">{log.pacientes?.nombre_completo}</p>
                  <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter truncate">{log.servicios?.nombre}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-zinc-50 pt-3">
                <div className="w-7 h-7 bg-zinc-100 text-zinc-400 rounded-lg flex items-center justify-center">
                  <Package size={12} />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-700">{log.lotes?.insumos?.nombre}</p>
                  <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-tighter">Lote: {log.lotes?.numero_lote}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-20 text-center space-y-4">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-300 mx-auto" />
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Sincronizando registros...</p>
        </div>
      )}

      {!loading && logs.length === 0 && (
        <div className="py-32 text-center bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-100">
          <ClipboardList className="mx-auto text-zinc-200 mb-4" size={40} />
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">No hay registros de auditoría</p>
        </div>
      )}
    </div>
  )
}