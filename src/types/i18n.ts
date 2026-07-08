export type Locale = 'en' | 'mn'

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

export interface Translation {
  meta: {
    title: string
    description: string
  }
  common: {
    read_more: string
    read_less: string
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
}
