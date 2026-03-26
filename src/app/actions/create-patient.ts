// src/app/actions/create-patient.ts
"use server";
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createPatientQuickAction(nombre: string, documento: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('pacientes')
    .insert([{ 
      nombre_completo: nombre, 
      numero_documento: documento 
    }])
    .select()
    .single();

  if (error) {
    console.error("❌ Error Supabase Pacientes:", error.message);
    return { success: false, error: error.message };
  }

  // Esto es vital para que el buscador vea al nuevo paciente de inmediato
  revalidatePath('/operation');
  
  return { success: true, data };
}