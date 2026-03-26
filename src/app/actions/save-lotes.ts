"use server";

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function saveLotesAction(lotesDesdeIA: any[]) {
    const supabase = await createClient();

    try {
        const resultadosFinales = [];
        const nuevosInsumosNombres = [];

        for (const item of lotesDesdeIA) {
            // 1. Intentar buscar el insumo existente
            let { data: insumo, error: searchError } = await supabase
                .from('insumos')
                .select('id')
                .ilike('nombre', `%${item.producto_nombre}%`)
                .maybeSingle();

            let insumoId = insumo?.id;

            // 2. Si NO existe, lo creamos de una vez
            if (!insumoId) {
                console.log(`✨ Creando nuevo insumo: ${item.producto_nombre}`);

                const { data: nuevoInsumo, error: createError } = await supabase
                    .from('insumos')
                    .insert({
                        nombre: item.producto_nombre,
                        marca: "Escaneado", // <-- Esto evita el error de la columna 'marca'
                        unidad_medida: 'vial',
                        stock_minimo: 1,
                        // Usamos el ID de categoría que me mostraste antes para que no quede huérfano
                        categoria_id: "1ef35958-f0f2-4132-81a5-61b934790285"
                    })
                    .select()
                    .single();

                if (createError) {
                    console.error("❌ Error real al crear:", createError.message);
                    continue;
                }
                insumoId = nuevoInsumo.id;
                nuevosInsumosNombres.push(item.producto_nombre);
            }

            // 3. Preparar el lote con el ID (existente o nuevo)
            resultadosFinales.push({
                insumo_id: insumoId,
                numero_lote: item.lote_numero,
                fecha_vencimiento: item.fecha_vencimiento,
                cantidad_inicial: item.cantidad,
                cantidad_actual: item.cantidad,
                precio_compra_unidad: item.precio_compra
            });
        }

        // 4. Inserción masiva de lotes
        const { error: insertError } = await supabase
            .from('lotes')
            .insert(resultadosFinales);

        if (insertError) throw insertError;

        revalidatePath('/');

        // Devolvemos si hubo insumos nuevos para informar al usuario
        return {
            success: true,
            nuevosInsumos: nuevosInsumosNombres
        };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}