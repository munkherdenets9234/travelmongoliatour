import { siteUrl } from './i18n'
import type { Tour } from './data/tours'

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: 'E and S Discovery Mongolia',
    url: siteUrl,
    logo: `${siteUrl}/images/logo.png`,
    image: `${siteUrl}/images/logo.png`,
    description:
      'Mongolian-owned and staffed tour operator running small-group and tailor-made journeys across Mongolia since 2009.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Seoul Street',
      addressLocality: 'Ulaanbaatar',
      addressCountry: 'MN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+976-9400-6739',
      email: 'info@travel-mongolia-tour.com',
      contactType: 'customer service',
    },
  }
}

export function tourSchema(tour: Tour, locale: string) {
  const url = `${siteUrl}/${locale}/tours/${tour.slug}`
  const images = (tour.gallery.length > 0 ? tour.gallery : [tour.image]).filter(Boolean)

  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: tour.title,
    description: tour.summary,
    url,
    image: images,
    touristType: tour.type,
    itinerary: {
      '@type': 'ItemList',
      itemListElement: tour.itinerary.map((day) => ({
        '@type': 'ListItem',
        position: day.day,
        item: {
          '@type': 'TouristAttraction',
          name: day.title,
          description: day.description,
        },
      })),
    },
    offers: {
      '@type': 'Offer',
      price: tour.price,
      priceCurrency: 'USD',
      url,
      availability: 'https://schema.org/InStock',
    },
    provider: {
      '@type': 'TravelAgency',
      name: 'E and S Discovery Mongolia',
      url: siteUrl,
    },
  }
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
