export type WaterEntry = {
  id: string
  date: string // 'YYYY-MM-DD'
  amountMl: number
  createdAt: string
}

export type WaterTrendPoint = {
  date: string
  consumed: number // ml
  target: number // ml
}
