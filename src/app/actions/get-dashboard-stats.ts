"use server"

import { createClient } from '@/utils/supabase/server'
import { startOfDay, endOfDay } from 'date-fns'

export async function getDashboardStatsAction() {
  const supabase = await createClient()
  
  // 1. Obtener el usuario y su clínica
  const { data: { user } } = await supabase.auth.getUser()
  const orgId = user?.app_metadata?.organizacion_id

  if (!orgId) return { ingresosHoy: 0, procedimientosHoy: 0, alertas: [], saludStock: 0 }

  const hoyInicio = startOfDay(new Date()).toISOString()
  const hoyFin = endOfDay(new Date()).toISOString()

  // 2. Ingresos y Procedimientos de HOY
  const { data: procedimientos } = await supabase
    .from('historial_procedimientos')
    .select('servicios(precio)')
    .eq('organizacion_id', orgId)
    .gte('fecha_procedimiento', hoyInicio)
    .lte('fecha_procedimiento', hoyFin)

  const ingresosHoy = procedimientos?.reduce((acc, curr: any) => acc + (curr.servicios?.precio || 0), 0) || 0
  const totalProcedimientos = procedimientos?.length || 0

  // 3. Alertas de Stock (Insumos con cantidad menor a 5)
  const { data: alertas } = await supabase
    .from('lotes')
    .select(`
      cantidad_actual,
      insumos (
        nombre,
        marca
      )
    `)
    .eq('organizacion_id', orgId)
    .lt('cantidad_actual', 5)
    .limit(4)

  return {
    ingresosHoy,
    procedimientosHoy: totalProcedimientos,
    alertas: alertas || [],
    saludStock: 92 // Este puede ser un cálculo dinámico más adelante
  }
}