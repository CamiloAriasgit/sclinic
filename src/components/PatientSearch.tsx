"use client"
import { useState, useEffect, useRef } from 'react'
import { getPatientsAction } from '@/app/actions/get-patients'
import { Search, User, Check, Plus, Loader2, X } from 'lucide-react'

export default function PatientSearch({ onSelect }: { onSelect: (patient: any) => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.length < 3) {
      setResults([])
      return
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true)
      const data = await getPatientsAction(query)
      setResults(data)
      setLoading(false)
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [query])

  const handleSelect = (patient: any) => {
    setSelectedPatient(patient)
    setQuery(patient.nombre_completo)
    setResults([])
    onSelect(patient)
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setSelectedPatient(null)
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1 mb-2 block">
        Búsqueda de Paciente
      </label>
      
      {/* Input de Búsqueda Estilo Shadcn */}
      <div className={`
        flex items-center gap-3 bg-white px-4 py-3 rounded-lg border border-zinc-200 transition-all duration-200
        ${results.length > 0 ? 'border-zinc-300 ring-1 ring-zinc-100' : 'border-zinc-200'}
        focus-within:border-zinc-200 focus-within:ring-1 focus-within:ring-zinc-100
      `}>
        <Search className="text-zinc-400" size={18} />
        <input 
          type="text" 
          placeholder="Nombre o número de documento..."
          className="flex-1 bg-transparent border-none focus:ring-0 ring-0 p-0 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none font-medium"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (selectedPatient) setSelectedPatient(null)
          }}
        />
        
        {loading ? (
          <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />
        ) : query.length > 0 ? (
          <button onClick={clearSearch} className="text-zinc-300 hover:text-zinc-900 transition-colors">
            <X size={16} />
          </button>
        ) : null}
      </div>

      {/* Dropdown de Resultados (Command List) */}
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-zinc-200 shadow-none z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-1">
            <p className="px-3 py-2 text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Resultados encontrados</p>
            <div className="max-h-[280px] overflow-y-auto">
              {results.map(patient => (
                <button 
                  key={patient.id} 
                  onClick={() => handleSelect(patient)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-100 text-left transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-white group-hover:text-zinc-900 transition-colors">
                    <User size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-zinc-900 truncate">
                      {patient.nombre_completo}
                    </p>
                    <p className="text-[11px] text-zinc-500 font-mono">
                      {patient.numero_documento}
                    </p>
                  </div>
                  <Check size={14} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Estado: No encontrado */}
      {query.length >= 3 && results.length === 0 && !loading && !selectedPatient && (
        <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-zinc-50 rounded-xl border border-zinc-200 text-center animate-in fade-in slide-in-from-top-1">
          <p className="text-xs font-medium text-zinc-500">No hay coincidencias para "{query}"</p>
          <button className="mt-3 text-[11px] font-bold text-zinc-900 hover:underline flex items-center gap-1.5 mx-auto transition-all">
            <Plus size={14} /> Crear ficha de paciente
          </button>
        </div>
      )}
    </div>
  )
}