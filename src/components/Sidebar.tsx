"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/app/actions/auth'
import {
    LayoutDashboard,
    Package,
    Stethoscope,
    Activity,
    ShieldCheck,
    Settings,
    LogOut,
    Building2
} from 'lucide-react'

const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
    { name: 'Inventario', icon: Package, href: '/inventory' },
    { name: 'Protocolos', icon: Stethoscope, href: '/protocols' },
    { name: 'Operación', icon: Activity, href: '/operation' },
    { name: 'Auditoría', icon: ShieldCheck, href: '/auditoria' },
]

interface SidebarProps {
    clinic: { nombre: string } | null;
    isMobileOpen?: boolean;
    closeMobileMenu?: () => void;
}

export default function Sidebar({ clinic, isMobileOpen, closeMobileMenu }: SidebarProps) {
    const pathname = usePathname()

    return (
        <aside className={`
            fixed left-0 z-50 h-screen bg-white border-r border-zinc-200 flex flex-col transition-transform duration-300 ease-in-out
            w-64
            /* Desktop: Arriba del todo. Móvil: Debajo del header */
            top-0 lg:top-0 
            pt-16 lg:pt-0 
            ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>

            {/* Perfil de Clínica: Solo visible en Desktop para no duplicar espacio en móvil */}
            <div className="hidden lg:flex h-24 items-center px-6 border-b border-zinc-50 bg-zinc-50/30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-100 border border-zinc-200 rounded-lg flex items-center justify-center">
                        <Building2 size={20} className="text-zinc-500" />
                    </div>
                    <div className="flex flex-col items-start min-w-0">
                        <h1 className="text-sm font-bold tracking-tight text-zinc-900 truncate">
                            {clinic?.nombre || 'SCAB Clinic'}
                        </h1>
                        <span className="bg-gradient-to-b px-1 from-cyan-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent border border-indigo-300 rounded-full text-[7px] font-extrabold uppercase">
                            SCAB CLINIC
                        </span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                <p className="px-2 mb-4 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                    Menú Principal
                </p>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={closeMobileMenu}
                            className={`
                                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group
                                ${isActive
                                    ? 'bg-zinc-100 text-zinc-900 font-semibold'
                                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}
                            `}
                        >
                            <item.icon
                                size={18}
                                className={`${isActive ? 'text-zinc-900' : 'text-zinc-400 group-hover:text-zinc-900'}`}
                            />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
                <div className="flex flex-col gap-1">
                    <button className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors w-full rounded-md hover:bg-zinc-100">
                        <Settings size={16} />
                        Configuración
                    </button>

                    <button
                        onClick={() => logoutAction()}
                        className="mt-4 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-colors gap-5 px-3 py-3 bg-white border border-zinc-200 rounded-lg"
                    >
                        <span className="text-xs font-medium">Cerrar sesión</span>
                        <LogOut size={14} />
                    </button>
                </div>
            </div>
        </aside>
    )
}