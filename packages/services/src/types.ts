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
  created_at: string
}
