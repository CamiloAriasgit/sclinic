// src/app/actions/get-audit-logs.ts
"use server";
import { createClient } from '@/utils/supabase/server';

export async function getAuditLogsAction() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('historial_procedimientos')
      .select(`
        id,
        fecha_procedimiento,
        cantidad_usada,
        pacientes!inner(nombre_completo),
        servicios!inner(nombre),
        lotes!inner(
          numero_lote, 
          insumos!inner(nombre, marca)
        )
      `)
      .order('fecha_procedimiento', { ascending: false })
      .limit(50);

    // Si Supabase responde con un error de base de datos
    if (error) {
      console.error("Error de DB:", error.message);
      return [];
    }

    return data || [];
    
  } catch (err) {
    // Si falla la conexión (el 'fetch failed' que ves)
    console.error("Error de conexión:", err);
    return []; 
  }
}