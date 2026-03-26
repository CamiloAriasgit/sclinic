"use client"; // Convertimos a Client Component para manejar el estado del error

import { loginAction } from '@/app/actions/auth';
import { Activity } from 'lucide-react';
import { useActionState } from 'react';

export default function LoginPage({
  searchParams,
}: {
  searchParams: any; // Next 15 maneja esto como promesa, pero para el renderizado simple basta así
}) {
  // useActionState recibe la función, el estado inicial, y devuelve [estado, formAction, isPending]
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-xl">
            <Activity size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            SCAB<span className="text-zinc-400 font-medium">Clinic</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Ingresa al protocolo de gestión clínica.
          </p>
        </div>

        {/* Usamos formAction que viene del hook */}
        <form action={formAction} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-1">
              Correo Electrónico
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              placeholder="nombre@clinica.com"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-1">
              Contraseña
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              placeholder="••••••••"
            />
          </div>

          {/* Error que viene del Server Action */}
          {state?.error && (
            <p className="text-center text-xs text-red-500 font-medium bg-red-50 py-2 rounded-lg border border-red-100">
              {state.error}
            </p>
          )}

          <button 
            disabled={isPending}
            className="w-full rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-white transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending ? "Validando..." : "Iniciar Sesión"}
          </button>
        </form>

        <p className="text-center text-[10px] text-zinc-400">
          SCAB Systems © 2026 • Acceso Restringido
        </p>
      </div>
    </div>
  );
}