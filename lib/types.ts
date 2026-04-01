export interface Memory {
  id: string
  countryCode: string
  countryName: string
  description: string
  images: string[]
  createdAt: string
  updatedAt: string
}

export interface Country {
  code: string
  name: string
  flag: string
}

export type TabType = 'countries' | 'regions' | 'cities'
