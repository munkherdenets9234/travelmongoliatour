import type { ApplicationValues } from './validate.mjs'

export interface LanguageRow {
  level: string
  other_name: string
}

export interface ReferenceRow {
  name: string
  position: string
  contact: string
}

export interface GuideState {
  personal: {
    full_name: string
    nickname: string
    birth_date: string
    gender: string
    phone: string
    email: string
    address: string
    emergency_name: string
    emergency_phone: string
  }
  languages: Record<string, LanguageRow>
  experience: {
    years: string
    previous_companies: string
    main_directions: string
    largest_group: string
    tour_types: string[]
  }
  regions: string[]
  regions_other: string
  driving: {
    has_license: boolean | null
    license_class: string
    years_driving: string
    vehicles: string
    can_drive_4x4: boolean
    long_distance: boolean
    has_own_vehicle: boolean
  }
  availability: {
    months: number[]
    days: string
    trip_lengths: string[]
    full_season: boolean
    booked_trips: string
  }
  references: ReferenceRow[]
  consent: boolean
}

export type FilesByKind = Record<string, File[]>

export function emptyState(): GuideState
/** Form state to the validateApplication / backend shape (consent still boolean). */
export function buildPayload(state: GuideState, locale: string): ApplicationValues
/** Hand-built multipart body: data, website (always), and file parts only for chosen files. */
export function buildSubmitForm(
  payload: ApplicationValues,
  filesByKind: FilesByKind | null | undefined,
  website?: string,
  now?: Date,
): FormData
export type ErrorCode =
  | 'duplicate'
  | 'generic'
  | 'file_unreadable'
  | 'too_large'
  | 'rate_limited'
  | 'unavailable'
/** Maps a failed HTTP status to an errors.<code> key and a form key ('' = form level). */
export function mapSubmitFailure(
  status: number,
  fieldHint?: unknown,
): { code: ErrorCode; field: string }
