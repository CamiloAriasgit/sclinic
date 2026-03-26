// src/app/(dashboard)/auditoria/page.tsx
"use client"
import { useState, useEffect } from 'react'
import { getAuditLogsAction } from '@/app/actions/get-audit-logs'
import { ClipboardList, User, Package, Clock, ArrowDownRight, Search } from 'lucide-react'

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

useEffect(() => {
  getAuditLogsAction()
    .then(data => {
      setLogs(data || [])
      setLoading(false)
    })
    .catch(() => {
      setLoading(false)
      // Opcional: mostrar un mensaje de "Error de conexión"
    })
}, [])

  return (
    <div className="max-w-7xl mx-auto pt-10 space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Auditoría de Operaciones</h1>
          <p className="text-sm text-zinc-500">Trazabilidad completa de insumos y procedimientos.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <input 
            type="text" 
            placeholder="Buscar paciente o insumo..." 
            className="pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 ring-zinc-100 w-64"
          />
        </div>
      </header>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Fecha y Hora</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Paciente / Servicio</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Insumo Utilizado</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-right">Cantidad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-zinc-50/50 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-100 rounded-lg text-zinc-500 group-hover:bg-white transition-colors">
                      <Clock size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-900">
                        {new Date(log.fecha_procedimiento).toLocaleDateString('es-CO')}
                      </p>
                      <p className="text-[10px] text-zinc-400 font-medium">
                        {new Date(log.fecha_procedimiento).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                      <User size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-800 uppercase tracking-tight">
                        {log.pacientes?.nombre_completo}
                      </p>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">
                        {log.servicios?.nombre}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-400">
                      <Package size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-800">
                        {log.lotes?.insumos?.nombre}
                      </p>
                      <p className="text-[10px] font-mono text-zinc-400">
                        Lote: {log.lotes?.numero_lote} • {log.lotes?.insumos?.marca}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 rounded-full">
                    <ArrowDownRight size={12} />
                    <span className="text-xs font-black">-{log.cantidad_used}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && (
          <div className="py-20 text-center space-y-4">
            <div className="w-8 h-8 border-4 border-zinc-200 border-t-black rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Sincronizando registros...</p>
          </div>
        )}
      </div>
    </div>
  )
}