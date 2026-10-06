export type RentalMode = 'with-driver' | 'self-drive'
export interface ModeCar { rentalModes?: string[] }
export interface BoundsCar { selfDriveFrom?: string; selfDriveTo?: string }
export interface DateBounds { min?: string; max?: string }

export function modesOf(car: ModeCar): string[]
export function supportsMode(car: ModeCar, mode: string): boolean
export function pickMode(requested: string | undefined, cars: ModeCar[]): RentalMode
export function dateBounds(car: BoundsCar, mode: string): DateBounds
export function withinBounds(bounds: DateBounds, pickup: string, ret: string): boolean
