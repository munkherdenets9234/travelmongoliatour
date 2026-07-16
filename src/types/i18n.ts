export type Locale = 'en' | 'mn' | 'ko'

export interface NavT {
  tours: string
  aboutMongolia: string
  airport: string
  carRental: string
  journal: string
  partners: string
  reviews: string
  about: string
  share: string
  contact: string
  bookCta: string
}

export interface JourneyItem {
  id: string
  days: number
  title: string
  description: string
  badge: string
  rating: number
  image: string
}

export interface MapDestination {
  id: string
  name: string
  subtitle: string
  x: number
  y: number
}

export interface WhyItem {
  icon: string
  title: string
  description: string
}

export interface ArticleItem {
  id: string
  category: string
  title: string
  read_time: number
  image: string
}

export interface ChipLabel {
  label: string
}

export interface StatItem {
  value: string
  label: string
}

export interface ValueItem {
  title: string
  text: string
}

export interface SectionLabel {
  id: string
  label: string
}

export interface StepItem {
  n: string
  title: string
  text: string
}

export interface TierItem {
  name: string
  desc: string
  features: string[]
}

export interface OfficeItem {
  title: string
}

export interface Translation {
  meta: {
    title: string
    description: string
  }
  common: {
    read_more: string
    read_less: string
    save: string
    share: string
    close: string
    menu: string
    subscribe: string
    from: string
    per_person: string
    sending: string
    error_generic: string
    selected: string
    select: string
  }
  nav: NavT
  hero: {
    eyebrow: string
    title: string
    subtitle: string
    cta_explore: string
    cta_film: string
    scroll: string
  }
  search: {
    destination_label: string
    destination_placeholder: string
    duration_label: string
    duration_placeholder: string
    style_label: string
    style_placeholder: string
    cta: string
    destinations: string[]
    durations: string[]
    styles: string[]
  }
  journeys: {
    eyebrow: string
    title: string
    view_all: string
    days_label: string
    items: JourneyItem[]
  }
  tripadvisor: {
    description: string
  }
  partners: {
    eyebrow: string
    title: string
    cta: string
  }
  partnerDetail: {
    eyebrow: string
    offerings: string
    testimonialEyebrow: string
    ctaEyebrow: string
    ctaBook: string
  }
  map: {
    eyebrow: string
    title_line1: string
    title_line2: string
    title_italic: string
    description: string
    cta: string
    hover_hint: string
    destinations: MapDestination[]
  }
  why: {
    eyebrow: string
    items: WhyItem[]
  }
  reviews: {
    eyebrow: string
    title: string
    title_italic: string
    reviews_label: string
    cta: string
  }
  reviewsPage: {
    eyebrow: string
    travelers_label: string
    title_suffix: string
    reviews_label: string
    all_tours: string
    empty: string
    prev: string
    next: string
  }
  quote: {
    line1: string
    line2: string
    line3: string
    cta: string
  }
  journal: {
    eyebrow: string
    view_all: string
    items: ArticleItem[]
    read_label: string
  }
  footer: {
    tagline: string
    exploreHeading: string
    companyHeading: string
    links: Record<string, string>
    newsletter: {
      heading: string
      text: string
      placeholder: string
    }
    copyright: string
  }
  tourDetail: {
    breadcrumb_tours: string
    days_label: string
    nights_label: string
    max_travellers: string
    highlights: string
    good_to_know: string
    day_by_day: string
    day_label: string
    activities: string
    accommodation: string
    meals: string
    traveller_singular: string
    traveller_plural: string
    book_now: string
    or: string
    see_open_departures: string
    free_cancellation: string
    whats_included: string
    you_may_also_like: string
    view_all_tours: string
  }
  toursPage: {
    meta_title: string
    meta_description: string
    hero_eyebrow: string
    hero_title_prefix: string
    hero_title_italic: string
    hero_subtext: string
    journeys_found: string
    duration_chips: string[]
    region_chips: string[]
    type_chips: string[]
    sort_chips: string[]
    filters: string
    clear_all: string
    duration: string
    region: string
    trip_type: string
    empty: string
    cta_eyebrow: string
    cta_heading_prefix: string
    cta_heading_italic: string
    cta_button: string
  }
  journalPage: {
    meta_title: string
    meta_description: string
    hero_eyebrow: string
    hero_title_prefix: string
    hero_title_italic: string
    category_all: string
    categories: Record<string, string>
    featured_prefix: string
    read_article: string
    load_more: string
  }
  journalDetail: {
    share: string
    save: string
    cta_eyebrow: string
    cta_heading_prefix: string
    cta_heading_italic: string
    browse_tours: string
    keep_reading: string
  }
  bookPage: {
    meta_title: string
    meta_description: string
    step_trip: string
    step_traveller: string
    step_payment: string
    heading_prefix: string
    heading_italic: string
  }
  bookingForm: {
    no_tours: string
    success_heading: string
    confirmation_label: string
    success_message_prefix: string
    success_message_suffix: string
    section1: string
    tour_label: string
    date_label: string
    travellers_label: string
    section2: string
    name_placeholder: string
    email_placeholder: string
    country_placeholder: string
    phone_placeholder: string
    section3: string
    section4: string
    notes_placeholder: string
    adult_singular: string
    adult_plural: string
    order_summary: string
    total: string
    deposit_label: string
    pay_deposit: string
    guest_checkout_note: string
  }
  shareATour: {
    meta_title: string
    meta_description: string
  }
  departureCalendar: {
    weekdays: string[]
    regions: string[]
    join_group_departure: string
    heading_prefix: string
    heading_italic: string
    prev_month: string
    next_month: string
    filter: string
    full: string
    open: string
    select_day: string
    no_departures: string
    departure_count_singular: string
    departure_count_plural: string
    from: string
    per_person: string
    fully_booked: string
    join_departure: string
    confirmed_note: string
    days_label: string
    small_group_of: string
    english_speaking_guide: string
  }
  about: {
    meta_title: string
    meta_description: string
    since_label: string
    heading_prefix: string
    heading_italic: string
    body1: string
    body2: string
    stats: StatItem[]
    beliefs_eyebrow: string
    beliefs_heading: string
    values: ValueItem[]
    credentials_heading: string
    credentials: string[]
  }
  aboutMongolia: {
    meta_title: string
    meta_description: string
    sections: SectionLabel[]
    facts: StatItem[]
    hero_eyebrow: string
    hero_heading_prefix: string
    hero_heading_italic: string
    hero_subtext: string
    geography_heading: string
    geography_body: string
    climate_heading: string
    climate_body: string
    history_heading: string
    history_body: string
    culture_heading: string
    culture_body: string
    culture_quote: string
    naadam_heading: string
    naadam_body: string
    ger_heading: string
    ger_body: string
    wildlife_heading: string
    wildlife_body: string
    cta_eyebrow: string
    cta_heading_prefix: string
    cta_heading_italic: string
    cta_button: string
  }
  airportTransfers: {
    meta_title: string
    meta_description: string
    hero_eyebrow: string
    hero_heading_prefix: string
    hero_heading_italic: string
    hero_subtext: string
    steps: StepItem[]
  }
  airportTransferForm: {
    flight_number: string
    flight_number_placeholder: string
    arrival_datetime: string
    passengers: string
    adult_suffix_singular: string
    adult_suffix_plural: string
    name: string
    name_placeholder: string
    email: string
    email_placeholder: string
    choose_service_eyebrow: string
    choose_service_heading: string
    tiers: TierItem[]
    most_popular: string
    per_vehicle: string
    book_transfer: string
    success_heading: string
    confirmation_label: string
    success_message: string
  }
  rentACar: {
    meta_title: string
    meta_description: string
    hero_eyebrow: string
    hero_heading_prefix: string
    hero_heading_italic: string
    hero_subtext: string
    with_driver: string
    self_drive: string
    all_vehicles: string
    type_chips: string[]
    need_fleet_heading: string
    need_fleet_text: string
    ask_us: string
    insurance_note: string
    roadside_note: string
    camping_note: string
  }
  carCard: {
    per_day: string
    reserve: string
  }
  carSearchRail: {
    pickup_date: string
    return_date: string
  }
  reservationDialog: {
    success_heading: string
    confirmation_label: string
    success_message_prefix: string
    success_message_suffix: string
    reserve_eyebrow: string
    confirm_reservation: string
    name_placeholder: string
    email_placeholder: string
    phone_placeholder: string
  }
  contact: {
    meta_title: string
    meta_description: string
    eyebrow: string
    heading_prefix: string
    heading_italic: string
    subtext: string
    offices: OfficeItem[]
    map_title: string
  }
  contactForm: {
    name_placeholder: string
    email_placeholder: string
    phone_placeholder: string
    subjects: string[]
    message_placeholder: string
    send_message: string
    success_heading: string
    reference_label: string
    success_message: string
  }
  tourGallery: {
    open_preview: string
    previous_photo: string
    next_photo: string
    view_photo: string
    close_preview: string
  }
  sectionNav: {
    on_this_page: string
  }
}
