export const MAX_FILE_BYTES: number
export const MAX_FILES: number
export const MAX_TEXT: number
export const MAX_REFERENCES: number
export const MIN_AGE: number
export const MAX_NUMBER: number
export const ALLOWED_FILE_EXTENSIONS: readonly string[]
export const FILE_KINDS: readonly string[]
export const FILE_KIND_LIMITS: Readonly<Record<string, number>>
export const GENDERS: readonly string[]
export const LOCALES: readonly string[]
export const REGIONS: readonly string[]
export const TOUR_TYPES: readonly string[]
export const TRIP_LENGTHS: readonly string[]
export const LANGUAGE_CODES: readonly string[]
export const LANGUAGE_LEVELS_MN: readonly string[]
export const LANGUAGE_LEVELS_OTHER: readonly string[]
export const DRIVING_FIELDS: readonly string[]

export type ErrorCode =
  | 'required'
  | 'invalid_email'
  | 'invalid_phone'
  | 'under_18'
  | 'invalid_choice'
  | 'too_long'
  | 'too_many'
  | 'file_type'
  | 'file_size'
  | 'file_count'
  | 'duplicate_kind'

export interface ApplicationFile {
  kind: string
  name: string
  size: number
  type: string
}

export interface ApplicationValues {
  locale?: string
  consent?: boolean
  personal?: {
    full_name?: string
    nickname?: string
    birth_date?: string
    gender?: string
    phone?: string
    email?: string
    address?: string
    emergency_contact?: { name?: string; phone?: string }
  }
  languages?: Array<{ language?: string; other_name?: string; level?: string }>
  experience?: {
    years?: number
    previous_companies?: string
    tour_types?: string[]
    main_directions?: string
    largest_group?: number
  }
  regions?: string[]
  regions_other?: string
  driving?: {
    has_license?: boolean
    license_class?: string
    years_driving?: number
    can_drive_4x4?: boolean
    long_distance?: boolean
    has_own_vehicle?: boolean
    vehicles?: string
  }
  availability?: {
    months?: number[]
    days?: string
    trip_lengths?: string[]
    full_season?: boolean
    booked_trips?: string
  }
  references?: Array<{ name?: string; position?: string; contact?: string }>
}

export interface ValidationResult {
  ok: boolean
  errors: Record<string, ErrorCode>
}

/**
 * Error keys are form-model paths (e.g. personal.email, files.cv), values are
 * message key codes. `now` defaults to the current time; an invalid Date throws
 * a TypeError.
 */
export function validateApplication(
  values: ApplicationValues | null | undefined,
  files: Array<ApplicationFile | null | undefined> | null | undefined,
  now?: Date,
): ValidationResult
/** Maps a backend field name (e.g. full_name, consent_at) onto the form key. Non-strings give ''. */
export function normalizeServerField(hint: unknown): string
export function visibleDrivingFields(hasLicense: boolean | undefined | null): string[]
