// src/app/actions/get-patients.ts
"use server";
import { createClient } from '@/utils/supabase/server';

export async function getPatientsAction(query: string) {
  const supabase = await createClient();

  // Buscamos coincidencia en nombre o documento
  const { data, error } = await supabase
    .from('pacientes')
    .select('id, nombre_completo, numero_documento')
    .or(`nombre_completo.ilike.%${query}%,numero_documento.ilike.%${query}%`)
    .limit(5); // Limitamos para un dropdown rápido

  if (error) return [];
  return data;
}