export interface Memory {
  id: string
  countryCode: string
  countryName: string
  description: string
  images: string[]
  visitDate: string
  createdAt: string
  updatedAt: string
  rating: number
  mood: 'stressed' | 'happy' | 'excited' | 'tired'
  weather: 'sunny' | 'cloudy' | 'rainy' | 'windy' | 'snowy'
}

export interface Country {
  code: string
  name: string
  flag: string
}

export type TabType = 'countries' | 'regions' | 'cities'