export type ComponentType = 'troca' | 'upgrade' | 'revisao' | 'reparo'

export interface Car {
  id: string
  user_id: string
  brand: string
  model: string
  year: number
  nickname?: string
  created_at: string
}

export interface Component {
  id: string
  car_id: string
  user_id: string
  name: string
  type: ComponentType
  date: string
  mileage?: number
  notes?: string
  next_due_type?: 'km' | 'months' | null
  next_due_value?: number | null
  created_at: string
}