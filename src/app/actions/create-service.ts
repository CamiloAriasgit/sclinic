"use server";
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createServiceAction(formData: {
  nombre: string;
  precio: number;
  insumos: { insumo_id: string; cantidad: number }[];
}) {
  const supabase = await createClient();

  // 1. Insertamos en 'servicios' usando el nombre correcto: 'precio_venta'
  const { data: service, error: sError } = await supabase
    .from('servicios')
    .insert([{ 
      nombre: formData.nombre, 
      precio_venta: formData.precio // <--- CAMBIO AQUÍ
    }])
    .select()
    .single();

  if (sError) return { success: false, error: sError.message };

  // 2. Insertamos en 'servicio_insumos' usando: 'cantidad_consumo'
  if (formData.insumos.length > 0) {
    const relations = formData.insumos.map(ins => ({
      servicio_id: service.id,
      insumo_id: ins.insumo_id,
      cantidad_consumo: ins.cantidad // <--- CAMBIO AQUÍ
    }));

    const { error: rError } = await supabase
      .from('servicio_insumos')
      .insert(relations);

    if (rError) return { success: false, error: rError.message };
  }

  revalidatePath('/protocols');
  return { success: true };
}