export interface ProductInfo {
  slug: string
  name: string
  tagline: string
  status: 'live' | 'soon'
  href: string
}

export const PRODUCTS: ProductInfo[] = [
  {
    slug: 'dispatchsheets',
    name: 'Dispatch Sheets AI',
    tagline: 'AI rate con parser for Google Sheets',
    status: 'live',
    href: 'https://dispatchsheets.ai',
  },
  {
    slug: 'truckingsheets',
    name: 'Trucking Sheets AI',
    tagline: 'Fleet analytics from your dispatch sheet',
    status: 'live',
    href: '/',
  },
]
