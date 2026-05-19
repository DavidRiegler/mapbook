'use client'

import { useState, useCallback } from 'react'
import { Search as SearchIcon, Map as MapIcon, List } from 'lucide-react'
import { WorldMap } from '@/components/world-map'
import { CountrySearch } from '@/components/country-search'
import { VisitedCountriesList } from '@/components/visited-countries-list'
import { MemoryDialog } from '@/components/memory-dialog'
import { getCountryByCode } from '@/lib/countries'
import type { Country, Memory } from '@/lib/types'

type MobileView = 'search' | 'map' | 'list'

interface CountriesPageProps {
  memories: Memory[]
  onAddMemory: (memory: Omit<Memory, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateMemory: (id: string, updates: Partial<Omit<Memory, 'id' | 'createdAt'>>) => void
  onDeleteMemory: (id: string) => void
}

export function CountriesPage({
  memories,
  onAddMemory,
  onUpdateMemory,
  onDeleteMemory,
}: CountriesPageProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeMobileView, setActiveMobileView] = useState<MobileView>('map')

  const visitedCountries = [...new Set(memories.map((m) => m.countryCode))]

  const dialogPreviousVisits = selectedCountry
    ? memories.filter(
        (m) => m.countryCode === selectedCountry.code && m.id !== editingMemory?.id
      )
    : []

  const handleCountrySelect = useCallback((country: Country) => {
    setSelectedCountry(country)
    setEditingMemory(null)
    setDialogOpen(true)
  }, [])

  const handleCountryClick = useCallback((countryCode: string) => {
    const country = getCountryByCode(countryCode)
    if (country) {
      handleCountrySelect(country)
    }
  }, [handleCountrySelect])

  const handleEditMemory = useCallback((memory: Memory) => {
    const country = getCountryByCode(memory.countryCode)
    setSelectedCountry(country || null)
    setEditingMemory(memory)
    setDialogOpen(true)
  }, [])

  const handleEditVisitInDialog = useCallback((memory: Memory) => {
    setEditingMemory(memory)
  }, [])

  const handleSave = useCallback((data: {
    description: string;
    images: string[];
    visitDate: string;
    rating: number;
    mood: Memory['mood'];
    weather: Memory['weather'];
  }) => {
    if (!selectedCountry) return

    if (editingMemory) {
      onUpdateMemory(editingMemory.id, {
        description: data.description,
        images: data.images,
        visitDate: data.visitDate,
        rating: data.rating,
        mood: data.mood,
        weather: data.weather
      })
    } else {
      onAddMemory({
        countryCode: selectedCountry.code,
        countryName: selectedCountry.name,
        description: data.description,
        images: data.images,
        visitDate: data.visitDate,
        rating: data.rating,
        mood: data.mood,
        weather: data.weather
      })
    }

    setDialogOpen(false)
    setSelectedCountry(null)
    setEditingMemory(null)
  }, [selectedCountry, editingMemory, onAddMemory, onUpdateMemory])

  const handleDelete = useCallback(() => {
    if (editingMemory) {
      onDeleteMemory(editingMemory.id)
      setDialogOpen(false)
      setSelectedCountry(null)
      setEditingMemory(null)
    }
  }, [editingMemory, onDeleteMemory])

  const mobileNavItems = [
    { id: 'search' as MobileView, icon: <SearchIcon className="h-5 w-5" />, label: 'Search' },
    { id: 'map' as MobileView, icon: <MapIcon className="h-5 w-5" />, label: 'Map' },
    { id: 'list' as MobileView, icon: <List className="h-5 w-5" />, label: 'Countries' },
  ]

  return (
    <div className="flex h-full flex-col">
      {/* Desktop: 3-column layout */}
      <div className="hidden md:flex md:h-full md:gap-6 md:p-6">
        <div className="w-72 shrink-0">
          <CountrySearch
            onSelectCountry={handleCountrySelect}
            visitedCountries={visitedCountries}
          />
        </div>

        <div className="flex-1 min-h-0">
          <WorldMap
            visitedCountries={visitedCountries}
            onCountryClick={handleCountryClick}
          />
        </div>

        <div className="flex w-80 shrink-0 flex-col">
          <VisitedCountriesList
            memories={memories}
            onEditMemory={handleEditMemory}
            onDeleteMemory={onDeleteMemory}
          />
        </div>
      </div>

      {/* Mobile: single active panel + bottom navigation */}
      <div className="flex flex-1 flex-col overflow-hidden md:hidden">
        <div className="flex flex-1 flex-col overflow-hidden p-4">
          {activeMobileView === 'search' && (
            <CountrySearch
              onSelectCountry={(country) => {
                handleCountrySelect(country)
                setActiveMobileView('map')
              }}
              visitedCountries={visitedCountries}
            />
          )}
          {activeMobileView === 'map' && (
            <WorldMap
              visitedCountries={visitedCountries}
              onCountryClick={handleCountryClick}
            />
          )}
          {activeMobileView === 'list' && (
            <VisitedCountriesList
              memories={memories}
              onEditMemory={handleEditMemory}
              onDeleteMemory={onDeleteMemory}
            />
          )}
        </div>

        <nav className="flex border-t border-border bg-card">
          {mobileNavItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveMobileView(item.id)}
              className={`flex flex-1 flex-col items-center gap-1 px-4 py-3 text-xs font-medium transition-colors ${
                activeMobileView === item.id
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <MemoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        country={selectedCountry}
        editingMemory={editingMemory}
        previousVisits={dialogPreviousVisits}
        onSave={handleSave}
        onDelete={editingMemory ? handleDelete : undefined}
        onEditVisit={handleEditVisitInDialog}
        onDeleteVisit={onDeleteMemory}
      />
    </div>
  )
}
