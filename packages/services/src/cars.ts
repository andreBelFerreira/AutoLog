import { supabase } from './client'
import type { Car } from './types'

export async function getCars(): Promise<Car[]> {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createCar(car: Omit<Car, 'id' | 'user_id' | 'created_at'>): Promise<Car> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuário não autenticado')
  const { data, error } = await supabase
    .from('cars')
    .insert({ ...car, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCar(id: string, car: Partial<Car>): Promise<Car> {
  const { data, error } = await supabase
    .from('cars')
    .update(car)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCar(id: string): Promise<void> {
  const { error } = await supabase
    .from('cars')
    .delete()
    .eq('id', id)
  if (error) throw error
}