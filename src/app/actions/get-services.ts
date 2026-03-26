"use server";
import { createClient } from '@/utils/supabase/server';

// src/app/actions/get-services.ts
// src/app/actions/get-services.ts
// src/app/actions/get-services.ts
export async function getServicesAction() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('servicios')
    .select(`
      *,
      servicio_insumos (
        insumo_id,
        cantidad_consumo,
        insumos (
          nombre,
          marca,
          lotes (
            id,
            cantidad_actual,
            numero_lote
          )
        )
      )
    `);

  if (error) {
    console.error("Error en Supabase:", error);
    return [];
  }
  return data;
}