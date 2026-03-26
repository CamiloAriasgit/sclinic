"use server";
import { createClient } from '@/utils/supabase/server';
import { unstable_noStore as noStore } from 'next/cache'; // Añade esto

// src/app/actions/get-inventory.ts
export async function getInventoryAction() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('lotes')
    .select(`
      id,
      numero_lote,
      fecha_vencimiento,
      cantidad_actual,
      precio_compra_unidad,
      insumos (*)
    `)
    .order('fecha_vencimiento', { ascending: true });

  if (error) return [];
  return data;
}