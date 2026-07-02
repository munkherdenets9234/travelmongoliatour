// Placeholder/mock data seeded from the hi-fi design. Swap for a real backend later.

export interface TourItinerary {
  day: number
  title: string
  description: string
}

export interface TourInclusion {
  title: string
  description: string
}

export interface Tour {
  slug: string
  title: string
  region: 'gobi' | 'central' | 'north' | 'west'
  type: 'cultural' | 'adventure' | 'festival' | 'group'
  days: number
  nights: number
  price: number
  rating: number
  maxTravellers: number
  image: string
  gallery: string[]
  badge?: string
  summary: string
  description: string
  highlights: string[]
  goodToKnow: string[]
  itinerary: TourItinerary[]
  inclusions: TourInclusion[]
  guide: { name: string; note: string }
}

export const tours: Tour[] = [
  {
    slug: 'gobi-desert-expedition',
    title: 'Gobi Desert Expedition',
    region: 'gobi',
    type: 'adventure',
    days: 8,
    nights: 7,
    price: 1290,
    rating: 4.9,
    maxTravellers: 8,
    image: '/images/gobi.jpg',
    gallery: ['/images/gobi.jpg', '/images/tsagaan-suvarga-1.webp', '/images/tsagaan-suvarga-2.webp'],
    summary: 'Singing dunes, flaming cliffs and nomad gers across the great southern desert.',
    description:
      "Cross the great southern desert on an eight-day private expedition — from the singing dunes of Khongoryn Els to the flaming cliffs of Bayanzag, where the first dinosaur eggs were found. Nights are spent in nomad-run ger camps under some of the darkest skies on earth.",
    highlights: [
      'Khongoryn Els singing dunes',
      'Bayanzag flaming cliffs',
      'Yolyn Am ice canyon',
      'Two nights with a herder family',
    ],
    goodToKnow: ['Best season · May–September', 'Difficulty · Moderate', 'Private guide + 4×4 driver', 'Domestic flight included'],
    itinerary: [
      { day: 1, title: 'Ulaanbaatar → Middle Gobi', description: 'Fly south and drive to the white stupas of Tsagaan Suvarga. First night in a ger camp on the open steppe.' },
      { day: 2, title: 'Yolyn Am ice canyon', description: 'Hike the deep gorge where ice lingers into summer, watched over by lammergeier vultures.' },
      { day: 3, title: 'Khongoryn Els dunes', description: 'Climb the towering sand dunes at sunset and ride camels with a local herder family.' },
      { day: 4, title: 'Bayanzag flaming cliffs', description: 'Explore the red sandstone cliffs where the first dinosaur eggs were discovered.' },
      { day: 5, title: 'Herder family homestay', description: 'Spend the day with a nomadic family, learning traditional dairy and herding work.' },
      { day: 6, title: 'Ongi monastery ruins', description: 'Visit the ruins of a once-great monastery on the banks of the Ongi river.' },
      { day: 7, title: 'Baga Gazriin Chuluu', description: 'Explore the granite rock formations and hidden springs of the central Gobi.' },
      { day: 8, title: 'Return to Ulaanbaatar', description: 'Domestic flight back to the capital.' },
    ],
    inclusions: [
      { title: 'Private 4×4 & driver', description: 'Land Cruiser with an experienced desert driver throughout.' },
      { title: 'Ger camp stays', description: 'All accommodation in nomad-run camps and one night with a family.' },
      { title: 'All meals', description: 'Full board with vegetarian and dietary options on request.' },
      { title: 'Domestic flight', description: 'Return flight Ulaanbaatar–Gobi to maximise your time.' },
    ],
    guide: { name: 'Bat-Erdene', note: '15 years across the Gobi' },
  },
  {
    slug: 'naadam-festival',
    title: 'Naadam Festival',
    region: 'central',
    type: 'festival',
    days: 5,
    nights: 4,
    price: 980,
    rating: 5.0,
    maxTravellers: 8,
    image: '/images/naadam-1.jpg',
    gallery: ['/images/naadam-1.jpg', '/images/naadam-2.jpg', '/images/naadam-3.jpg'],
    summary: 'The three manly games — wrestling, archery and horse racing — from the front row.',
    description:
      "Held every July, Naadam is Mongolia's great national celebration — the 'three manly games' of wrestling, archery and horse racing, staged across the country and centred on Ulaanbaatar. This five-day departure puts you in the thick of it, with front-row seats to the opening ceremony and a countryside detour to see the games as locals do.",
    highlights: ['Opening ceremony at the National Stadium', 'Wrestling & archery front-row seats', 'Countryside horse racing', 'Traditional deel fitting'],
    goodToKnow: ['Runs · July 11–15 only', 'Difficulty · Easy', 'Small group of 8', 'English-speaking guide'],
    itinerary: [
      { day: 1, title: 'Arrival & opening ceremony', description: 'Settle in Ulaanbaatar and watch the spectacular Naadam opening ceremony.' },
      { day: 2, title: 'Wrestling & archery', description: 'A full day at the National Stadium for wrestling bouts and traditional archery.' },
      { day: 3, title: 'Countryside horse racing', description: 'Drive to the steppe to watch child jockeys race across the open grassland.' },
      { day: 4, title: 'Nomad camp visit', description: 'Meet a local herding family and taste traditional Naadam-season dairy.' },
      { day: 5, title: 'Departure', description: 'Free morning before your onward flight.' },
    ],
    inclusions: [
      { title: 'Reserved stadium seats', description: 'Guaranteed seating for the opening ceremony and wrestling finals.' },
      { title: 'Private vehicle & guide', description: 'English-speaking guide throughout the festival.' },
      { title: 'All meals', description: 'Full board including a traditional Naadam feast.' },
      { title: 'Countryside excursion', description: 'A day trip beyond the capital to see rural Naadam traditions.' },
    ],
    guide: { name: 'Saraa B.', note: 'Lead festival guide' },
  },
  {
    slug: 'eagle-hunters-of-the-altai',
    title: 'Eagle Hunters of the Altai',
    region: 'west',
    type: 'cultural',
    days: 10,
    nights: 9,
    price: 1750,
    rating: 5.0,
    maxTravellers: 6,
    image: '/images/kazakh-eagle-hunter.jpg',
    gallery: ['/images/kazakh-eagle-hunter.jpg'],
    summary: 'Ride with Kazakh eagle hunters through the snow-dusted peaks of the far west.',
    description:
      'Journey to Bayan-Ölgii in the far west to live alongside Kazakh eagle hunters — a centuries-old tradition of hunting with golden eagles from horseback. Ten days among snow-dusted peaks, ger stays with hunting families, and (season permitting) a chance to witness the Golden Eagle Festival.',
    highlights: ['Live with an eagle hunter family', 'Horseback riding in the Altai', 'Golden Eagle Festival (seasonal)', 'Kazakh cultural traditions'],
    goodToKnow: ['Best season · September–October', 'Difficulty · Moderate–hard', 'Domestic flight included', 'Cold-weather gear needed'],
    itinerary: [
      { day: 1, title: 'Ulaanbaatar → Ölgii', description: 'Domestic flight to the far-western province of Bayan-Ölgii.' },
      { day: 2, title: 'Meet the eagle hunters', description: 'Drive into the mountains to meet a Kazakh eagle hunting family.' },
      { day: 3, title: 'Hunting demonstration', description: 'Watch a traditional eagle hunting demonstration on horseback.' },
      { day: 4, title: 'Altai horseback trek', description: 'Ride through the snow-dusted peaks of the Altai range.' },
      { day: 5, title: 'Kazakh ger stay', description: 'A full day and night living with the hunting family.' },
    ],
    inclusions: [
      { title: 'Domestic flight', description: 'Return flight Ulaanbaatar–Ölgii.' },
      { title: 'Homestay with a hunting family', description: 'Authentic ger accommodation with a Kazakh eagle hunter family.' },
      { title: 'Horses & guide', description: 'Horseback riding with an experienced local guide.' },
      { title: 'All meals', description: 'Traditional Kazakh cuisine throughout.' },
    ],
    guide: { name: 'Nurlan K.', note: 'Kazakh cultural guide, Bayan-Ölgii native' },
  },
  {
    slug: 'khuvsgul-lake-and-reindeer',
    title: 'Khövsgöl Lake & Reindeer',
    region: 'north',
    type: 'cultural',
    days: 7,
    nights: 6,
    price: 1120,
    rating: 4.8,
    maxTravellers: 8,
    image: '/images/rendeer.jpg',
    gallery: ['/images/rendeer.jpg'],
    summary: 'The blue pearl of Mongolia and the Tsaatan reindeer herders of the taiga.',
    description:
      'Travel to the far north to Khövsgöl, the "blue pearl of Mongolia" — one of the deepest and clearest freshwater lakes in Asia — before heading into the taiga to meet the Tsaatan, Mongolia\'s last reindeer-herding people.',
    highlights: ['Khövsgöl Lake horseback ride', 'Tsaatan reindeer herder camp', 'Taiga forest trekking', 'Lakeside ger camp stay'],
    goodToKnow: ['Best season · June–September', 'Difficulty · Moderate', 'Private guide + driver', 'Reindeer camp access weather-dependent'],
    itinerary: [
      { day: 1, title: 'Ulaanbaatar → Mörön', description: 'Domestic flight to Mörön, gateway to Khövsgöl.' },
      { day: 2, title: 'Khövsgöl Lake', description: 'Drive to the lakeshore and settle into a ger camp.' },
      { day: 3, title: 'Horseback along the shore', description: 'A full day riding along the lake with a local guide.' },
      { day: 4, title: 'Into the taiga', description: 'Trek toward the reindeer herders\' summer camp.' },
      { day: 5, title: 'Tsaatan reindeer camp', description: 'A day with the Tsaatan, Mongolia\'s reindeer-herding people.' },
    ],
    inclusions: [
      { title: 'Domestic flight', description: 'Return flight Ulaanbaatar–Mörön.' },
      { title: 'Lakeside ger camp', description: 'Comfortable camp accommodation on Khövsgöl\'s shore.' },
      { title: 'Horses & guide', description: 'Horseback riding and taiga trekking with a local guide.' },
      { title: 'All meals', description: 'Full board throughout.' },
    ],
    guide: { name: 'Otgonbayar D.', note: 'Khövsgöl native, 12 years guiding' },
  },
  {
    slug: 'heartland-and-karakorum',
    title: 'Heartland & Karakorum',
    region: 'central',
    type: 'cultural',
    days: 6,
    nights: 5,
    price: 890,
    rating: 4.7,
    maxTravellers: 10,
    image: '/images/kharkhorin.jpg',
    gallery: ['/images/kharkhorin.jpg'],
    summary: 'Ancient capitals, monasteries and the gentle grasslands of the Orkhon valley.',
    description:
      'A gentle six-day introduction to Mongolia\'s heartland — the ancient capital of Karakorum, the working monastery of Erdene Zuu, and the soft grasslands of the Orkhon valley, a UNESCO World Heritage site.',
    highlights: ['Erdene Zuu monastery', 'Karakorum ancient capital ruins', 'Orkhon valley grasslands', 'Hot springs at Tsenkher'],
    goodToKnow: ['Best season · May–October', 'Difficulty · Easy', 'Private vehicle & guide', 'Good for first-time visitors'],
    itinerary: [
      { day: 1, title: 'Ulaanbaatar → Elsen Tasarhai', description: 'Drive out through the steppe, stopping at the mini-Gobi sand dunes.' },
      { day: 2, title: 'Karakorum & Erdene Zuu', description: 'Explore the ruins of the ancient Mongol capital and its working monastery.' },
      { day: 3, title: 'Orkhon valley', description: 'Drive through the UNESCO-listed Orkhon valley grasslands.' },
      { day: 4, title: 'Tsenkher hot springs', description: 'Relax at the natural hot springs of Tsenkher.' },
    ],
    inclusions: [
      { title: 'Private vehicle & driver', description: 'Comfortable van throughout the heartland loop.' },
      { title: 'Ger camp stays', description: 'Accommodation in local ger camps.' },
      { title: 'All meals', description: 'Full board throughout.' },
      { title: 'Entrance fees', description: 'All monastery and site entrance fees included.' },
    ],
    guide: { name: 'Munkh-Erdene T.', note: 'Central Mongolia specialist' },
  },
  {
    slug: 'horse-trekking-signature',
    title: 'Horse Trekking',
    region: 'gobi',
    type: 'adventure',
    days: 12,
    nights: 11,
    price: 2150,
    rating: 4.9,
    maxTravellers: 6,
    image: '/images/terelj.jpg',
    gallery: ['/images/terelj.jpg', '/images/elsen-tasarhai.jpeg'],
    badge: 'Signature',
    summary: 'Our flagship two-week traverse from the southern dunes to the central steppe.',
    description:
      'Our flagship expedition: a twelve-day traverse on horseback from the southern dunes of the Gobi to the open central steppe, camping wild and staying with herder families along the route. The definitive way to see Mongolia at the pace it was meant to be seen.',
    highlights: ['12 days in the saddle', 'Wild camping under open sky', 'Multiple herder-family stays', 'Traverse of two regions'],
    goodToKnow: ['Best season · June–September', 'Difficulty · Hard — riding experience required', 'Support vehicle accompanies the route', 'Max 6 riders'],
    itinerary: [
      { day: 1, title: 'Ulaanbaatar → Gobi start point', description: 'Fly south and meet the horses at the edge of the Gobi.' },
      { day: 2, title: 'Into the dunes', description: 'First day in the saddle, riding toward the singing dunes.' },
      { day: 3, title: 'Herder family camp', description: 'Overnight with a nomadic family on the desert\'s edge.' },
      { day: 4, title: 'Crossing the transition zone', description: 'Ride north as the Gobi gives way to steppe grassland.' },
    ],
    inclusions: [
      { title: 'Horses & wrangler', description: 'A dedicated horse and experienced wrangler for each rider.' },
      { title: 'Support vehicle', description: 'A 4×4 follows the route carrying camp gear and supplies.' },
      { title: 'Wild camping & homestays', description: 'A mix of tented camps and nights with herder families.' },
      { title: 'All meals', description: 'Full board throughout, cooked on the trail.' },
    ],
    guide: { name: 'Bat-Erdene', note: '15 years across the Gobi' },
  },
]

export interface TourFilters {
  duration?: string
  region?: string
  type?: string
  budgetMax?: number
  sort?: string
  page?: number
  pageSize?: number
}

export function getTours(filters: TourFilters = {}) {
  let results = [...tours]

  if (filters.region) results = results.filter((t) => t.region === filters.region)
  if (filters.type) results = results.filter((t) => t.type === filters.type)
  if (filters.duration) {
    results = results.filter((t) => {
      if (filters.duration === '1-5') return t.days <= 5
      if (filters.duration === '6-10') return t.days >= 6 && t.days <= 10
      if (filters.duration === '11+') return t.days >= 11
      return true
    })
  }
  if (filters.budgetMax) results = results.filter((t) => t.price <= filters.budgetMax!)

  if (filters.sort === 'price-low') results.sort((a, b) => a.price - b.price)
  else if (filters.sort === 'price-high') results.sort((a, b) => b.price - a.price)
  else if (filters.sort === 'duration') results.sort((a, b) => a.days - b.days)
  else results.sort((a, b) => b.rating - a.rating)

  const total = results.length
  const pageSize = filters.pageSize ?? 12
  const page = filters.page ?? 1
  const start = (page - 1) * pageSize
  const items = results.slice(start, start + pageSize)

  return { items, total, page, pageSize }
}

export function getTourBySlug(slug: string) {
  return tours.find((t) => t.slug === slug)
}

export function getRelatedTours(slug: string, count = 3) {
  return tours.filter((t) => t.slug !== slug).slice(0, count)
}
