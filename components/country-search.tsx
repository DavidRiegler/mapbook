'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { countries, searchCountries } from '@/lib/countries'
import type { Country } from '@/lib/types'

interface CountrySearchProps {
  onSelectCountry: (country: Country) => void
  visitedCountries: string[]
}

export function CountrySearch({ onSelectCountry, visitedCountries }: CountrySearchProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const filteredCountries = query.length > 0 
    ? searchCountries(query) 
    : countries

  const handleSelect = (country: Country) => {
    onSelectCountry(country)
    setQuery('')
    setIsOpen(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Search Countries
      </h2>
      
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for a country..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            className="bg-secondary pl-10 pr-8"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground"
              onClick={() => {
                setQuery('')
                setIsOpen(false)
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {isOpen && (
          <div className="absolute top-full z-50 mt-2 max-h-64 w-full overflow-y-auto rounded-lg border border-border bg-popover shadow-lg">
            {filteredCountries.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No countries found
              </div>
            ) : (
              filteredCountries.slice(0, 20).map((country) => (
                <button
                  key={country.code}
                  onClick={() => handleSelect(country)}
                  className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors hover:bg-accent"
                >
                  <span className="text-lg">{country.flag}</span>
                  <span className="flex-1 text-foreground">{country.name}</span>
                  {visitedCountries.includes(country.code) && (
                    <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
                      Visited
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Select a country to add memories or mark as visited
      </p>
    </div>
  )
}
