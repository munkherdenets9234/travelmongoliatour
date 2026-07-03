// Backed by the DigitalService API's `/cars` resource — see src/lib/api/client.ts.
import { apiGet, ApiError } from '@/lib/api/client'

export interface Car {
  id?: string
  slug: string
  name: string
  type: string
  seats: number
  fuel: string
  pricePerDay: number
  image: string
  tags: string[]
}

interface BackendImage {
  url: string
  caption: string
}

interface BackendCar {
  id: string
  slug: string
  name: string
  type: string
  seats: number
  fuel: string
  price_per_day_usd: number
  tags: string[]
  cover_image: BackendImage
  images: BackendImage[]
  is_active: boolean
}

function mapCar(c: BackendCar): Car {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    type: c.type,
    seats: c.seats,
    fuel: c.fuel,
    pricePerDay: c.price_per_day_usd,
    image: c.cover_image?.url ?? '',
    tags: c.tags ?? [],
  }
}

export async function getAllCars(): Promise<Car[]> {
  const { data } = await apiGet<BackendCar[]>('/cars', { limit: 100 })
  // The Go backend serializes an empty result set as `null`, not `[]`.
  return (data ?? []).map(mapCar)
}

export interface CarFilters {
  type?: string
}

export async function getCars(filters: CarFilters = {}): Promise<Car[]> {
  const cars = await getAllCars()
  if (filters.type) return cars.filter((c) => c.type === filters.type)
  return cars
}

export async function getCarBySlug(slug: string): Promise<Car | undefined> {
  try {
    const { data } = await apiGet<BackendCar>(`/cars/${slug}`)
    return mapCar(data)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return undefined
    throw err
  }
}
