import { supabase } from './client'
import type { Component } from './types'

export async function getComponents(carId: string): Promise<Component[]> {
  const { data, error } = await supabase
    .from('components')
    .select('*')
    .eq('car_id', carId)
    .order('date', { ascending: false })
  if (error) throw error
  return data
}

export async function createComponent(component: Omit<Component, 'id' | 'user_id' | 'created_at'>): Promise<Component> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuário não autenticado')
  const { data, error } = await supabase
    .from('components')
    .insert({ ...component, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateComponent(id: string, component: Partial<Component>): Promise<Component> {
  const { data, error } = await supabase
    .from('components')
    .update(component)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteComponent(id: string): Promise<void> {
  const { error } = await supabase
    .from('components')
    .delete()
    .eq('id', id)
  if (error) throw error
}