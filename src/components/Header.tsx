"use client"

import { useState } from 'react'
import { Bell, Search, Menu, X } from 'lucide-react'
import Sidebar from './Sidebar'

interface HeaderProps {
    userInitial: string;
    userEmail: string;
    clinic: { nombre: string } | null;
}

export default function Header({ userInitial, userEmail, clinic }: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <>
            <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white border-b border-zinc-200 z-[60]">
                <div className="h-full px-4 lg:px-6 flex items-center justify-between">
                    
                    <div className="flex items-center gap-4 flex-1">
                        {/* Botón Menú: Visible solo en móvil */}
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden p-2 hover:bg-zinc-50 rounded-lg text-zinc-600 transition-colors border border-zinc-100 shadow-sm"
                        >
                            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>

                        {/* Buscador */}
                        <div className="relative w-full max-w-[180px] md:max-w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                            <input 
                                type="text" 
                                placeholder="Buscar..."
                                className="w-full bg-zinc-50 border-none rounded-lg py-2 pl-9 pr-4 text-[11px] ring-1 ring-zinc-200 transition-all outline-none focus:ring-zinc-400"
                            />
                        </div>
                    </div>

                    {/* Lado Derecho */}
                    <div className="flex items-center gap-3">
                        <button className="relative p-2 text-zinc-400 hover:text-zinc-900 transition-colors hidden sm:block">
                            <Bell size={18} />
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
                        </button>

                        <div className="flex items-center gap-3 pl-3 border-l border-zinc-100">
                            <div className="text-right hidden md:flex flex-col justify-center">
                                <span className="text-xs font-semibold text-zinc-900 leading-none">
                                    {userEmail.split('@')[0]}
                                </span>
                                <span className="text-[10px] text-zinc-400 font-medium">En línea</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600">
                                {userInitial}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Inyectamos el Sidebar aquí para que el Header lo controle en móvil */}
            <Sidebar 
                clinic={clinic} 
                isMobileOpen={isMenuOpen} 
                closeMobileMenu={() => setIsMenuOpen(false)} 
            />

            {/* Overlay sutil al abrir menú */}
            {isMenuOpen && (
                <div 
                    className="fixed inset-0 bg-zinc-900/5 backdrop-blur-[1px] z-[45] lg:hidden"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}
        </>
    )
}