"use client"

import { useState, useEffect } from 'react'
import { getServicesAction } from '@/app/actions/get-services'
import { getPatientsAction } from '@/app/actions/get-patients'
import { createProcedureAction } from '@/app/actions/create-procedure'
import { createPatientQuickAction } from '@/app/actions/create-patient'
import PatientSearch from '@/components/PatientSearch'
import {
    Plus,
    Trash2,
    ShoppingCart,
    UserPlus,
    CheckCircle2,
    User,
    ChevronRight,
    ArrowLeft,
    Search
} from 'lucide-react'

export default function OperationPage() {
    const [step, setStep] = useState(1)
    const [services, setServices] = useState<any[]>([])
    const [patients, setPatients] = useState<any[]>([])
    const [selectedPatient, setSelectedPatient] = useState<any>(null)
    const [cart, setCart] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [showNewPatientModal, setShowNewPatientModal] = useState(false)
    const [newPatient, setNewPatient] = useState({ nombre: '', documento: '' })

    useEffect(() => {
        async function init() {
            const [servicesData, patientsData] = await Promise.all([
                getServicesAction(),
                getPatientsAction("")
            ])
            setServices(servicesData)
            setPatients(patientsData)
        }
        init()
    }, [])

    const handleAddPatient = async () => {
        if (!newPatient.nombre || !newPatient.documento) return
        setLoading(true)
        try {
            const res = await createPatientQuickAction(newPatient.nombre, newPatient.documento)
            if (res.success) {
                setSelectedPatient(res.data)
                setShowNewPatientModal(false)
                setStep(2)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const getConsolidatedInsumos = () => {
        const consolidated: { [key: string]: { nombre: string, cantidad: number } } = {}
        cart.forEach(service => {
            service.servicio_insumos?.forEach((si: any) => {
                const id = si.insumo_id
                if (consolidated[id]) {
                    consolidated[id].cantidad += si.cantidad_consumo
                } else {
                    consolidated[id] = {
                        nombre: si.insumos?.nombre || 'Insumo',
                        cantidad: si.cantidad_consumo
                    }
                }
            })
        })
        return Object.values(consolidated)
    }

    const handleConfirmAll = async () => {
        setLoading(true)
        try {
            for (const service of cart) {
                // CORRECCIÓN: Aseguramos que el mapeo extraiga el ID correctamente
                const insumosProcesados = (service.servicio_insumos || []).map((si: any) => {
                    // Si por alguna razón insumo_id viene dentro de un objeto, lo extraemos
                    const id = typeof si.insumo_id === 'object' ? si.insumo_id.id : si.insumo_id;
                    return {
                        insumo_id: id,
                        cantidad_consumo: si.cantidad_consumo
                    }
                }).filter((item: any) => item.insumo_id); // Filtramos nulos por seguridad

                if (insumosProcesados.length === 0 && service.servicio_insumos?.length > 0) {
                    throw new Error(`El servicio ${service.nombre} tiene insumos mal configurados.`);
                }

                const res = await createProcedureAction({
                    paciente_id: selectedPatient.id,
                    servicio_id: service.id,
                    insumos: insumosProcesados
                })

                if (!res.success) throw new Error(res.error)
            }
            setStep(4)
        } catch (error: any) {
            alert("Error: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-7xl pt-10 min-h-screen bg-white text-zinc-900">

            {/* Paso 1: Selección de Paciente */}
            {step === 1 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
                    <header className="border-b border-zinc-100 pb-6">
                        <h1 className="text-3xl font-semibold tracking-tight">Nueva Operación</h1>
                        <p className="text-zinc-500 text-sm mt-1">Selecciona un paciente para comenzar el protocolo.</p>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                <PatientSearch onSelect={(p) => { setSelectedPatient(p); setStep(2); }} />
                            </div>

                            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
                                <div className="px-4 py-3 bg-zinc-50/50 border-b border-zinc-200">
                                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Pacientes Recientes</h3>
                                </div>
                                <div className="divide-y divide-zinc-100">
                                    {patients.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => { setSelectedPatient(p); setStep(2); }}
                                            className="w-full flex justify-between items-center p-4 hover:bg-zinc-50 transition-colors text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500">
                                                    <User size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-zinc-900 leading-none">{p.nombre_completo}</p>
                                                    <p className="text-xs text-zinc-500 mt-1 font-mono">{p.numero_documento}</p>
                                                </div>
                                            </div>
                                            <ChevronRight size={14} className="text-zinc-300" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            <button
                                onClick={() => setShowNewPatientModal(true)}
                                className="w-full h-full min-h-[160px] flex flex-col items-center justify-center gap-3 border-2 border-dashed border-zinc-200 rounded-xl hover:border-zinc-400 hover:bg-zinc-50 transition-all text-zinc-500 group"
                            >
                                <div className="p-3 bg-zinc-100 rounded-full group-hover:bg-zinc-200 transition-colors">
                                    <UserPlus size={20} className="text-zinc-600" />
                                </div>
                                <span className="text-xs font-semibold">Registrar Nuevo Paciente</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Paso 2: Selección de Protocolos */}
            {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-400">
                    <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl text-white">
                        <div className="flex items-center gap-4">
                            <button onClick={() => { setStep(1); setCart([]); }} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                                <ArrowLeft size={18} />
                            </button>
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Atendiendo a</p>
                                <h2 className="text-lg font-semibold">{selectedPatient?.nombre_completo}</h2>
                            </div>
                        </div>
                        <div className="px-3 py-1 bg-zinc-800 rounded-md text-[10px] font-mono text-zinc-400 border border-zinc-700">
                            ID: {selectedPatient?.numero_documento}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <div className="lg:col-span-3">
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 px-1">Protocolos Disponibles</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {services.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => setCart([...cart, s])}
                                        className="flex justify-between items-center p-5 bg-white border border-zinc-200 rounded-xl hover:border-zinc-900 transition-all group"
                                    >
                                        <div>
                                            <p className="font-semibold text-zinc-900 group-hover:text-black transition-colors">{s.nombre}</p>
                                            <p className="text-xs font-bold text-zinc-500 mt-1">${Number(s.precio_venta).toLocaleString()}</p>
                                        </div>
                                        <div className="w-8 h-8 rounded-lg border border-zinc-100 flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-all">
                                            <Plus size={16} />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sidebar de Carrito */}
                        <div className="lg:col-span-1">
                            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 sticky top-6">
                                <div className="flex items-center gap-2 mb-6 border-b border-zinc-200 pb-4">
                                    <ShoppingCart size={16} className="text-zinc-900" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Orden Actual</span>
                                </div>

                                <div className="space-y-3 mb-8">
                                    {cart.length === 0 && (
                                        <p className="text-[11px] text-zinc-400 text-center py-4">No hay protocolos seleccionados</p>
                                    )}
                                    {cart.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-start group/item">
                                            <span className="text-sm font-medium text-zinc-700 line-clamp-2 leading-tight">{item.nombre}</span>
                                            <button
                                                onClick={() => setCart(cart.filter((_, i) => i !== idx))}
                                                className="text-zinc-300 hover:text-red-500 transition-colors ml-2"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    disabled={cart.length === 0}
                                    onClick={() => setStep(3)}
                                    className="w-full bg-zinc-900 text-white py-3 rounded-lg text-sm font-semibold hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Confirmar Orden
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Paso 3: Confirmación Final */}
            {step === 3 && (
                <div className="max-w-2xl mx-auto space-y-8 animate-in zoom-in-95 duration-400">
                    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-none">
                        <header className="p-8 border-b border-zinc-100 bg-zinc-50/50">
                            <h2 className="text-2xl font-semibold tracking-tight">Revisión de Procedimiento</h2>
                            <p className="text-zinc-500 text-sm mt-1">Verifica los insumos que serán descontados automáticamente.</p>
                        </header>

                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Protocolos</h3>
                                    <div className="space-y-2">
                                        {cart.map((s, i) => (
                                            <div key={i} className="text-sm font-medium py-1 border-b border-zinc-50">{s.nombre}</div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Gasto de Insumos</h3>
                                    <div className="bg-zinc-50 rounded-lg p-4 border border-zinc-100 space-y-3">
                                        {getConsolidatedInsumos().map((insumo, i) => (
                                            <div key={i} className="flex justify-between text-xs">
                                                <span className="text-zinc-500 font-medium">{insumo.nombre}</span>
                                                <span className="text-zinc-900 font-bold">{insumo.cantidad} uds</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setStep(2)}
                                    className="flex-1 px-4 py-3 border border-zinc-200 rounded-lg text-sm font-semibold hover:bg-zinc-50 transition-colors"
                                >
                                    Volver
                                </button>
                                <button
                                    onClick={handleConfirmAll}
                                    disabled={loading}
                                    className="flex-[2] bg-zinc-900 text-white px-4 py-3 rounded-lg text-sm font-semibold hover:bg-zinc-800 transition-all disabled:opacity-70"
                                >
                                    {loading ? "Procesando..." : "Finalizar y Descontar Stock"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Paso 4: Éxito */}
            {step === 4 && (
                <div className="max-w-md mx-auto text-center py-20 space-y-6 animate-in fade-in zoom-in-90 duration-500">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                        <CheckCircle2 size={40} strokeWidth={1.5} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-semibold tracking-tight">Procedimiento Exitoso</h2>
                        <p className="text-zinc-500 text-sm mt-2 leading-relaxed">
                            El inventario ha sido actualizado correctamente.
                        </p>
                    </div>
                    <button
                        onClick={() => { setStep(1); setCart([]); setSelectedPatient(null); getPatientsAction("").then(setPatients); }}
                        className="w-full bg-zinc-900 text-white py-3 rounded-lg text-sm font-semibold hover:bg-zinc-800 transition-colors"
                    >
                        Nueva Consulta
                    </button>
                </div>
            )}

            {/* Modal: Registro Rápido */}
            {showNewPatientModal && (
                <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[60] flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="bg-white border border-zinc-200 p-8 rounded-2xl shadow-xl w-full max-w-sm space-y-6">
                        <h2 className="text-xl font-semibold">Registro Rápido</h2>
                        <div className="space-y-4">
                            <input className="w-full px-4 py-2 border rounded-lg" placeholder="Nombre" onChange={e => setNewPatient({ ...newPatient, nombre: e.target.value })} />
                            <input className="w-full px-4 py-2 border rounded-lg" placeholder="Documento" onChange={e => setNewPatient({ ...newPatient, documento: e.target.value })} />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setShowNewPatientModal(false)} className="flex-1 py-2 text-zinc-500">Cancelar</button>
                            <button onClick={handleAddPatient} disabled={loading} className="flex-[2] bg-zinc-900 text-white py-2 rounded-lg">
                                {loading ? "Creando..." : "Registrar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}