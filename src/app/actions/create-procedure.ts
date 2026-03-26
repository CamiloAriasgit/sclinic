"use server";

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createProcedureAction(data: {
  paciente_id: string;
  servicio_id: string;
  insumos: { insumo_id: string; cantidad_consumo: number }[];
}) {
  const supabase = await createClient();
  
  // 1. Obtener el usuario autenticado (Indispensable para auditoría)
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    console.error("❌ Error de autenticación:", authError?.message);
    return { success: false, error: "Debes estar autenticado para registrar procedimientos." };
  }

  console.log("🚀 Procesando procedimiento para paciente:", data.paciente_id);
  console.log("👤 Usuario responsable:", user.id);

  try {
    for (const item of data.insumos) {
      // Validación de ID de insumo
      if (!item.insumo_id) {
        return { success: false, error: "Se detectó un insumo sin ID válido." };
      }

      // 2. Buscar lote disponible (Estrategia FIFO: el primero en vencerse)
      const { data: lote, error: loteErr } = await supabase
        .from('lotes')
        .select('id, cantidad_actual')
        .eq('insumo_id', item.insumo_id)
        .gt('cantidad_actual', 0)
        .order('fecha_vencimiento', { ascending: true })
        .limit(1)
        .single();

      if (loteErr || !lote) {
        console.error(`❌ Sin stock para insumo ${item.insumo_id}:`, loteErr?.message);
        return { success: false, error: `No hay stock disponible para uno de los insumos seleccionados.` };
      }

      if (lote.cantidad_actual < item.cantidad_consumo) {
        return { success: false, error: `Stock insuficiente en el lote más próximo a vencer.` };
      }

      // 3. Descontar cantidad del lote
      const { error: updateError } = await supabase
        .from('lotes')
        .update({ cantidad_actual: lote.cantidad_actual - item.cantidad_consumo })
        .eq('id', lote.id);

      if (updateError) {
        console.error("❌ Error al actualizar stock:", updateError.message);
        throw new Error("Error técnico al actualizar el inventario.");
      }

      // 4. Registrar en historial_procedimientos
      // IMPORTANTE: Se incluye usuario_id para cumplir con la Relación de la DB
      const { error: insertError } = await supabase
        .from('historial_procedimientos')
        .insert({
          paciente_id: data.paciente_id,
          servicio_id: data.servicio_id,
          lote_id: lote.id,
          usuario_id: user.id, // ID del usuario de la sesión actual
          cantidad_usada: item.cantidad_consumo,
          fecha_procedimiento: new Date().toISOString()
        });

      if (insertError) {
        console.error("❌ Error detallado en Insert:", insertError);
        throw new Error("Fallo al registrar la actividad en el historial.");
      }
    }

    // 5. Revalidar rutas para actualizar la UI
    revalidatePath('/inventory');
    revalidatePath('/auditoria');
    
    return { success: true };

  } catch (error: any) {
    console.error("❌ Error crítico en createProcedureAction:", error.message);
    return { success: false, error: error.message };
  }
}